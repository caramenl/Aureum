from langgraph.graph import StateGraph, END, START
from state import AgentState
from nodes import (
    check_cache_node, 
    parse_policy_node, 
    evaluate_patient_node, 
    redact_pii_node, 
    critic_verify_node
)

def build_audit_graph():
    graph = StateGraph(AgentState)
    
    graph.add_node("check_cache", check_cache_node)
    graph.add_node("parse_policy", parse_policy_node)
    graph.add_node("redact_pii", redact_pii_node)
    graph.add_node("evaluate_patient", evaluate_patient_node)
    graph.add_node("critic_verify", critic_verify_node)
    
    graph.add_edge(START, "check_cache")
    
    def route_cache(state: AgentState):
        if state.get("next_step") == "redact_pii":
            return "redact_pii"
        return ["parse_policy", "redact_pii"]
        
    graph.add_conditional_edges("check_cache", route_cache, {
        "redact_pii": "redact_pii",
        "parse_policy": "parse_policy"
    })
    
    graph.add_edge("parse_policy", "evaluate_patient")
    graph.add_edge("redact_pii", "evaluate_patient")
    graph.add_edge("evaluate_patient", "critic_verify")

    def route_critic(state: AgentState):
        if state.get("next_step") == "evaluate_patient":
            return "evaluate_patient"
        return END

    graph.add_conditional_edges("critic_verify", route_critic, {
        "evaluate_patient": "evaluate_patient",
        END: END
    })
    
    return graph.compile()
