from langgraph.graph import StateGraph, END
from state import AgentState
from nodes import check_cache_node, parse_policy_node, evaluate_patient_node

def build_audit_graph():
    """Builds the LangGraph computational flow for Medical Auditing."""
    graph = StateGraph(AgentState)
    
    # Define the nodes in our pipeline
    graph.add_node("check_cache", check_cache_node)
    graph.add_node("parse_policy", parse_policy_node)
    graph.add_node("evaluate_patient", evaluate_patient_node)
    
    # 1. Start by hashing the PDF and checking Moorcheh Memory
    graph.set_entry_point("check_cache")
    
    # 2. Dynamic Router: If policies are cached, skip LLM parsing!
    def route_cache(state: AgentState):
        if state.get("next_step") == "evaluate_patient":
            return "evaluate_patient"
        return "parse_policy"
        
    graph.add_conditional_edges("check_cache", route_cache, {
        "evaluate_patient": "evaluate_patient",
        "parse_policy": "parse_policy"
    })
    
    # 3. If we parsed the policy from scratch, go evaluate the patient next
    graph.add_edge("parse_policy", "evaluate_patient")
    
    # 4. Finish the graph
    graph.add_edge("evaluate_patient", END)
    
    return graph.compile()
