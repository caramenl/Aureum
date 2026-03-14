from langgraph.graph import StateGraph, END
from state import AgentState
from nodes import check_cache_node, parse_policy_node, evaluate_patient_node

def build_audit_graph():
    graph = StateGraph(AgentState)
    graph.add_node("check_cache", check_cache_node)
    graph.add_node("parse_policy", parse_policy_node)
    graph.add_node("evaluate_patient", evaluate_patient_node)
    graph.set_entry_point("check_cache")
    
    def route_cache(state: AgentState):
        if state.get("next_step") == "evaluate_patient":
            return "evaluate_patient"
        return "parse_policy"
        
    graph.add_conditional_edges("check_cache", route_cache, {
        "evaluate_patient": "evaluate_patient",
        "parse_policy": "parse_policy"
    })
    
    graph.add_edge("parse_policy", "evaluate_patient")
    graph.add_edge("evaluate_patient", END)
    
    return graph.compile()
