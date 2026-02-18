"""누락 정보 질문 노드 — 브랜드/용량 고정 여부 확인."""

from app.infrastructure.graph.state.chat_state import ChatState


async def clarify_node(state: ChatState) -> dict:
    """누락 정보가 있을 때 사용자에게 질문하는 노드.

    - 브랜드 고정 여부: "브랜드를 고정할까요, 아니면 가성비로 추천할까요?"
    - 용량/규격 확인: "용량/규격을 고정할까요?"
    """
    # TODO: pending_diff 내 누락 정보 체크 후 질문 생성
    return {
        "intent": state.get("intent"),
    }
