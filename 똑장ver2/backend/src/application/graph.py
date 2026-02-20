"""LangGraph 기반 장보기 AI 에이전트 (ReAct 패턴)."""
from __future__ import annotations

import logging
import re
from typing import TypedDict, Annotated, Literal

from langchain_core.messages import SystemMessage, BaseMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

from src.application.prompts import render_prompt
from src.core.llm import ainvoke_json_with_model_fallback, is_openai_configured
from src.domain.models.basket import BasketItem, ItemMode
from src.api.v1.routers.basket import get_basket_store

logger = logging.getLogger(__name__)

ADD_KEYWORDS = ("담아", "추가", "넣어", "사줘", "주문", "장바구니")
REMOVE_KEYWORDS = ("빼줘", "빼", "삭제", "취소", "지워", "제거")
RECOMMEND_KEYWORDS = ("추천", "뭐 먹", "어떤", "레시피")
ASK_KEYWORDS = ("그거", "아까", "어떤 거")
QUANTITY_PATTERN = re.compile(r"(\d+)\s*(개|봉|팩|세트|병|캔|통|줄|묶음)")
SIZE_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\s*(kg|g|ml|l|구|판|모|포기|단)", re.IGNORECASE)
SEGMENT_SPLIT_PATTERN = re.compile(r"(?:,|/|\n| 그리고 |그리고| 하고 |하고| 랑 |랑| 및 )")
KOREAN_QTY_WORDS = {
    "한": 1,
    "하나": 1,
    "두": 2,
    "둘": 2,
    "세": 3,
    "셋": 3,
    "네": 4,
    "넷": 4,
}
KOREAN_QTY_PATTERN = re.compile(r"(한|하나|두|둘|세|셋|네|넷)\s*(개|봉|팩|세트|병|캔|통|줄|묶음|모)")
KNOWN_ITEM_ALIASES = {
    "달걀": "계란",
    "계란": "계란",
    "우유": "우유",
    "두부": "두부",
    "삼겹살": "삼겹살",
    "삼겹": "삼겹살",
    "목살": "돼지고기",
    "돼지고기": "돼지고기",
    "소고기": "소고기",
    "닭가슴살": "닭가슴살",
    "라면": "라면",
    "신라면": "신라면",
    "김치": "김치",
    "대파": "대파",
    "파": "파",
    "당근": "당근",
    "상추": "상추",
    "깻잎": "깻잎",
    "케일": "케일",
    "오이": "오이",
    "고추": "고추",
    "양파": "양파",
    "감자": "감자",
    "고구마": "고구마",
    "생수": "생수",
    "콜라": "콜라",
    "맥주": "맥주",
    "소주": "참이슬",
    "참이슬": "참이슬",
    "비타500": "비타500",
    "비타 500": "비타500",
}
KNOWN_BRANDS = (
    "서울우유",
    "매일",
    "남양",
    "빙그레",
    "풀무원",
    "cj",
    "cj제일제당",
    "오뚜기",
    "농심",
    "목우촌",
    "한돈",
    "롯데",
    "진로",
)
STOPWORDS = {
    "추가",
    "추가해줘",
    "담아",
    "담아줘",
    "넣어줘",
    "해줘",
    "주세요",
    "좀",
    "이거",
    "그거",
    "이것",
    "저거",
    "원산지",
    "원산지는",
    "어디든",
    "딱히",
    "상관없고",
    "냉동으로",
    "싼거",
    "정확히",
    "브랜드",
    "용량",
    "규격",
    "담기",
    "장바구니에",
    "넣기",
}
ITEM_LIQUID_DEFAULT_SIZE = {
    "참이슬": "360ml",
    "비타500": "100ml",
    "우유": "1l",
    "콜라": "1.5l",
    "생수": "2l",
}
RECIPE_BUNDLES: dict[str, list[tuple[str, int, str | None, str | None]]] = {
    "김치찌개": [
        ("김치", 1, None, "1/4포기"),
        ("두부", 1, None, "1모"),
        ("돼지고기", 1, None, "200g"),
    ],
}


# ── 1. State 정의 ───────────────────────────────────────────────────

