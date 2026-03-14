from pydantic import BaseModel, Field
from typing import List, Optional

class AuditRequirement(BaseModel):
    requirement_id: str = Field(..., description="Unique identifier for the policy requirement")
    description: str = Field(..., description="The text of the rule or requirement being audited")
    is_met: bool = Field(..., description="Whether the patient records satisfy this requirement")
    page_number: Optional[int] = Field(None, description="Page number in the patient record PDF for AI grounding")
    evidence_snippet: Optional[str] = Field(None, description="A short direct quote from the record as evidence")
    is_verified: bool = Field(False, description="Human-in-the-loop validation boolean. Defaults to False.")

class AuditResult(BaseModel):
    patient_id: str
    policy_name: str = Field(..., description="Name of the audited policy")
    status: str = Field(..., description="Overall status: APPROVED, DENIED, or PENDING_REVIEW")
    requirements: List[AuditRequirement]
    final_justification: str = Field(..., description="1-paragraph summary of the final AI decision")
