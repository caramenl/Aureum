import os
import json
from google import genai
from google.genai import types

from state import AgentState
from models import AuditRequirement, AuditResult
from memory import MoorchehMemoryManager

api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)
memory_manager = MoorchehMemoryManager()


def check_cache_node(state: AgentState):
    policy_hash = memory_manager.get_file_hash(state["policy_pdf_bytes"])
    cached = memory_manager.get_cached_policy(policy_hash)
    next_step = "evaluate_patient" if cached else "parse_policy"
    
    return {
        "policy_hash": policy_hash,
        "cached_requirements": cached,
        "next_step": next_step
    }


def parse_policy_node(state: AgentState):
    policy_doc = types.Part.from_bytes(data=state["policy_pdf_bytes"], mime_type="application/pdf")
    
    prompt = """
    You are an expert Medical Insurance Policy extractor.
    Analyze this policy document and extract the exact clinical requirements needed for approval.
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
    except Exception as e:
        print(f"Error parsing Gemini policy output: {e}")
        requirements = []
    memory_manager.save_policy_to_cache(state["policy_hash"], requirements)
    
    return {
        "extracted_requirements": requirements,
        "next_step": "evaluate_patient"
    }


def evaluate_patient_node(state: AgentState):
    requirements = state.get("cached_requirements") or state.get("extracted_requirements")
    patient_doc = types.Part.from_bytes(data=state["patient_record_bytes"], mime_type="application/pdf")
    req_json = json.dumps([r.model_dump() for r in requirements])
    
    prompt = f"""
    You are a Medical Insurance Auditor. 
    Review the attached Patient Medical Record (PDF) against these specific Policy Requirements:
    {req_json}
    
    For each requirement, determine if it is met.
    CRITICAL GROUNDING: You MUST extract the EXACT `page_number` where you found the evidence in the patient record PDF.
    CRITICAL SAFETY: Set `is_verified` to false initially (a human will review it later).
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
        final_result_dict = json.loads(response.text)
        reqs = [AuditRequirement(**r) for r in final_result_dict.get("requirements", [])]
    except Exception as e:
        print(f"Error parsing Gemini patient audit output: {e}")
        reqs = requirements
        final_result_dict = {"final_justification": "Error parsing LLM output", "status": "PENDING_REVIEW"}
    
    return {
        "extracted_requirements": reqs,
        "final_justification": final_result_dict.get("final_justification", ""),
        "status": final_result_dict.get("status", "PENDING_REVIEW"),
        "next_step": "end"
    }