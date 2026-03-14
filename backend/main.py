import os
import json
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError(f"Could not find GOOGLE_API_KEY. Looked in: {env_path}")

from nodes import audit_medical_necessity
from state import AgentState

app = FastAPI()

def get_mock_data(filename: str):
    file_path = Path(__file__).parent / "mocks" / filename
    with open(file_path, "r") as f:
        return json.load(f)

@app.post("/audit")
async def run_audit(patient_id: str):
    policy = get_mock_data("policy_skyrizi.json")
    patient_data = get_mock_data(f"patient_{patient_id}.json")
    
    initial_state = AgentState(
        patient_id=patient_id,
        policy_text=policy["requirements"],
        medical_records=json.dumps(patient_data),
        identified_gaps=[],
        status="STARTING",
        final_justification=""
    )
    
    result = audit_medical_necessity(initial_state)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)