"""챗봇 API 라우터 — LangGraph 기반 장보기 비서."""
from __future__ import annotations

import logging
import re
from typing import Optional

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from src.api.v1.dependencies import AuthUser, require_auth
from src.api.v1.routers.basket import (
    get_basket_store,
    save_basket_store_to_db,
    sync_basket_store_from_db,
)
from src.api.v1.routers.preferences import _user_preferences, sync_preferences_from_db
from src.application.services.product_matcher_db import ProductMatcherDB
from src.domain.models.basket import BasketItem, ItemMode

router = APIRouter(prefix="/chat", tags=["챗봇"])
logger = logging.getLogger(__name__)

# 사용자별 인메모리 대화 히스토리 (SoR는 사용자별 분리)
_chat_history_by_user: dict[str, list] = {}
_MAX_HISTORY = 20
_SEGMENT_SPLIT_PATTERN = re.compile(r"(?:,|/|\n| 그리고 |그리고| 하고 |하고| 랑 |랑| 및 )")
_QUANTITY_PATTERN = re.compile(r"(\d+)\s*(개|봉|팩|세트|병|캔|통|줄|묶음)")
_SIZE_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\s*(kg|g|ml|l|구|판|모|포기|단)", re.IGNORECASE)
_NOISE_WORDS = (
    "장바구니",
    "담아줘",
    "담아",
    "추가해줘",
    "추가",
    "넣어줘",
    "넣어",
    "줘",
    "해줘",
    "주세요",
    "좀",
    "그리고",
)


# ── Request / Response DTO ──────────────────────────────────────────

class ChatMessageRequest(BaseModel):
    message: str


class DiffItem(BaseModel):
    action: str
    item: BasketItem
    reason: str = ""


class ChatMessageResponse(BaseModel):
    role: str = "assistant"
    content: str
    diff: Optional[list[DiffItem]] = None
    suggestions: list[str] = []


# ── Helper ──────────────────────────────────────────────────────────

def _chat_history_for_user(user_id: str) -> list:
    return _chat_history_by_user.setdefault(user_id, [])


def _build_basket_context(items: list[BasketItem]) -> str:
    """현재 장바구니를 텍스트로 요약."""
    if not items:
        return "비어 있음"
    lines = []
    for item in items:
        icon = "🔒" if item.mode == ItemMode.FIXED else "⭐"
        parts = [icon, item.brand or "", item.item_name, item.size or "", f"x{item.quantity}"]
        lines.append(" ".join(p for p in parts if p).strip())
    return "\n".join(lines)


def _basket_item_key(item: BasketItem) -> str:
    return "|".join(
        [
            item.item_name.strip().lower(),
            (item.brand or "").strip().lower(),
            (item.size or "").strip().lower(),
            item.mode.value if isinstance(item.mode, ItemMode) else str(item.mode),
        ]
    )


def _snapshot_basket(items: list[BasketItem]) -> dict[str, BasketItem]:
    snapshot: dict[str, BasketItem] = {}
    for item in items:
        key = _basket_item_key(item)
        if key in snapshot:
            snapshot[key] = snapshot[key].model_copy(update={"quantity": snapshot[key].quantity + item.quantity})
        else:
            snapshot[key] = item.model_copy()
    return snapshot


def _build_basket_diff(
    before: dict[str, BasketItem],
    after: dict[str, BasketItem],
) -> list[DiffItem]:
    diffs: list[DiffItem] = []
    keys = set(before.keys()) | set(after.keys())
    for key in keys:
        old = before.get(key)
        new = after.get(key)
        if old is None and new is not None:
            diffs.append(
                DiffItem(
                    action="add",
                    item=new,
                    reason="채팅 요청으로 추가",
                )
            )
            continue
        if old is not None and new is None:
            diffs.append(
                DiffItem(
                    action="remove",
                    item=old,
                    reason="채팅 요청으로 삭제",
                )
            )
            continue
        if old is None or new is None:
            continue
        if new.quantity > old.quantity:
            diffs.append(
                DiffItem(
                    action="add",
                    item=new.model_copy(update={"quantity": new.quantity - old.quantity}),
                    reason="채팅 요청으로 수량 증가",
                )
            )
        elif new.quantity < old.quantity:
            diffs.append(
                DiffItem(
                    action="remove",
                    item=old.model_copy(update={"quantity": old.quantity - new.quantity}),
                    reason="채팅 요청으로 수량 감소",
                )
            )
    return diffs