class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    user_preferences: str
    matcher_entities: list[dict] | None
    intent: str | None
    next_step: str | None
    final_response: str | None
    user_id: str


# ── 2. LLM 설정 (모델 fallback) ─────────────────────────────────────


# ── 3. Node 구현 ────────────────────────────────────────────────────

async def analyzer_node(state: ChatState) -> dict:
    """사용자 의도 분석 노드."""
    basket = get_basket_store(state.get("user_id", "unknown_user"))

    last_msg = state["messages"][-1].content if state["messages"] else ""

    if not is_openai_configured():
        # API 키 없음 → 키워드 기반 간단 분류
        intent = _keyword_classify(last_msg)
        return {"intent": intent}

    basket_desc = ", ".join(
        f"{i.item_name}({i.brand or '추천'})" for i in basket.items
    ) or "비어 있음"

    prompt = render_prompt(
        "analyzer.system.txt",
        preferences=state["user_preferences"],
        basket_status=basket_desc,
    )

    try:
        messages = [SystemMessage(content=prompt)] + list(state["messages"])
        result = await ainvoke_json_with_model_fallback(messages, temperature=0.1)
        intent = _override_intent_with_item_heuristic(last_msg, result.get("intent", "general"))
        llm_entities = _normalize_llm_entities(result.get("entities"))
        merged_entities = _merge_matcher_entities(
            state.get("matcher_entities"),
            llm_entities,
        )
        return {
            "intent": intent,
            "matcher_entities": merged_entities,
        }
    except Exception as exc:
        logger.warning("LLM analyzer failed, fallback classifier used: %s", exc)
        return {"intent": _keyword_classify(last_msg)}


def _normalize_llm_entities(raw_entities: object) -> list[dict]:
    if not isinstance(raw_entities, list):
        return []

    normalized: list[dict] = []
    for raw in raw_entities:
        if not isinstance(raw, dict):
            continue

        item_name = str(raw.get("item_name") or "").strip()
        if not item_name:
            continue

        action = str(raw.get("action") or "add").strip().lower()
        if action not in {"add", "remove"}:
            action = "add"

        try:
            quantity = max(1, int(raw.get("quantity") or 1))
        except Exception:
            quantity = 1

        brand = str(raw.get("brand") or "").strip() or None
        size = str(raw.get("size") or "").strip() or None
        normalized.append(
            {
                "item_name": item_name,
                "quantity": quantity,
                "brand": brand,
                "size": size,
                "action": action,
            }
        )
    return normalized


def _merge_matcher_entities(
    base_entities: list[dict] | None,
    llm_entities: list[dict] | None,
) -> list[dict]:
    merged: dict[str, dict] = {}

    def _upsert(entity: dict) -> None:
        item_name = str(entity.get("item_name") or "").strip()
        if not item_name:
            return
        action = str(entity.get("action") or "add").strip().lower()
        if action not in {"add", "remove"}:
            action = "add"
        brand = str(entity.get("brand") or "").strip() or None
        size = str(entity.get("size") or "").strip() or None
        quantity = entity.get("quantity") or 1
        try:
            quantity_int = max(1, int(quantity))
        except Exception:
            quantity_int = 1

        key = f"{action}|{item_name.lower()}|{(brand or '').lower()}|{(size or '').lower()}"
        if key in merged:
            merged[key]["quantity"] = int(merged[key]["quantity"]) + quantity_int
            return
        merged[key] = {
            "item_name": item_name,
            "quantity": quantity_int,
            "brand": brand,
            "size": size,
            "action": action,
        }

    for entity in base_entities or []:
        if isinstance(entity, dict):
            _upsert(entity)
    for entity in llm_entities or []:
        if isinstance(entity, dict):
            _upsert(entity)

    return list(merged.values())


def _keyword_classify(text: str) -> str:
    """API 키 없을 때 키워드 기반 간단 분류."""
    normalized = text.strip().lower()
    for kw in ADD_KEYWORDS + REMOVE_KEYWORDS:
        if kw in normalized:
            return "modify"
    if _extract_item_name(normalized):
        return "modify"
    for kw in RECOMMEND_KEYWORDS:
        if kw in normalized:
            return "recommend"
    for kw in ASK_KEYWORDS:
        if kw in normalized:
            return "clarify"
    return "general"


