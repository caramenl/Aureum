import hashlib
import os
import json
import requests
from typing import List, Optional

from models import AuditRequirement

class MoorchehMemoryManager:
    def __init__(self):
        self.api_key = os.getenv("MOORCHEH_API_KEY")
        if not self.api_key:
            raise ValueError("MOORCHEH_API_KEY is missing from environment variables.")
        self.base_url = "https://api.moorcheh.ai/v1/memory" 
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.policy_namespace = "global_policies"

    def get_file_hash(self, file_content: bytes) -> str:
        return hashlib.sha256(file_content).hexdigest()

    def get_cached_policy(self, file_hash: str) -> Optional[List[AuditRequirement]]:
        try:
            response = requests.get(
                f"{self.base_url}/{self.policy_namespace}/{file_hash}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                print(f"[Moorcheh AI] Cache HIT for policy hash: {file_hash[:8]}")
                data = response.json().get('value', '[]')
                parsed_data = json.loads(data)
                return [AuditRequirement(**req) for req in parsed_data]
            else:
                print(f"[Moorcheh AI] Cache MISS for policy hash: {file_hash[:8]}")
                return None
        except Exception as e:
            print(f"[Moorcheh AI] Error checking cache: {e}")
            return None

    def save_policy_to_cache(self, file_hash: str, requirements: List[AuditRequirement]) -> bool:
        try:
            serialized_data = json.dumps([req.model_dump() for req in requirements])
            payload = {"value": serialized_data}
            
            response = requests.post(
                f"{self.base_url}/{self.policy_namespace}/{file_hash}",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code in [200, 201]:
                print(f"[Moorcheh AI] Saved {len(requirements)} policy rules to cache.")
                return True
            return False
        except Exception as e:
            print(f"[Moorcheh AI] Error saving to cache: {e}")
            return False

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
        except Exception as e:
            print(f"[Moorcheh AI] Error updating patient history: {e}")
