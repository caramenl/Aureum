import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path, override=True)

from models import AuditResult
from state import AgentState
from graph import build_audit_graph
audit_graph = build_audit_graph()

app = FastAPI(title="Aureum Medical Auditing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/audit-upload", response_model=AuditResult)
async def upload_and_audit(
    patient_id: str,
    policy_pdf: UploadFile = File(..., description="The Medical Policy PDF"),
    patient_record: UploadFile = File(..., description="The Patient Medical Record PDF")
):
    if not policy_pdf.filename.endswith('.pdf') or not patient_record.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are currently supported")

    policy_bytes = await policy_pdf.read()
    patient_bytes = await patient_record.read()

    initial_state = AgentState(
        patient_id=patient_id,
        policy_pdf_bytes=policy_bytes,
        patient_record_bytes=patient_bytes,
        policy_hash="",
        cached_requirements=None,
        extracted_requirements=[],
        final_justification="",
        status="STARTING",
        next_step=""
    )
    
    final_state = audit_graph.invoke(initial_state)
    
    result = AuditResult(
        patient_id=final_state["patient_id"],
        policy_name=policy_pdf.filename,
        status=final_state.get("status", "ERROR"),
        requirements=final_state.get("extracted_requirements", []),
        final_justification=final_state.get("final_justification", "Processing failed")
    )
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)