def _override_intent_with_item_heuristic(text: str, llm_intent: str) -> str:
    """LLM이 general/clarify로 분류해도 품목 단독 발화면 modify로 보정."""
    normalized = text.strip().lower()
    has_modify_signal = _extract_item_name(text) or any(
        keyword in normalized for keyword in (*ADD_KEYWORDS, *REMOVE_KEYWORDS)
    )
    if llm_intent in {"general", "clarify"} and has_modify_signal:
        return "modify"
    return llm_intent


async def modifier_node(state: ChatState) -> dict:
    """장바구니 변경 실행 노드 — _basket_store 직접 조작."""
    last_msg = state["messages"][-1].content if state["messages"] else ""
    basket = get_basket_store(state.get("user_id", "unknown_user"))

    # 키워드 기반 간단 파싱 (MVP)
    action, item_name, quantity, brand, size, needs_followup, extra_items = _parse_modify_intent(
        last_msg,
        state.get("messages", []),
        state.get("matcher_entities"),
    )

    if action == "add":
        if needs_followup:
            return {"final_response": _build_item_followup(item_name)}

        items_to_apply = [(item_name, quantity, brand, size), *extra_items]
        added_labels: list[str] = []

        for cur_item_name, cur_quantity, cur_brand, cur_size in items_to_apply:
            existing_item = next(
                (
                    existing
                    for existing in basket.items
                    if existing.item_name == cur_item_name
                    and (existing.brand or "") == (cur_brand or "")
                    and (existing.size or "") == (cur_size or "")
                ),
                None,
            )

            if existing_item:
                existing_item.quantity += cur_quantity
            else:
                basket.items.append(
                    BasketItem(
                        item_name=cur_item_name,
                        brand=cur_brand,
                        size=cur_size,
                        quantity=cur_quantity,
                        mode=ItemMode.FIXED if cur_brand else ItemMode.RECOMMEND,
                    )
                )
            added_labels.append(_format_item_label(cur_item_name, cur_brand, cur_size))

        if len(added_labels) > 1:
            labels = ", ".join(added_labels)
            return {"final_response": f"{labels}를 장바구니에 담았어요! 🛒"}

        return {
            "final_response": f"{_format_item_label(item_name, brand, size)} {quantity}개를 장바구니에 담았어요! 🛒"
        }

    elif action == "remove":
        if not item_name:
            return {"final_response": "어떤 품목을 뺄지 알려주세요. 예: '우유 빼줘'"}
        before = len(basket.items)
        target = item_name.strip()
        basket.items = [i for i in basket.items if target not in i.item_name]
        if len(basket.items) < before:
            return {"final_response": f"'{item_name}'을(를) 장바구니에서 뺐어요."}
        return {"final_response": f"'{item_name}'이(가) 장바구니에 없어요."}

    return {"final_response": "장바구니를 어떻게 변경할지 정확히 알려주세요. 예: '계란 30구 담아줘'"}


