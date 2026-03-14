import os
from langchain_google_genai import ChatGoogleGenerativeAI
from state import AgentState

# Just grab the key that main.py loaded
api_key = os.getenv("GOOGLE_API_KEY")

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=api_key,
    temperature=0
)

def audit_medical_necessity(state: AgentState):
    prompt = f"""
    You are a Medical Insurance Auditor. 
    POLICY RULES: {state['policy_text']}
    PATIENT RECORDS: {state['medical_records']}
    
    Compare the records against the rules. 
    1. Identify which rules are met.
    2. List specifically any missing evidence (Gaps).
    3. If everything is met, write a 1-paragraph justification.
    """
    
    response = llm.invoke(prompt)
    content = response.content
    
    gaps = []
    if "missing" in content.lower() or "not found" in content.lower():
        gaps.append("Required clinical evidence not found in records")
        
    return {
        "identified_gaps": gaps,
        "final_justification": content,
        "status": "AUDITED"
    }