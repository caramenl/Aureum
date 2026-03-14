import operator
from typing import Annotated, TypedDict, List, Optional
from models import AuditRequirement, AuditResult

class AgentState(TypedDict):
    patient_id: str
    
    # Raw File Data
    policy_pdf_bytes: bytes
    patient_record_bytes: bytes
    
    # Moorcheh Hashing & Cache
    policy_hash: str
    cached_requirements: Optional[List[AuditRequirement]]
    
    # LLM Extracted Data
    extracted_requirements: List[AuditRequirement]
    
    # Final Result
    final_justification: str
    status: str
    
    # LangGraph Error/Routing Control
    next_step: str