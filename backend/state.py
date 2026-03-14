
from typing import TypedDict, List, Optional

class AgentState(TypedDict):
    patient_id: str
    policy_text: str          
    medical_records: str    
    identified_gaps: List[str] 
    status: str               
    final_justification: str 