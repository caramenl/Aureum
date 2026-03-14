from langgraph.graph import StateGraph, END
from state import AgentState
from nodes import check_cache_node, parse_policy_node, evaluate_patient_node, redact_pii_node, critic_verify_node

def build_audit_graph():
    graph = StateGraph(AgentState)
    
    # Add all layers of our workflow
    graph.add_node("check_cache", check_cache_node)
    graph.add_node("parse_policy", parse_policy_node)
    graph.add_node("redact_pii", redact_pii_node)
    graph.add_node("evaluate_patient", evaluate_patient_node)
    graph.add_node("critic_verify", critic_verify_node)
    
    graph.set_entry_point("check_cache")
    
    # Route 1: Cache check
    def route_cache(state: AgentState):
        if state.get("next_step") == "redact_pii":
            return "redact_pii"
        return "parse_policy"
        
    graph.add_conditional_edges("check_cache", route_cache, {
        "redact_pii": "redact_pii",
        "parse_policy": "parse_policy"
    })
    
    # Route 2: After parsing policy, clean PII
    graph.add_edge("parse_policy", "redact_pii")
    
    # Route 3: After cleaning PII, evaluate the patient
    graph.add_edge("redact_pii", "evaluate_patient")
    
    # Route 4: Audit goes to the Critic for Verification
    graph.add_edge("evaluate_patient", "critic_verify")

    # Route 5: Self-Healing Loop (Retry or Finish)
    def route_critic(state: AgentState):
        if state.get("next_step") == "evaluate_patient":
            return "evaluate_patient"
        return END

    graph.add_conditional_edges("critic_verify", route_critic, {
        "evaluate_patient": "evaluate_patient",
        END: END
    })
    
    return graph.compile()
