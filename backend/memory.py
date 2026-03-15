import os
import json
import uuid
import threading
import requests
from typing import List, Optional
from models import AuditRequirement

# Moorcheh API Reference:
# Auth:    x-api-key header (NOT Authorization: Bearer)
# Upload:  POST /v1/namespaces/{ns}/documents  {"documents":[{"id":…,"text":…,…metadata}]}
# Search:  POST /v1/search  {"query":…,"namespaces":[…],"top_k":…,"threshold":…}
# Results: {"results":[{"id","score","text","metadata"}]}

class MoorchehMemoryManager:
    def __init__(self):
        self.api_key = os.getenv("MOORCHEH_API_KEY")
        self.base_url = "https://api.moorcheh.ai/v1"
        self.headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        self.policy_ns   = "aureum-policy-cache"
        self.history_ns  = "aureum-patient-history"
        self.patterns_ns = "aureum-denial-patterns"
        self._ensure_namespaces()

    def _ensure_namespaces(self):
        """Create the three Aureum namespaces in parallel if they don't exist yet."""
        def create(ns):
            try:
                requests.post(
                    f"{self.base_url}/namespaces",
                    headers=self.headers,
                    json={"namespace_name": ns, "type": "text"},
                    timeout=8
                )
            except Exception:
                pass
        threads = [threading.Thread(target=create, args=(ns,)) for ns in [self.policy_ns, self.history_ns, self.patterns_ns]]
        for t in threads: t.start()
        for t in threads: t.join()

    # ── Semantic Policy Cache ─────────────────────────────────────────────────

    def get_cached_policy(self, policy_text: str) -> Optional[List[AuditRequirement]]:
        """Search Moorcheh for a semantically similar policy already parsed."""
        try:
            r = requests.post(
                f"{self.base_url}/search",
                headers=self.headers,
                json={
                    "query": policy_text[:500],  # short focused query — faster to embed
                    "namespaces": [self.policy_ns],
                    "top_k": 1,
                    "threshold": 0.65
                },
                timeout=10
            )
            if r.status_code == 200:
                results = r.json().get("results", [])
                if results:
                    score = results[0].get("score", 0)
                    print(f"[Moorcheh] Semantic Cache HIT (score={score:.2f})")
                    raw = results[0].get("metadata", {}).get("requirements", "[]")
                    return [AuditRequirement(**req) for req in json.loads(raw)]
        except Exception as e:
            print(f"[Moorcheh] Cache lookup error: {e}")
        return None

    def save_policy_to_cache(self, policy_text: str, requirements: List[AuditRequirement]):
        """Upload parsed policy requirements to Moorcheh for future semantic retrieval."""
        try:
            serialized = json.dumps([req.model_dump() for req in requirements])
            r = requests.post(
                f"{self.base_url}/namespaces/{self.policy_ns}/documents",
                headers=self.headers,
                json={"documents": [{
                    "id": str(uuid.uuid4()),
                    "text": policy_text[:5000],
                    "requirements": serialized
                }]},
                timeout=10
            )
            if r.status_code not in (200, 201, 202):
                print(f"[Moorcheh] Cache save warning: {r.status_code} {r.text[:200]}")
        except Exception as e:
            print(f"[Moorcheh] Cache save error: {e}")

    # ── Patient Audit History ─────────────────────────────────────────────────

    def get_patient_history(self, patient_id: str) -> Optional[list]:
        """Search Moorcheh for all past audits for a given patient."""
        try:
            r = requests.post(
                f"{self.base_url}/search",
                headers=self.headers,
                json={
                    "query": patient_id, # Targeted ID search is more precise than semantic sentences
                    "namespaces": [self.history_ns],
                    "top_k": 50,
                    "threshold": 0.1 # Very inclusive - we filter by ID manually below
                },
                timeout=10
            )
            if r.status_code == 200:
                results = r.json().get("results", [])
                history = [
                    json.loads(item["metadata"]["audit_data"])
                    for item in results
                    if item.get("metadata", {}).get("patient_id") == patient_id
                ]
                # Chronological Sorting (Newest First using epoch timestamp)
                history.sort(key=lambda x: x.get("_timestamp", 0), reverse=True)
                return history
        except Exception:
            pass
        return []

    def get_dashboard_stats(self):
        """Aggregate stats across all patient audits."""
        try:
            r = requests.post(
                f"{self.base_url}/search",
                headers=self.headers,
                json={
                    "query": "audit patient medical insurance", # Broad search for all history
                    "namespaces": [self.history_ns],
                    "top_k": 100,
                    "threshold": 0.05
                },
                timeout=10
            )
            if r.status_code == 200:
                results = r.json().get("results", [])
                all_audits = [json.loads(item["metadata"]["audit_data"]) for item in results]
                
                total = len(all_audits)
                if total == 0:
                    return {"total_claims": 0, "approval_rate": 0, "provider_stats": [], "doc_gap": 0}

                approvals = len([a for a in all_audits if a.get("status") == "APPROVED"])
                gaps = len([a for a in all_audits if a.get("manual_review_required") == True])
                
                # Group by Provider (using policy_name)
                providers = {}
                for a in all_audits:
                    p = a.get("policy_name", "Unknown Provider")
                    if p not in providers: providers[p] = {"total": 0, "approved": 0}
                    providers[p]["total"] += 1
                    if a.get("status") == "APPROVED": providers[p]["approved"] += 1
                
                provider_stats = [
                    {"name": k, "rate": round(v["approved"]/v["total"] * 100, 1), "total": v["total"]}
                    for k, v in providers.items()
                ]
                
                return {
                    "total_claims": total,
                    "approval_rate": round(approvals / total * 100, 1),
                    "doc_gap": round(gaps / total * 100, 1),
                    "provider_stats": sorted(provider_stats, key=lambda x: x["total"], reverse=True)
                }
        except Exception as e:
            print(f"Stats Error: {e}")
        return {"total_claims": 0, "approval_rate": 0, "provider_stats": [], "doc_gap": 0}

    def add_audit_to_history(self, patient_id: str, audit_result: dict, background: bool = True):
        """Persist an audit result to Moorcheh. By default runs in a background thread."""
        def _save():
            try:
                status = audit_result.get("status", "UNKNOWN")
                r = requests.post(
                    f"{self.base_url}/namespaces/{self.history_ns}/documents",
                    headers=self.headers,
                    json={"documents": [{
                        "id": str(uuid.uuid4()),
                        "text": f"Audit for patient {patient_id}: {status}",
                        "patient_id": patient_id,
                        "audit_data": json.dumps(audit_result)
                    }]},
                    timeout=10
                )
                if r.status_code not in (200, 201, 202):
                    print(f"[Moorcheh] History save warning: {r.status_code} {r.text[:200]}")
                self._update_global_patterns(audit_result)
            except Exception as e:
                print(f"[Moorcheh] History save error: {e}")
        
        if background:
            threading.Thread(target=_save, daemon=True).start()
        else:
            _save()

    # ── Denial Pattern Recognition ────────────────────────────────────────────

    def _update_global_patterns(self, audit_result: dict):
        """Store each unmet requirement as a document for pattern aggregation."""
        try:
            docs = []
            for req in audit_result.get("requirements", []):
                if not req.get("is_met", True):
                    desc = req.get("description", "Unknown Rule")
                    docs.append({
                        "id": str(uuid.uuid4()),
                        "text": f"Denied rule: {desc}",
                        "rule": desc
                    })
            if docs:
                requests.post(
                    f"{self.base_url}/namespaces/{self.patterns_ns}/documents",
                    headers=self.headers,
                    json={"documents": docs},
                    timeout=10
                )
        except Exception:
            pass

    def get_denial_patterns(self):
        """Retrieve the top insurance rules causing denials across all patients."""
        try:
            r = requests.post(
                f"{self.base_url}/search",
                headers=self.headers,
                json={
                    "query": "denied insurance coverage requirement rule",
                    "namespaces": [self.patterns_ns],
                    "top_k": 50,
                    "threshold": 0.5
                },
                timeout=10
            )
            if r.status_code == 200:
                from collections import Counter
                results = r.json().get("results", [])
                rules = [item.get("metadata", {}).get("rule", "") for item in results if item.get("metadata", {}).get("rule")]
                counts = Counter(rules)
                return [{"rule": k, "denial_count": v} for k, v in counts.most_common(10)]
        except Exception as e:
            print(f"[Moorcheh] Patterns error: {e}")
        return []

    def reset_all_data(self):
        """Wipe all history for a fresh environment."""
        for ns in [self.history_ns, self.patterns_ns]:
            try:
                requests.delete(f"{self.base_url}/namespaces/{ns}", headers=self.headers, timeout=10)
            except:
                pass
        self._ensure_namespaces()