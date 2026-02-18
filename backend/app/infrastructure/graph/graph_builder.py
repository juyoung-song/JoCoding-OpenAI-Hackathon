"""LangGraph 그래프 빌더 — 대화 흐름 정의."""

from langgraph.graph import END, StateGraph

from app.infrastructure.graph.nodes.clarify import clarify_node
from app.infrastructure.graph.nodes.parse import parse_node
from app.infrastructure.graph.state.chat_state import ChatState


def build_chat_graph() -> StateGraph:
    """챗봇 대화 그래프를 빌드하여 반환한다.

    플로우: parse → clarify → END (또는 반복)
    """
    graph = StateGraph(ChatState)

    # 노드 등록
    graph.add_node("parse", parse_node)
    graph.add_node("clarify", clarify_node)

    # 엣지 정의
    graph.set_entry_point("parse")
    graph.add_edge("parse", "clarify")
    graph.add_edge("clarify", END)

    return graph.compile()