def _parse_modify_intent(
    text: str,
    messages: list[BaseMessage],
    matcher_entities: list[dict] | None = None,
) -> tuple[str, str, int, str | None, str | None, bool, list[tuple[str, int, str | None, str | None]]]:
    """키워드 기반 장바구니 변경 파싱."""
    raw = text.strip()
    normalized = raw.lower()

    # 삭제 감지
    for kw in REMOVE_KEYWORDS:
        if kw in normalized:
            prefix = raw.split(kw)[0].strip()
            item = _extract_item_name(prefix, allow_fallback=False) if prefix else None
            return "remove", item or "", 0, None, None, False, []

    parsed_items = _extract_recipe_bundle_items(raw)
    if not parsed_items:
        parsed_items = []
        for segment in _split_item_segments(raw):
            parsed = _parse_add_segment(segment)
            if parsed:
                parsed_items.append(parsed)

    # 한 문장 내 다중 품목(예: "우유 계란 두부 담아줘") 처리
    mentioned_items = _extract_all_item_names(raw)
    if len(mentioned_items) > 1 and len(parsed_items) <= 1:
        parsed_items = []
        for mentioned in mentioned_items:
            parsed_items.append((mentioned, 1, _extract_brand(raw), _extract_size(raw, mentioned, 1)))

    # 세그먼트 파싱이 실패했지만 품목이 명시되어 있으면 전체 문장에서 재시도
    if not parsed_items:
        whole_item = _extract_item_name(raw, allow_fallback=True)
        if whole_item:
            qty = _extract_quantity(raw)
            brand = _extract_brand(raw)
            size = _extract_size(raw, whole_item, qty)
            parsed_items.append((whole_item, qty, brand, size))

    # 문맥 기반 후속 발화 처리 (예: "냉동으로 싼거 1kg 추가해줘")
    if not parsed_items:
        inferred = _infer_recent_item_from_messages(messages)
        if inferred and _contains_add_details(raw):
            qty = _extract_quantity(raw)
            brand = _extract_brand(raw)
            size = _extract_size(raw, inferred, qty)
            parsed_items.append((inferred, qty, brand, size))

    # DB matcher/LLM 엔터티 기반 보강 (chat router + analyzer에서 주입한 후보 사용)
    if not parsed_items and matcher_entities:
        remove_entities = [
            entity
            for entity in matcher_entities
            if str(entity.get("action") or "").strip().lower() == "remove"
            and str(entity.get("item_name") or "").strip()
        ]
        if remove_entities:
            target = str(remove_entities[0].get("item_name")).strip()
            return "remove", target, 0, None, None, False, []

        for entity in matcher_entities:
            if str(entity.get("action") or "add").strip().lower() == "remove":
                continue
            try:
                entity_quantity = max(1, int(entity.get("quantity", 1)))
            except Exception:
                entity_quantity = 1
            parsed_items.append(
                (
                    str(entity.get("item_name", "")).strip(),
                    entity_quantity,
                    entity.get("brand"),
                    entity.get("size"),
                )
            )
        parsed_items = [item for item in parsed_items if item[0]]

    if not parsed_items:
        fallback_item = _extract_item_name(raw, allow_fallback=True)
        return "add", fallback_item or "알 수 없는 품목", 1, None, None, True, []

    # 중복 품목은 수량 합산
    merged: dict[tuple[str, str, str], tuple[str, int, str | None, str | None]] = {}
    for item_name, qty, brand, size in parsed_items:
        key = (item_name, brand or "", size or "")
        if key in merged:
            prev_item, prev_qty, prev_brand, prev_size = merged[key]
            merged[key] = (prev_item, prev_qty + qty, prev_brand, prev_size)
        else:
            merged[key] = (item_name, qty, brand, size)

    merged_items = list(merged.values())
    first_item_name, first_qty, first_brand, first_size = merged_items[0]
    extra_items = merged_items[1:]
    needs_followup = (
        len(merged_items) == 1
        and not any(kw in normalized for kw in ADD_KEYWORDS)
        and not _contains_add_details(raw)
    )
    return "add", first_item_name, first_qty, first_brand, first_size, needs_followup, extra_items


def _extract_recipe_bundle_items(text: str) -> list[tuple[str, int, str | None, str | None]]:
    normalized = text.strip().lower()
    if "김치찌개" in normalized and "재료" in normalized and any(
        keyword in normalized for keyword in ADD_KEYWORDS
    ):
        return list(RECIPE_BUNDLES["김치찌개"])
    return []


def _split_item_segments(text: str) -> list[str]:
    segments = [segment.strip() for segment in SEGMENT_SPLIT_PATTERN.split(text) if segment.strip()]
    return segments or [text.strip()]


def _extract_all_item_names(text: str) -> list[str]:
    normalized = text.lower()
    hits: list[tuple[int, str]] = []
    for alias, canonical in KNOWN_ITEM_ALIASES.items():
        index = normalized.find(alias.lower())
        if index >= 0:
            hits.append((index, canonical))
    if not hits:
        return []

    hits.sort(key=lambda item: item[0])
    unique: list[str] = []
    for _, canonical in hits:
        if canonical not in unique:
            unique.append(canonical)
    return unique


