import operator
from typing import Annotated, TypedDict, List, Optional
from models import AuditRequirement, AuditResult

class AgentState(TypedDict):
    patient_id: str
    policy_pdf_bytes: bytes
    patient_record_bytes: bytes
    policy_hash: str
    cached_requirements: Optional[List[AuditRequirement]]
    extracted_requirements: List[AuditRequirement]
    final_justification: str
    status: str
    next_step: str
    retry_count: int
    medical_records_text: str
    confidence_score: float