import os
import json
import re
from google import genai
from google.genai import types

from state import AgentState
from models import AuditRequirement, AuditResult
from memory import MoorchehMemoryManager

api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)
memory_manager = MoorchehMemoryManager()


import io
from pypdf import PdfReader

def _extract_text_for_redaction(pdf_bytes):
    """Extract text locally for String-Matching Groundedness Verification and PII."""
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted: text += extracted + " "
        return text
    except Exception as e:
        print(f"PDF local text extraction failed: {e}")
        return ""


def check_cache_node(state: AgentState):
    """Intelligence Layer: Check Moorcheh for existing policy audits"""
    policy_hash = memory_manager.get_file_hash(state["policy_pdf_bytes"])
    cached = memory_manager.get_cached_policy(policy_hash)
    
    next_step = "redact_pii" if cached else "parse_policy"
    
    return {
        "policy_hash": policy_hash,
        "extracted_requirements": cached if cached else [],
        "next_step": next_step
    }

def parse_policy_node(state: AgentState):
    """Intelligence Layer: Extract structured rules from Policy PDF"""
    policy_doc = types.Part.from_bytes(data=state["policy_pdf_bytes"], mime_type="application/pdf")
    
    prompt = """
    Analyze this Insurance Policy PDF. 
    Extract clinical requirements into a list of JSON objects with:
    'description', 'is_met' (default false), and 'page_number' (null).
    """
    
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents=[policy_doc, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0
        ),
    )
    
    try:
        parsed_json = json.loads(response.text)
        requirements = [AuditRequirement(**req) for req in parsed_json]
        memory_manager.save_policy_to_cache(state["policy_hash"], requirements)
    except:
        requirements = []

    return {
        "extracted_requirements": requirements,
        "next_step": "redact_pii"
    }

def redact_pii_node(state: AgentState):
    """Safety Layer: Scrub PII before sending data to the cloud LLM"""
    raw_text = _extract_text_for_redaction(state["patient_record_bytes"])
    
    redacted = re.sub(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', "[PATIENT_NAME]", raw_text)
    redacted = re.sub(r'\d{3}-\d{2}-\d{4}', "[SSN_REDACTED]", redacted)
    
    return {
        "medical_records_text": redacted,
        "next_step": "evaluate_patient"
    }

def evaluate_patient_node(state: AgentState):
    """The 'Brain' Node: Audits the record against the requirements"""
    requirements = state["extracted_requirements"]
    patient_doc = types.Part.from_bytes(data=state["patient_record_bytes"], mime_type="application/pdf")
    req_json = json.dumps([r.model_dump() for r in requirements])
    
    prompt = f"""
    Review this Patient Record against these Policy Requirements:
    {req_json}
    
    Return a JSON object with:
    1. 'updated_requirements': The list with 'is_met' updated, the EXACT 'page_number', and a short EXACT quote as 'evidence_snippet'.
    2. 'final_justification': A clinical summary of the decision.
    3. 'confidence_score': 0.0 to 1.0.
    """
    
    response = client.models.generate_content(
        model='gemini-1.5-flash',
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
    """Self-Healing Layer: Verify groundedness and quality"""
    reqs = state["extracted_requirements"]
    raw_text = state.get("medical_records_text", "").lower()
    
    missing_citations = False
    
    for r in reqs:
        if r.is_met and (r.page_number is None):
            missing_citations = True
            
        # Groundedness Verification: String Match Hallucination Check!
        if r.evidence_snippet:
            clean_snippet = r.evidence_snippet.lower().strip()
            # If the exact snippet is not in the text, flag Hallucination
            if clean_snippet and clean_snippet not in raw_text:
                r.hallucination_risk = True
    
    is_low_confidence = state.get("confidence_score", 1.0) < 0.7

    if (missing_citations or is_low_confidence) and state.get("retry_count", 0) < 1:
        return {
            "retry_count": state.get("retry_count", 0) + 1,
            "next_step": "evaluate_patient",
            "status": "RE-AUDITING (Low Confidence/No Citations)"
        }

    return {
        "extracted_requirements": reqs,
        "status": "COMPLETED_VERIFIED",
        "next_step": "end"
    }