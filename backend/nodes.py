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
    # Extract text locally first — sending PDF bytes causes Gemini to extract
    # the full document structure (nested dict) instead of a flat requirements list.
    policy_text = _extract_text_locally(state["policy_pdf_bytes"])

    prompt = f"""You are a medical insurance auditor. Read the insurance policy text below.
Extract every specific clinical coverage requirement a patient must satisfy to qualify for coverage.

Insurance Policy Text:
{policy_text[:8000]}

Return a JSON ARRAY only. Each element must have EXACTLY these fields:
- "requirement_id": string (e.g., "REQ-001", "REQ-002")  <-- ADD THIS
- "description": string (one specific requirement)
- "is_met": false
- "page_number": null

Example: [{{"requirement_id": "REQ-001", "description": "Patient must have tried and failed at least one conventional systemic therapy", "is_met": false, "page_number": null}}]
Return ONLY the JSON array. No markdown, no explanation."""

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0
        ),
    )

    try:
        raw_text = response.text
        if raw_text.startswith('```'):
            raw_text = raw_text.replace('```json\n', '').replace('```', '').strip()
        parsed = json.loads(raw_text)
        # Gemini sometimes wraps the array in a dict — unwrap it
        if isinstance(parsed, dict):
            lists = [v for v in parsed.values() if isinstance(v, list)]
            parsed = lists[0] if lists else []
        requirements = [AuditRequirement(**req) for req in parsed]
        # Save to semantic cache using the text as the anchor
        memory_manager.save_policy_to_cache(policy_text, requirements)
    except Exception as e:
        print(f"PARSE JSON ERROR: {e}\nRAW LLM TEXT: {response.text}")
        requirements = []

    return {"extracted_requirements": requirements}

def redact_pii_node(state: AgentState):
    # LOCAL ONLY: Avoids LLM latency for PII
    raw_text = _extract_text_locally(state["patient_record_bytes"])
    redacted = re.sub(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', "[NAME]", raw_text)
    redacted = re.sub(r'\d{3}-\d{2}-\d{4}|\d{2}/\d{2}/\d{4}', "[DATE/ID]", redacted)
    
    return {"medical_records_text": redacted}

def evaluate_patient_node(state: AgentState):
    req_json = json.dumps([r.model_dump() for r in state["extracted_requirements"]])
    patient_doc = types.Part.from_bytes(data=state["patient_record_bytes"], mime_type="application/pdf")
    
    prompt = f"""You are an expert insurance auditor. Review the patient record PDF and determine if each policy requirement below is satisfied.

Policy requirements to audit:
{req_json}

Return a JSON OBJECT with EXACTLY these fields:
- "updated_requirements": array of requirements (include the "requirement_id", "description", "is_met", "page_number", and "evidence_snippet")
- "final_justification": 2-3 sentence summary of overall audit outcome
- "confidence_score": number 0.0-1.0

Example format:
{{"updated_requirements": [{{"requirement_id": "REQ-001", "description": "...", "is_met": true, "page_number": 2, "evidence_snippet": "exact quote from record"}}], "final_justification": "Patient meets X of Y requirements...", "confidence_score": 0.9}}
Return ONLY the JSON object. No markdown, no explanation."""
    
    # 8B model handles high-volume token processing faster
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[patient_doc, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0
        ),
    )
    
    try:
        raw_text = response.text
        if raw_text.startswith('```json'):
            raw_text = raw_text.replace('```json\n', '').replace('```', '').strip()
        data = json.loads(raw_text)
        return {
            "extracted_requirements": [AuditRequirement(**r) for r in data["updated_requirements"]],
            "final_justification": data["final_justification"],
            "status": "AUDITED",
            "confidence_score": data.get("confidence_score", 0.5),
            "next_step": "critic_verify"
        }
    except Exception as e:
        print(f"EVALUATE JSON ERROR: {e}\nRAW LLM TEXT: {response.text}")
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
        "next_step": "predict_denials"
    }

def denial_predictor_node(state: AgentState):
    """Predicts denials and generates actionable 'Bridge Actions' for unmet requirements."""
    unmet = [r for r in state["extracted_requirements"] if not r.is_met]
    
    if not unmet:
        return {"status": "COMPLETED_CLEAN"}

    unmet_json = json.dumps([r.model_dump() for r in unmet])
    
    prompt = f"""You are a medical billing and prior authorization consultant. 
The following insurance policy requirements were NOT met by the patient's current records:
{unmet_json}

For each unmet requirement, generate a 'Bridge Action'. 
A Bridge Action is a specific, actionable task the provider's office can take to solve the gap (e.g., 'Request pharmacy records from 2024', 'Schedule a follow-up for a physical exam', 'Upload recent lab results').

Return a JSON ARRAY of objects. Each object must have:
- "requirement_id": string (the exact ID from the input)
- "bridge_action": string (the helpful advice)

Return ONLY the JSON array. No markdown, no explanation."""

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0
        ),
    )

    try:
        raw_text = response.text
        if raw_text.startswith('```'):
            raw_text = raw_text.replace('```json\n', '').replace('```', '').strip()
        predictions = json.loads(raw_text)
        
        # Merge bridge actions back into state
        updated_reqs = []
        bridge_map = {p["requirement_id"]: p["bridge_action"] for p in predictions}
        
        for r in state["extracted_requirements"]:
            if r.requirement_id in bridge_map:
                r.bridge_action = bridge_map[r.requirement_id]
            updated_reqs.append(r)
            
        return {
            "extracted_requirements": updated_reqs,
            "status": "COMPLETED_PREDICTED"
        }
    except Exception as e:
        print(f"DENIAL PREDICTOR ERROR: {e}\nRAW: {response.text}")
        return {"status": "COMPLETED_VERIFIED"}