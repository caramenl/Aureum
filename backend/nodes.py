import os
import json
import re
import io
from google import genai
from google.genai import types
from pypdf import PdfReader

from state import AgentState
from models import AuditRequirement, AuditResult
from memory import MoorchehMemoryManager

api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)
memory_manager = MoorchehMemoryManager()

def _extract_text_locally(pdf_bytes):
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        return " ".join([page.extract_text() or "" for page in reader.pages])
    except:
        return ""

def check_cache_node(state: AgentState):
    # Semantic Search: Use the text meaning rather than file hash
    policy_text = _extract_text_locally(state["policy_pdf_bytes"])
    cached = memory_manager.get_cached_policy(policy_text)
    
    return {
        "extracted_requirements": cached if cached else [],
        "next_step": "redact_pii" if cached else "parse_policy"
    }

def parse_policy_node(state: AgentState):
    policy_doc = types.Part.from_bytes(data=state["policy_pdf_bytes"], mime_type="application/pdf")
    
    prompt = "Extract clinical requirements as JSON: 'description', 'is_met': false, 'page_number': null."
    
    # Using 1.5-flash-8b for maximum extraction speed
    response = client.models.generate_content(
        model='gemini-1.5-flash-8b',
        contents=[policy_doc, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0
        ),
    )
    
    try:
        requirements = [AuditRequirement(**req) for req in json.loads(response.text)]
        # Save to semantic cache using the text as the anchor
        policy_text = _extract_text_locally(state["policy_pdf_bytes"])
        memory_manager.save_policy_to_cache(policy_text, requirements)
    except:
        requirements = []

    return {"extracted_requirements": requirements, "next_step": "redact_pii"}

def redact_pii_node(state: AgentState):
    # LOCAL ONLY: Avoids LLM latency for PII
    raw_text = _extract_text_locally(state["patient_record_bytes"])
    redacted = re.sub(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', "[NAME]", raw_text)
    redacted = re.sub(r'\d{3}-\d{2}-\d{4}|\d{2}/\d{2}/\d{4}', "[DATE/ID]", redacted)
    
    return {"medical_records_text": redacted, "next_step": "evaluate_patient"}

def evaluate_patient_node(state: AgentState):
    req_json = json.dumps([r.model_dump() for r in state["extracted_requirements"]])
    patient_doc = types.Part.from_bytes(data=state["patient_record_bytes"], mime_type="application/pdf")
    
    prompt = f"Audit records against these rules: {req_json}. Return JSON: 'updated_requirements' (with page_number & evidence_snippet), 'final_justification', 'confidence_score'."
    
    # 8B model handles high-volume token processing faster
    response = client.models.generate_content(
        model='gemini-1.5-flash-8b',
        contents=[patient_doc, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0
        ),
    )
    
    try:
        data = json.loads(response.text)
        return {
            "extracted_requirements": [AuditRequirement(**r) for r in data["updated_requirements"]],
            "final_justification": data["final_justification"],
            "status": "AUDITED",
            "confidence_score": data.get("confidence_score", 0.5),
            "next_step": "critic_verify"
        }
    except:
        return {"status": "ERROR", "next_step": "end"}

def critic_verify_node(state: AgentState):
    reqs = state["extracted_requirements"]
    raw_text = state.get("medical_records_text", "").lower()
    
    # Verify exact string matching to prevent hallucinations
    for r in reqs:
        if r.evidence_snippet and r.evidence_snippet.lower() not in raw_text:
            r.is_verified = False # Flag for manual check if snippet doesn't exist
        else:
            r.is_verified = True

    return {
        "extracted_requirements": reqs,
        "status": "COMPLETED_VERIFIED",
        "next_step": "end"
    }