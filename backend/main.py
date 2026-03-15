import os
import json
import asyncio
import time
from datetime import datetime
from dotenv import load_dotenv

# Load env immediately at top level
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# Import your graph and state
from state import AgentState
from graph import build_audit_graph
from models import AuditResult
from nodes import memory_manager

app = FastAPI(title="Aureum Intelligence API")

# Middleware for Next.js communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

audit_graph = build_audit_graph()

@app.get("/")
def root():
    return {"message": "Aureum Streaming Backend is running"}

@app.post("/api/audit-stream")
async def audit_stream(
    patient_id: str = Form(...),
    policy_pdf: UploadFile = File(...),
    patient_record: UploadFile = File(...)
):
    # Security Check
    if not (policy_pdf.filename.endswith('.pdf') and patient_record.filename.endswith('.pdf')):
        raise HTTPException(status_code=400, detail="Invalid file type. PDFs required.")

    # Read bytes
    policy_bytes = await policy_pdf.read()
    patient_bytes = await patient_record.read()

    async def event_generator():
        # Initialize State
        initial_state = AgentState(
            patient_id=patient_id,
            policy_pdf_bytes=policy_bytes,
            patient_record_bytes=patient_bytes,
            policy_hash="",
            cached_requirements=None,
            extracted_requirements=[],
            final_justification="",
            status="INITIALIZING",
            next_step="",
            retry_count=0,
            medical_records_text="",
            treatment_history=[],
            confidence_score=0.0
        )
        
        start_time = time.time()
        try:
            current_state = initial_state.copy()
            # Stream Mode: Updates sends partial state as nodes finish
            async for step in audit_graph.astream(initial_state, stream_mode="updates"):
                for node_name, state_update in step.items():
                    current_state.update(state_update)
                    # Format the node name for UI display
                    ui_msg = node_name.replace("_", " ").upper()
                    
                    # Prepare payload
                    payload = {
                        "node": node_name,
                        "msg": ui_msg,
                        "update": {
                            "justification": state_update.get("final_justification"),
                            "confidence": state_update.get("confidence_score")
                        }
                    }
                    
                    yield f"data: {json.dumps(payload)}\n\n"
                    await asyncio.sleep(0.05) # Keep UI smooth

            # Determine Clinical Verdict
            reqs = current_state.get("extracted_requirements", [])
            any_denials = any(r.is_met == False and r.is_applicable != False for r in reqs)
            clinical_verdict = "DENIED" if any_denials else "APPROVED"
            
            runtime = round(time.time() - start_time, 1)

            audit_result_model = AuditResult(
                patient_id=current_state.get("patient_id", patient_id),
                policy_name=policy_pdf.filename,
                status=clinical_verdict,
                requirements=reqs,
                final_justification=current_state.get("final_justification", "Audit finished"),
                treatment_history=current_state.get("treatment_history", []),
                confidence_score=current_state.get("confidence_score", 1.0),
                manual_review_required=current_state.get("confidence_score", 1.0) < 0.7,
                entry_date=datetime.utcnow().isoformat() + "Z"
            )
            # Add timestamp to dump for sorting
            result_dump = audit_result_model.model_dump()
            result_dump["_timestamp"] = time.time()  # Epoch for easy sorting
            result_dump["runtime"] = runtime # Also save runtime in history
            
            # Add to Intelligence Layer Long-Term Memory (BLOCKING to avoid race condition)
            yield f"data: {json.dumps({'node': 'save_history', 'msg': '📦 PERMANENTLY ARCHIVING AUDIT...'})}\n\n"
            memory_manager.add_audit_to_history(patient_id, result_dump, background=False)
            
            end_payload = json.dumps({
                "node": "END",
                "update": {
                    "status": clinical_verdict,
                    "confidence_score": audit_result_model.confidence_score,
                    "runtime": runtime,
                    "policy_name": policy_pdf.filename,
                    "req_count": len(audit_result_model.requirements),
                    "justification": audit_result_model.final_justification,
                    "treatment_history": [t.model_dump() for t in audit_result_model.treatment_history],
                    "requirements": [r.model_dump() for r in audit_result_model.requirements]
                }
            })
            yield f"data: {end_payload}\n\n"
            
        except Exception as e:
            error_msg = {"node": "ERROR", "msg": f"SYSTEM FAILURE: {str(e)}"}
            yield f"data: {json.dumps(error_msg)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/history/{patient_id}")
async def get_history(patient_id: str):
    """Retrieve all past audits for a given patient from Moorcheh."""
    history = memory_manager.get_patient_history(patient_id)
    return {"history": history}

@app.get("/api/patterns")
async def get_denial_patterns():
    """Intelligence Layer: Which insurance rules are causing the most denials across all patients?"""
    patterns = memory_manager.get_denial_patterns()
    return {"patterns": patterns}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)