"""챗봇 메시지 관련 스키마."""

from enum import Enum

from pydantic import BaseModel, Field

from app.domain.models.basket import BasketItem


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class DiffAction(str, Enum):
    ADD = "add"
    REMOVE = "remove"
    MODIFY = "modify"


class DiffItem(BaseModel):
    """장바구니 변경안(diff) 개별 항목."""
    action: DiffAction
    item: BasketItem
    reason: str = ""


class ChatMessageRequest(BaseModel):
    """챗봇 메시지 전송 요청."""
    message: str = Field(..., min_length=1)


class ChatMessageResponse(BaseModel):
    """챗봇 응답."""
    role: MessageRole = MessageRole.ASSISTANT
    content: str
    diff: list[DiffItem] | None = None
    suggestions: list[str] = Field(
        default_factory=lambda: ["최저가 비교해줘", "다음에 살 것들", "전체 삭제"]
    )
