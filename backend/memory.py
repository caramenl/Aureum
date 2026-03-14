import os
import json
import requests
import numpy as np
from typing import List, Optional
from google import genai
from models import AuditRequirement

class MoorchehMemoryManager:
    def __init__(self):
        self.api_key = os.getenv("MOORCHEH_API_KEY")
        self.ai_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        self.base_url = "https://api.moorcheh.ai/v1/memory" 
        self.headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        self.policy_namespace = "semantic_policies"

    def get_semantic_fingerprint(self, text: str) -> List[float]:
        result = self.ai_client.models.embed_content(
            model="gemini-embedding-001",
            contents=text[:5000]
        )
        return result.embeddings[0].values

    def get_cached_policy(self, current_text: str) -> Optional[List[AuditRequirement]]:
        try:
            current_vector = self.get_semantic_fingerprint(current_text)
            response = requests.get(f"{self.base_url}/{self.policy_namespace}", headers=self.headers)
            
            if response.status_code == 200:
                stored_items = response.json().get('items', [])
                for item in stored_items:
                    stored_vector = item.get('metadata', {}).get('vector')

                    similarity = np.dot(current_vector, stored_vector) / (np.linalg.norm(current_vector) * np.linalg.norm(stored_vector))
                    
                    if similarity > 0.98: 
                        print(f"[Moorcheh] Semantic HIT: {similarity:.2f}")
                        return [AuditRequirement(**req) for req in json.loads(item['value'])]
            return None
        except Exception as e:
            print(f"[Moorcheh] Semantic Cache error: {e}")
            return None

    def save_policy_to_cache(self, text: str, requirements: List[AuditRequirement]):
        vector = self.get_semantic_fingerprint(text)
        serialized = json.dumps([req.model_dump() for req in requirements])
        payload = {"value": serialized, "metadata": {"vector": vector}}
        requests.post(f"{self.base_url}/{self.policy_namespace}", headers=self.headers, json=payload)

    def get_patient_history(self, patient_id: str) -> Optional[dict]:
        try:
            response = requests.get(f"{self.base_url}/patient_history/{patient_id}", headers=self.headers)
            if response.status_code == 200:
                data = response.json().get('value', '{}')
                return json.loads(data)
            return None
        except Exception:
            return None
        
    def add_audit_to_history(self, patient_id: str, audit_result: dict):
        try:
            history = self.get_patient_history(patient_id) or {"patient_id": patient_id, "audits": []}
            history["audits"].append(audit_result)
            requests.post(
                f"{self.base_url}/patient_history/{patient_id}", 
                headers=self.headers, 
                json={"value": json.dumps(history)}
            )
            self._update_global_patterns(audit_result)
        except Exception as e:
            print(f"[Moorcheh AI] Error updating patient history: {e}")

    def _update_global_patterns(self, audit_result: dict):
        """Aggregates denials across all patients for the Pattern Recognition endpoint."""
        try:
            response = requests.get(f"{self.base_url}/global/denial_patterns", headers=self.headers)
            patterns = {}
            if response.status_code == 200:
                patterns = json.loads(response.json().get('value', '{}'))
                
            for req in audit_result.get("requirements", []):
                # If a requirement is NOT met, it contributed to a denial/flag
                if not req.get("is_met", True):
                    desc = req.get("description", "Unknown Rule")
                    patterns[desc] = patterns.get(desc, 0) + 1
                    
            requests.post(
                f"{self.base_url}/global/denial_patterns", 
                headers=self.headers, 
                json={"value": json.dumps(patterns)}
            )
        except Exception:
            pass

    def get_denial_patterns(self):
        """Retrieves the top reasons for audit failures across the population."""
        try:
            response = requests.get(f"{self.base_url}/global/denial_patterns", headers=self.headers)
            if response.status_code == 200:
                patterns = json.loads(response.json().get('value', '{}'))
                # Sort by highest denial counts
                sorted_patterns = sorted(patterns.items(), key=lambda x: x[1], reverse=True)
                return [{"rule": k, "denial_count": v} for k, v in sorted_patterns]
            return []
        except Exception as e:
            print(f"[Moorcheh AI] Error fetching patterns: {e}")
            return []
