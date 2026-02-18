"""챗봇 API 라우터 — GPT-5-mini 기반 실시간 대화."""

from fastapi import APIRouter

from app.application.services.chat_service import chat_with_llm, clear_chat_history, generate_greeting
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse, DiffAction, DiffItem, MessageRole
from app.domain.models.basket import BasketItem, ItemMode

router = APIRouter(prefix="/chat", tags=["챗봇"])

# 다른 라우터의 인메모리 데이터 참조 (MVP 임시)
from app.api.v1.routers.basket import _basket


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(request: ChatMessageRequest):
    """챗봇 메시지를 전송하고 GPT-5-mini 응답을 받는다."""

    # 현재 장바구니 상태를 dict 리스트로 변환
    basket_items = [item.model_dump() for item in _basket.items]

    # LLM 호출
    result = await chat_with_llm(
        user_message=request.message,
        basket_items=basket_items,
        user_id="test_user", # MVP: 고정 세션/유저 ID
    )

    # diff 파싱 (LLM이 반환한 JSON diff → DiffItem 리스트)
    diff_items = None
    if result.get("diff"):
        diff_items = []
        for d in result["diff"]:
            try:
                action = DiffAction(d.get("action", "add"))
                mode_str = d.get("mode", "recommend")
                mode = ItemMode.FIXED if mode_str == "fixed" else ItemMode.RECOMMEND

                basket_item = BasketItem(
                    item_name=d.get("item_name", ""),
                    brand=d.get("brand"),
                    size=d.get("size"),
                    quantity=d.get("quantity", 1),
                    mode=mode,
                )
                diff_items.append(DiffItem(
                    action=action,
                    item=basket_item,
                    reason=d.get("reason", ""),
                ))
            except Exception as e:
                print(f"[Chat] diff 파싱 오류: {e}")
                continue

    return ChatMessageResponse(
        role=MessageRole.ASSISTANT,
        content=result["content"],
        diff=diff_items if diff_items else None,
        suggestions=result.get("suggestions", ["최저가 비교해줘", "다음에 살 것들"]),
    )


@router.get("/greeting", response_model=ChatMessageResponse)
async def get_greeting():
    """앱 진입 시점의 첫 인사말과 제안을 반환한다."""
    basket_items = [item.model_dump() for item in _basket.items]
    result = await generate_greeting(basket_items)
    
    return ChatMessageResponse(
        role=MessageRole.ASSISTANT,
        content=result["content"],
        diff=None,
        suggestions=result["suggestions"],
    )


@router.post("/clear")
async def clear_history():
    """대화 히스토리를 초기화한다."""
    clear_chat_history()
    return {"status": "ok", "message": "대화 히스토리가 초기화되었습니다."}