def _parse_add_segment(segment: str) -> tuple[str, int, str | None, str | None] | None:
    item_name = _extract_item_name(segment, allow_fallback=True)
    if not item_name:
        return None
    qty = _extract_quantity(segment)
    brand = _extract_brand(segment)
    size = _extract_size(segment, item_name, qty)
    return item_name, qty, brand, size


def _extract_quantity(text: str) -> int:
    qty_match = QUANTITY_PATTERN.search(text)
    if qty_match:
        return int(qty_match.group(1))

    kor_match = KOREAN_QTY_PATTERN.search(text)
    if kor_match:
        return KOREAN_QTY_WORDS.get(kor_match.group(1), 1)
    return 1


def _extract_item_name(text: str, allow_fallback: bool = False) -> str | None:
    normalized = text.strip().lower()
    for alias, canonical in sorted(KNOWN_ITEM_ALIASES.items(), key=lambda x: len(x[0]), reverse=True):
        if alias in normalized:
            return canonical

    if allow_fallback:
        tokens = re.findall(r"[가-힣a-zA-Z0-9]+", text)
        for token in tokens:
            lowered = token.lower()
            if lowered in STOPWORDS:
                continue
            if re.fullmatch(r"\d+(?:\.\d+)?", lowered):
                continue
            if re.fullmatch(r"\d+(?:\.\d+)?(kg|g|ml|l|구|판|모|포기|단)", lowered):
                continue
            if len(token) >= 2:
                return token
    return None


def _extract_brand(text: str) -> str | None:
    normalized = text.lower()
    for brand in sorted(KNOWN_BRANDS, key=len, reverse=True):
        if brand.lower() in normalized:
            return brand
    return None


def _extract_size(text: str, item_name: str | None, quantity: int) -> str | None:
    match = SIZE_PATTERN.search(text)
    if match:
        value = match.group(1)
        unit = match.group(2).lower()
        return f"{value}{unit}"

    # "두부 한 모" 같은 표현 보정
    if item_name == "두부" and re.search(r"(한|하나|두|둘|세|셋|네|넷)\s*모", text):
        return f"{quantity}모"

    if item_name and item_name in ITEM_LIQUID_DEFAULT_SIZE:
        return ITEM_LIQUID_DEFAULT_SIZE[item_name]
    return None


def _contains_add_details(text: str) -> bool:
    lowered = text.lower()
    return bool(
        QUANTITY_PATTERN.search(text)
        or KOREAN_QTY_PATTERN.search(text)
        or SIZE_PATTERN.search(text)
        or _extract_brand(text)
        or "냉동" in lowered
        or "원산지" in lowered
    )


def _infer_recent_item_from_messages(messages: list[BaseMessage]) -> str | None:
    if len(messages) <= 1:
        return None

    for msg in reversed(messages[:-1]):
        msg_type = getattr(msg, "type", "")
        if msg_type not in {"human", "user"}:
            continue
        content = str(getattr(msg, "content", "")).strip()
        if not content:
            continue
        item = _extract_item_name(content, allow_fallback=False)
        if item:
            return item
    return None


def _format_item_label(item_name: str, brand: str | None, size: str | None) -> str:
    parts = [brand, item_name, f"({size})" if size else None]
    return " ".join([part for part in parts if part]).strip()