def _resolve_brand_preferences(user_id: str) -> tuple[list[str], list[str]]:
    profile = _user_preferences.get(user_id, {"like": [], "dislike": []})
    preferred = [str(value) for value in profile.get("like", []) if value]
    disliked = [str(value) for value in profile.get("dislike", []) if value]
    return preferred, disliked


def _split_segments(message: str) -> list[str]:
    segments = [segment.strip() for segment in _SEGMENT_SPLIT_PATTERN.split(message) if segment.strip()]
    return segments or [message.strip()]


def _extract_quantity(text: str) -> int:
    match = _QUANTITY_PATTERN.search(text)
    if not match:
        return 1
    return max(1, int(match.group(1)))


def _extract_size(text: str) -> str | None:
    match = _SIZE_PATTERN.search(text)
    if not match:
        return None
    value = match.group(1)
    unit = match.group(2).lower()
    return f"{value}{unit}"


def _clean_candidate_text(text: str) -> str:
    result = text
    for token in _NOISE_WORDS:
        result = result.replace(token, " ")
    result = re.sub(r"\s+", " ", result).strip()
    return result


async def _resolve_matcher_entities(
    message: str,
    request: Request,
    user_id: str,
) -> list[dict]:
    db = getattr(request.app.state, "db", None)
    if db is None:
        return []

    matcher = ProductMatcherDB(db)
    preferred_brands, disliked_brands = _resolve_brand_preferences(user_id)
    merged: dict[str, dict] = {}

    for segment in _split_segments(message):
        candidate_text = _clean_candidate_text(segment)
        if not candidate_text or len(candidate_text) < 2:
            continue

        qty = _extract_quantity(segment)
        size = _extract_size(segment)
        matched = await matcher.match(
            BasketItem(item_name=candidate_text, quantity=1),
            preferred_brands=preferred_brands,
            disliked_brands=disliked_brands,
        )
        if not matched:
            continue

        key = f"{matched.normalized_name}|{size or matched.size_display or ''}"
        current = merged.get(key)
        if current:
            current["quantity"] += qty
            continue

        merged[key] = {
            "item_name": matched.normalized_name,
            "quantity": qty,
            "brand": None,
            "size": size or matched.size_display,
            "score": matched.score,
        }

    return list(merged.values())


# ── Endpoints ───────────────────────────────────────────────────────

