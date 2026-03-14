import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from fastapi import Request 
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# 1. Initialize Limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Aureum Medical Auditing API")

# 2. Add the state and exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path, override=True)

from state import AgentState
from graph import build_audit_graph
from nodes import memory_manager

app = FastAPI(title="Aureum Medical Auditing API")
audit_graph = build_audit_graph()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Aureum Streaming Backend is running"}

import json
from models import AuditResult

@app.post("/api/audit-stream")
async def audit_stream(
    patient_id: str = Form(...),
    policy_pdf: UploadFile = File(...),
    patient_record: UploadFile = File(...)
):
    if not (policy_pdf.filename.endswith('.pdf') and patient_record.filename.endswith('.pdf')):
        raise HTTPException(status_code=400, detail="Please upload valid PDF documents.")

    policy_bytes = await policy_pdf.read()
    patient_bytes = await patient_record.read()

    async def event_generator():
        initial_state = AgentState(
            patient_id=patient_id,
            policy_pdf_bytes=policy_bytes,
            patient_record_bytes=patient_bytes,
            policy_hash="",
            cached_requirements=None,
            extracted_requirements=[],
            final_justification="",
            status="STARTING",
            next_step="",
            retry_count=0,
            medical_records_text="",
            confidence_score=1.0
        )
        
        try:
            current_state = initial_state.copy()
            for step in audit_graph.stream(initial_state):
                for node_name, state_update in step.items():
                    current_state.update(state_update)
                    payload = json.dumps({"node": node_name})
                    yield f"data: {payload}\n\n"
                    
            if not current_state:
                raise Exception("Graph returned no state.")

            audit_result_model = AuditResult(
                patient_id=current_state.get("patient_id", patient_id),
                policy_name=policy_pdf.filename,
                status=current_state.get("status", "SUCCESS"),
                requirements=current_state.get("extracted_requirements", []),
                final_justification=current_state.get("final_justification", "Audit finished"),
                confidence_score=current_state.get("confidence_score", 1.0),
                manual_review_required=current_state.get("confidence_score", 1.0) < 0.7
            )
            # Add to Intelligence Layer Long-Term Memory
            memory_manager.add_audit_to_history(patient_id, audit_result_model.model_dump())
            
            end_payload = json.dumps({
                "node": "END",
                "update": {
                    "status": "COMPLETED",
                    "req_count": len(audit_result_model.requirements),
                    "justification": audit_result_model.final_justification
                }
            })
            yield f"data: {end_payload}\n\n"
            
        except Exception as e:
            error_payload = json.dumps({"node": "ERROR", "error": str(e)})
            yield f"data: {error_payload}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/patterns")
@limiter.limit("10/minute")
async def get_denial_patterns(request: Request):
    """Intelligence Layer: Which insurance rules are causing the most denials across all patients?"""
    patterns = memory_manager.get_denial_patterns()
    return {"patterns": patterns}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)