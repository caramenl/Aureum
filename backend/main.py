import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path, override=True)

from models import AuditResult
from state import AgentState
from graph import build_audit_graph
from nodes import memory_manager

app = FastAPI(title="Aureum Medical Auditing API")
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
audit_graph = build_audit_graph()

audit_jobs = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Aureum backend is running", "docs": "/docs"}

@app.post("/api/audit-upload", status_code=202)
@limiter.limit("5/minute")
async def upload_and_audit(
    request: Request,
    background_tasks: BackgroundTasks,
    patient_id: str,
    policy_pdf: UploadFile = File(...),
    patient_record: UploadFile = File(...)
):
    if not (policy_pdf.filename.endswith('.pdf') and patient_record.filename.endswith('.pdf')):
        raise HTTPException(status_code=400, detail="Please upload valid PDF documents.")

    policy_bytes = await policy_pdf.read()
    patient_bytes = await patient_record.read()

    job_id = str(uuid.uuid4())
    audit_jobs[job_id] = {"status": "Processing", "result": None}

    def run_workflow(jid: str, pid: str, pol_b: bytes, pat_b: bytes):
        try:
            initial_state = AgentState(
                patient_id=pid,
                policy_pdf_bytes=pol_b,
                patient_record_bytes=pat_b,
                policy_hash="",
                cached_requirements=None,
                extracted_requirements=[],
                final_justification="",
                status="STARTING",
                next_step="",
                retry_count=0  # For the Self-Healing loop
            )
            
            final_state = audit_graph.invoke(initial_state)
            
            audit_result_model = AuditResult(
                patient_id=final_state["patient_id"],
                policy_name=policy_pdf.filename,
                status=final_state.get("status", "SUCCESS"),
                requirements=final_state.get("extracted_requirements", []),
                final_justification=final_state.get("final_justification", "Audit finished."),
                confidence_score=final_state.get("confidence_score", 1.0),
                manual_review_required=final_state.get("confidence_score", 1.0) < 0.7
            )
            
            # --- INTELLIGENCE LAYER: Save to Moorcheh Long-Term Memory ---
            memory_manager.add_audit_to_history(pid, audit_result_model.model_dump())
            
            audit_jobs[jid] = {
                "status": "COMPLETED",
                "result": audit_result_model
            }
        except Exception as e:
            audit_jobs[jid] = {"status": "FAILED", "error": str(e)}
    background_tasks.add_task(run_workflow, job_id, patient_id, policy_bytes, patient_bytes)

    return {
        "job_id": job_id, 
        "message": "Audit started successfully",
        "status_url": f"/v1/status/{job_id}"
    }

@app.get("/v1/status/{job_id}")
@limiter.limit("60/minute")
async def get_audit_status(request: Request, job_id: str):
    job = audit_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job ID not found")
    return job

@app.get("/api/patterns")
@limiter.limit("10/minute")
async def get_denial_patterns(request: Request):
    """Intelligence Layer: Which insurance rules are causing the most denials across all patients?"""
    patterns = memory_manager.get_denial_patterns()
    return {"patterns": patterns}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)