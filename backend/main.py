import os
import json
import asyncio
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

# Import your graph and state
from state import AgentState
from graph import build_audit_graph

load_dotenv()

app = FastAPI(title="Aureum Intelligence API")

# Middleware for Next.js communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

audit_graph = build_audit_graph()

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
        initial_state = {
            "patient_id": patient_id,
            "policy_pdf_bytes": policy_bytes,
            "patient_record_bytes": patient_bytes,
            "extracted_requirements": [],
            "final_justification": "",
            "confidence_score": 0.0,
            "status": "INITIALIZING"
        }
        
        try:
            # Stream Mode: Updates sends partial state as nodes finish
            async for step in audit_graph.astream(initial_state, stream_mode="updates"):
                for node_name, state_update in step.items():
                    # Format the node name for UI display
                    ui_msg = node_name.replace("_", " ").upper()
                    
                    # Prepare payload
                    payload = {
                        "node": node_name,
                        "msg": ui_msg, # Added this for the logs
                        "update": {
                            # Match these keys exactly to your AgentState/AuditResult model
                            "justification": state_update.get("final_justification"),
                            "confidence": state_update.get("confidence_score")
                        }
                    }
                    
                    yield f"data: {json.dumps(payload)}\n\n"
                    await asyncio.sleep(0.05) # Keep UI smooth

            # Signal End of Stream
            yield f"data: {json.dumps({'node': 'END'})}\n\n"
            
        except Exception as e:
            error_msg = {"node": "ERROR", "msg": f"SYSTEM FAILURE: {str(e)}"}
            yield f"data: {json.dumps(error_msg)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)