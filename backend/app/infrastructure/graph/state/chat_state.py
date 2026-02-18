"""LangGraph 대화 상태 모델."""

from typing import Annotated

from typing_extensions import TypedDict

from langgraph.graph.message import add_messages

from app.domain.models.basket import BasketItem


class ChatState(TypedDict):
    """LangGraph 대화 상태.

    Attributes:
        messages: 대화 메시지 히스토리
        basket_items: 현재 장바구니 품목 리스트
        pending_diff: 사용자 확인 대기 중인 변경안
        intent: 현재 사용자 의도 (add/remove/recipe/search 등)
    """
    messages: Annotated[list, add_messages]
    basket_items: list[BasketItem]
    pending_diff: list[dict] | None
    intent: str | None
