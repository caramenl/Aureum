from pydantic import BaseModel, Field
from typing import List, Optional

class AuditRequirement(BaseModel):
    requirement_id: str = Field(..., description="Unique identifier for the policy requirement")
    description: str = Field(..., description="The text of the rule or requirement being audited")
    is_met: bool = Field(..., description="Whether the patient records satisfy this requirement")
    is_applicable: bool = Field(True, description="Whether this requirement applies to the patient's specific indication")
    category: Optional[str] = Field(None, description="The indication or clinical category this rule belongs to (e.g., Plaque Psoriasis)")
    page_number: Optional[int] = Field(None, description="Page number in the patient record PDF for AI grounding")
    evidence_snippet: Optional[str] = Field(None, description="A short direct quote from the record as evidence")
    bridge_action: Optional[str] = Field(None, description="Actionable advice for the user if the requirement is not met")
    is_verified: bool = Field(False, description="Human-in-the-loop validation boolean. Defaults to False.")
    hallucination_risk: bool = Field(False, description="Flagged by Critic Node if evidence snippet is not verbatim in source text")

class AuditResult(BaseModel):
    patient_id: str
    policy_name: str = Field(..., description="Name of the audited policy")
    status: str = Field(..., description="Overall status: APPROVED, DENIED, or PENDING_REVIEW")
    requirements: List[AuditRequirement]
    final_justification: str = Field(..., description="1-paragraph summary of the final AI decision")
    confidence_score: float = Field(1.0, description="AI confidence score for the overall audit")
    manual_review_required: bool = Field(False, description="Triggered if confidence score is low")
    entry_date: Optional[str] = Field(None, description="ISO timestamp of the audit")