def _build_item_followup(item_name: str) -> str:
    if item_name == "삼겹살":
        return (
            "삼겹살 찾았어요! 🥩\n"
            "보통 500g~600g을 많이 구매해요.\n"
            "원하시는 브랜드나 용량을 알려주시면 바로 담아드릴게요.\n"
            "예: '한돈 삼겹살 600g 담아줘', '삼겹살 500g 추가해줘'"
        )
    if item_name == "참이슬":
        return (
            "참이슬 확인했어요. 🍶\n"
            "도수/용량을 알려주시면 더 정확하게 담아드릴게요.\n"
            "예: '참이슬 후레쉬 360ml 2병', '참이슬 640ml 1병'"
        )
    if item_name == "비타500":
        return (
            "비타500 확인했어요. 🍋\n"
            "개수 또는 세트 단위를 알려주시면 바로 담아드릴게요.\n"
            "예: '비타500 100ml 10병', '비타500 1박스'"
        )

    example_size = "500ml" if item_name in ITEM_LIQUID_DEFAULT_SIZE else "500g"
    return (
        f"'{item_name}' 확인했어요.\n"
        "브랜드나 규격을 알려주시면 더 정확하게 담아드릴 수 있어요.\n"
        f"예: '{item_name} 1개', '{item_name} {example_size}'"
    )


async def recommender_node(state: ChatState) -> dict:
    """추천/제안 노드."""
    req = state["messages"][-1].content if state["messages"] else ""

    if "저녁" in req or "뭐 먹" in req:
        msg = (
            "오늘 저녁으로는 **김치찌개** 어떠세요? 🍲\n\n"
            "필수 재료:\n"
            "- 김치 (1/4포기)\n"
            "- 두부 (1모)\n"
            "- 돼지고기 (200g)\n\n"
            "\"김치찌개 재료 담아줘\"라고 말씀하시면 한 번에 추가해드릴게요!"
        )
    elif "삼겹살" in req:
        msg = (
            "삼겹살이랑 같이 먹으면 좋은 것들이에요! 🥩\n\n"
            "- 쌈채소 세트\n"
            "- 된장 (쌈장)\n"
            "- 마늘\n"
            "- 소주 or 맥주\n\n"
            "담을까요?"
        )
    else:
        msg = "어떤 요리를 하실 예정인가요? 레시피에 맞춰 재료를 추천해드릴게요. 🍽️"

    return {"final_response": msg}


async def clarifier_node(state: ChatState) -> dict:
    """추가 정보 질의 노드."""
    return {
        "final_response": (
            "죄송해요, 정확히 어떤 상품을 말씀하시는 건가요? 🤔\n"
            "브랜드나 규격을 알려주시면 더 잘 찾아드릴 수 있어요.\n"
            "예: '서울우유 1L', '풀무원 두부 300g'"
        )
    }


async def general_node(state: ChatState) -> dict:
    """일반 대화 노드."""
    basket = get_basket_store(state.get("user_id", "unknown_user"))
    basket_count = len(basket.items)
    if basket_count > 0:
        items_str = ", ".join(i.item_name for i in basket.items[:5])
        msg = f"안녕하세요! 지금 장바구니에 {basket_count}개 품목({items_str})이 있어요. 무엇을 더 도와드릴까요? 😊"
    else:
        msg = "안녕하세요! 👋 똑장 AI 비서에요. 장바구니에 담을 품목을 말씀해주세요!"
    return {"final_response": msg}


# ── 4. Conditional Edge ─────────────────────────────────────────────

def route_intent(state: ChatState) -> Literal["modifier", "recommender", "clarifier", "general"]:
    """Intent에 따라 다음 노드 결정."""
    intent = state.get("intent", "general")
    mapping = {
        "modify": "modifier",
        "recommend": "recommender",
        "clarify": "clarifier",
        "general": "general",
    }
    return mapping.get(intent, "general")


# ── 5. Graph 조립 ──────────────────────────────────────────────────

workflow = StateGraph(ChatState)

workflow.add_node("analyzer", analyzer_node)
workflow.add_node("modifier", modifier_node)
workflow.add_node("recommender", recommender_node)
workflow.add_node("clarifier", clarifier_node)
workflow.add_node("general", general_node)

workflow.set_entry_point("analyzer")

workflow.add_conditional_edges(
    "analyzer",
    route_intent,
    {
        "modifier": "modifier",
        "recommender": "recommender",
        "clarifier": "clarifier",
        "general": "general",
    },
)

workflow.add_edge("modifier", END)
workflow.add_edge("recommender", END)
workflow.add_edge("clarifier", END)
workflow.add_edge("general", END)

# 컴파일
agent_graph = workflow.compile()