@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    payload: ChatMessageRequest,
    raw_request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    """챗봇 메시지 전송 (LangGraph ReAct 적용)."""
    user_id = current_user.user_id
    await sync_basket_store_from_db(raw_request, user_id)
    await sync_preferences_from_db(raw_request, user_id)
    basket = get_basket_store(user_id)
    before_snapshot = _snapshot_basket(basket.items)
    basket_context = _build_basket_context(basket.items)
    preferred_brands, disliked_brands = _resolve_brand_preferences(user_id)
    matcher_entities = await _resolve_matcher_entities(
        payload.message,
        request=raw_request,
        user_id=user_id,
    )
    chat_history = _chat_history_for_user(user_id)

    # LangGraph 연동 시도 — API 키 없으면 fallback
    try:
        from langchain_core.messages import HumanMessage, AIMessage
        from src.application.graph import agent_graph

        initial_state = {
            "messages": chat_history + [HumanMessage(content=payload.message)],
            "user_preferences": (
                f"선호: {', '.join(preferred_brands) if preferred_brands else '없음'} / "
                f"비선호: {', '.join(disliked_brands) if disliked_brands else '없음'}"
            ),
            "matcher_entities": matcher_entities,
            "intent": None,
            "next_step": None,
            "final_response": None,
            "user_id": user_id,
        }

        final_state = await agent_graph.ainvoke(initial_state)
        response_content = final_state.get("final_response", "죄송해요, 잠시 문제가 생겼어요.")

        # 히스토리 업데이트
        chat_history.append(HumanMessage(content=payload.message))
        chat_history.append(AIMessage(content=response_content))

    except Exception as e:
        logger.warning("LangGraph 실행 실패 (fallback 응답): %s", e)
        try:
            from langchain_core.messages import HumanMessage, AIMessage
            from src.application.graph import (
                _keyword_classify,
                clarifier_node,
                general_node,
                modifier_node,
                recommender_node,
            )

            fallback_state = {
                "messages": [HumanMessage(content=payload.message)],
                "user_preferences": (
                    f"선호: {', '.join(preferred_brands) if preferred_brands else '없음'} / "
                    f"비선호: {', '.join(disliked_brands) if disliked_brands else '없음'}"
                ),
                "matcher_entities": matcher_entities,
                "intent": _keyword_classify(payload.message),
                "next_step": None,
                "final_response": None,
                "user_id": user_id,
            }

            intent = str(fallback_state["intent"])
            if intent == "modify":
                fallback_result = await modifier_node(fallback_state)
            elif intent == "recommend":
                fallback_result = await recommender_node(fallback_state)
            elif intent == "clarify":
                fallback_result = await clarifier_node(fallback_state)
            else:
                fallback_result = await general_node(fallback_state)

            response_content = str(
                fallback_result.get("final_response")
                or f"장바구니에는 {len(basket.items)}개 품목이 있어요.\n\n**장바구니 현황**:\n{basket_context}"
            )

            chat_history.append(HumanMessage(content=payload.message))
            chat_history.append(AIMessage(content=response_content))
        except Exception as fallback_exc:
            logger.warning("규칙 기반 fallback 실패: %s", fallback_exc)
            response_content = "요청을 처리하는 중 문제가 생겼어요. 다시 시도해주세요."

    # 히스토리 크기 제한
    if len(chat_history) > _MAX_HISTORY:
        _chat_history_by_user[user_id] = chat_history[-_MAX_HISTORY:]

    await save_basket_store_to_db(raw_request, user_id)
    after_basket = get_basket_store(user_id)
    basket_diff = _build_basket_diff(before_snapshot, _snapshot_basket(after_basket.items))

    # 추천 검색어
    suggestions = (
        ["분석 시작해줘", "장바구니 보여줘"]
        if after_basket.items
        else ["계란 30구 추가해줘", "김치찌개 재료 추천해줘"]
    )

    return ChatMessageResponse(content=response_content, diff=basket_diff, suggestions=suggestions)


@router.get("/greeting", response_model=ChatMessageResponse)
async def get_greeting(
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    """앱 진입 시 첫 인사말."""
    await sync_basket_store_from_db(request, current_user.user_id)
    basket = get_basket_store(current_user.user_id)
    greeting = "안녕하세요! 👋 저는 똑장 AI 비서예요.\n장바구니에 담을 품목을 알려주세요!"
    if basket.items:
        greeting = f"장바구니에 {len(basket.items)}개 품목이 있어요. 무엇을 더 도와드릴까요?"
    return ChatMessageResponse(
        content=greeting,
        suggestions=["계란 30구 추가해줘", "김치찌개 재료 추천해줘", "도움말"],
    )


@router.post("/clear")
async def clear_history(current_user: AuthUser = Depends(require_auth)):
    """대화 히스토리 초기화."""
    _chat_history_by_user[current_user.user_id] = []
    return {"status": "ok", "message": "대화 히스토리가 초기화되었습니다."}
