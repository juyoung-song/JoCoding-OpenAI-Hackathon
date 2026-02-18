"""LLM 챗봇 서비스 — GPT-5-mini 기반 장바구니 비서.

Langfuse 관측 + LangChain ChatOpenAI를 사용하여
사용자 자연어 입력을 처리하고 장바구니 변경안(diff)을 생성한다.
"""

import json
import os
from typing import Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.domain.models.basket import ItemMode
from app.application.services.canonicalization import CanonicalizationService
from app.infrastructure.persistence.repositories.preference_repository import PreferredBrandRepository

# ── Langfuse 설정 (v3 — 환경변수 기반 자동 연동) ──
os.environ["LANGFUSE_SECRET_KEY"] = settings.langfuse_secret_key
os.environ["LANGFUSE_PUBLIC_KEY"] = settings.langfuse_public_key
os.environ["LANGFUSE_HOST"] = settings.langfuse_base_url

# Langfuse v3은 환경변수만 설정하면 자동으로 관측됨
_langfuse_enabled = bool(settings.langfuse_secret_key and settings.langfuse_public_key)
if _langfuse_enabled:
    print("[ChatService] ✅ Langfuse 관측 활성화 (환경변수 기반)")
else:
    print("[ChatService] ⚠️ Langfuse 비활성화 (키 미설정)")



# ── 대화 히스토리 (세션 기반, MVP 인메모리) ──
_chat_history: list = []
_MAX_HISTORY = 20  # 최대 기억 메시지 수


# ── 구매 이력 Mock 데이터 (재구매 분석용) ──
_MOCK_PURCHASE_HISTORY = [
    {"item_name": "닭가슴살", "cycle": 14, "last_purchased_days_ago": 13, "status": "due"},    # 재구매 임박
    {"item_name": "생수 2L", "cycle": 7, "last_purchased_days_ago": 2, "status": "ok"},        # 아직 남음
    {"item_name": "햇반", "cycle": 30, "last_purchased_days_ago": 32, "status": "overdue"},   # 구매 시점 지남
]


# ── 장바구니 비서 시스템 프롬프트 ──
SYSTEM_PROMPT = """당신은 '똑장' 장보기 AI 비서입니다.

## 역할
사용자의 장보기를 돕는 친근하고 똑똑한 비서입니다.
사용자가 텍스트로 입력하면 장바구니 품목을 추가/삭제/수정하거나, 요리 재료를 추천합니다.

## 현재 장바구니
{basket_context}

## 구매 이력 (재구매 분석용)
{purchase_history_context}

## 행동 규칙
1. **장바구니 변경안(diff) 생성**:
   - 품목 추가/삭제/수정 시 반드시 JSON diff를 생성하세요.
   - 포맷: 
   ```json
   {{"diff": [{{"action": "add", "item_name": "품목명", "brand": null, "size": "규격", "quantity": 수량, "mode": "recommend", "reason": "추가 이유"}}]}}
   ```
   - action: "add", "remove", "modify"
   - mode: "recommend"(추천⭐) 또는 "fixed"(고정🔒)
   - 고정모드(🔒) 브랜드는 자동 변경 금지.

2. **요리 레시피 기반 추천 (중요!)**:
   - 사용자가 "김치찌개 해먹을래" 등으로 요리 의도를 보이면 필수로 들어가는 재료를 모두 추천하세요.
   - 단, **사용자가 이미 가지고 있다고 말한 재료는 제외**하세요.
   - 예: "김치찌개 할 건데 두부는 있어" -> 김치, 돼지고기, 대파, 마늘 등 추천 (두부 제외)

3. **재구매 제안**:
   - 구매 이력에 [재구매 시점 도래]로 표시된 품목이 있다면, 대화 중 자연스럽게 추가를 제안하세요.
   - 예: "참, 닭가슴살 다 드시지 않았나요? 지난번 구매 후 2주가 지났어요."

4. **톤앤매너**:
   - 한국어 사용.
   - 친근하고 적극적인 비서 톤. 이모지 적절히 사용.

## 응답 형식
일반 대화: 텍스트
변경 제안: 텍스트 + JSON diff 블록
"""


def _build_basket_context(basket_items: list[dict]) -> str:
    """현재 장바구니 상태를 텍스트로 변환."""
    if not basket_items:
        return "비어 있음"

    lines = []
    for item in basket_items:
        mode_icon = "🔒" if item.get("mode") == "fixed" else "⭐"
        brand = item.get("brand") or ""
        size = item.get("size") or ""
        qty = item.get("quantity", 1)
        name = item.get("item_name", "")
        line = f"- {mode_icon} {brand} {name} {size} x{qty}".strip()
        lines.append(line)

    return "\n".join(lines)





def _build_purchase_history_context() -> str:
    """구매 이력을 텍스트로 변환."""
    lines = []
    for item in _MOCK_PURCHASE_HISTORY:
        status_icon = "⚠️" if item["status"] in ["due", "overdue"] else "✅"
        msg = f"- {item['item_name']} (주기 {item['cycle']}일, 마지막 구매 {item['last_purchased_days_ago']}일 전) [{item['status']}]"
        if item["status"] == "due":
            msg += " -> 구매 시점 도래!"
        elif item["status"] == "overdue":
            msg += " -> 구매 시점 지남!"
        
        lines.append(f"{status_icon} {msg}")
    
    return "\n".join(lines)



def _build_purchase_history_context() -> str:
    """구매 이력을 텍스트로 변환."""
    lines = []
    for item in _MOCK_PURCHASE_HISTORY:
        status_icon = "⚠️" if item["status"] in ["due", "overdue"] else "✅"
        msg = f"- {item['item_name']} (주기 {item['cycle']}일, 마지막 구매 {item['last_purchased_days_ago']}일 전) [{item['status']}]"
        if item["status"] == "due":
            msg += " -> 구매 시점 도래!"
        elif item["status"] == "overdue":
            msg += " -> 구매 시점 지남!"
        
        lines.append(f"{status_icon} {msg}")
    
    return "\n".join(lines)


def _get_llm() -> ChatOpenAI:
    """ChatOpenAI 인스턴스를 생성한다."""
    return ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        temperature=0.7,
    )


async def chat_with_llm(
    user_message: str,
    basket_items: list[dict],
    user_id: str = "test_user",
) -> dict:
    """사용자 메시지를 LLM으로 처리하고 응답을 반환한다."""
    global _chat_history

    # ... (SYSTEM PROMPT building suppressed for brevity, assume existing context logic stays)

    # 시스템 프롬프트 구성
    basket_context = _build_basket_context(basket_items)
    history_context = _build_purchase_history_context()
    
    formatted_prompt = SYSTEM_PROMPT.format(
        basket_context=basket_context,
        purchase_history_context=history_context
    )
    system_msg = SystemMessage(content=formatted_prompt)

    # 대화 히스토리 관리
    _chat_history.append(HumanMessage(content=user_message))

    # 히스토리 제한
    if len(_chat_history) > _MAX_HISTORY:
        _chat_history = _chat_history[-_MAX_HISTORY:]

    # 메시지 구성
    messages = [system_msg] + _chat_history

    # LLM 호출
    llm = _get_llm()

    try:
        response = await llm.ainvoke(messages)
        assistant_content = response.content
    except Exception as e:
        print(f"[ChatService] LLM 호출 실패: {e}")
        assistant_content = f"죄송해요, 일시적으로 응답할 수 없습니다. 잠시 후 다시 시도해주세요. (오류: {str(e)[:50]})"

    # 히스토리에 AI 응답 추가
    _chat_history.append(AIMessage(content=assistant_content))

    # diff JSON 파싱 시도
    diff = _extract_diff(assistant_content)
    clean_content = _clean_content(assistant_content)

    # ---------------------------------------------------------
    # [Preference Logic] 선호 브랜드 적용
    # ---------------------------------------------------------
    if diff:
        applied_msgs = await _apply_preferences(diff, user_id)
        if applied_msgs:
            # AI 응답 텍스트에 안내 추가
            clean_content += "\n\n" + "\n".join(applied_msgs)

    # 동적 제안 생성
    suggestions = _generate_suggestions(basket_items, user_message)

    return {
        "content": clean_content,
        "diff": diff,
        "suggestions": suggestions,
    }


def _extract_diff(content: str) -> Optional[list[dict]]:
    """LLM 응답에서 JSON diff 블록을 추출한다."""
    try:
        # ```json ... ``` 블록 찾기
        import re
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', content, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(1))
            if "diff" in data:
                return data["diff"]

        # 인라인 JSON 찾기
        json_match = re.search(r'\{[^{}]*"diff"\s*:\s*\[.*?\]\s*\}', content, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
            if "diff" in data:
                return data["diff"]
    except (json.JSONDecodeError, AttributeError):
        pass

    return None


def _clean_content(content: str) -> str:
    """응답에서 JSON 블록을 제거하여 깨끗한 텍스트만 반환한다."""
    import re
    # ```json ... ``` 블록 제거
    cleaned = re.sub(r'```json\s*\{.*?\}\s*```', '', content, flags=re.DOTALL)
    # 빈 줄 정리
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    return cleaned.strip()


def _generate_suggestions(basket_items: list[dict], last_message: str) -> list[str]:
    """현재 상태에 맞는 추천 명령을 생성한다."""
    suggestions = []

    if basket_items:
        suggestions.append("분석 시작해줘")
        suggestions.append("장바구니 보여줘")
    else:
        suggestions.append("계란 30구 추가해줘")
        suggestions.append("김치찌개 재료 추천해줘")

    suggestions.append("도움말")
    return suggestions



async def generate_greeting(basket_items: list[dict]) -> dict:
    """앱 진입 시점의 첫 인사말과 제안을 생성한다."""
    # 간단한 규칙 기반 인사말 생성 (MVP)
    # 실제로는 이것도 LLM에 맡길 수 있지만, 응답 속도를 위해 로직 처리
    
    greeting = "안녕하세요! 👋 저는 똑장 AI 비서예요.\n장바구니에 담을 품목을 알려주세요!"
    
    # 재구매 임박 상품 확인
    due_items = [
        item["item_name"] for item in _MOCK_PURCHASE_HISTORY 
        if item["status"] in ["due", "overdue"]
    ]
    
    suggestions = ["계란 30구 추가해줘", "김치찌개 재료 추천해줘"]
    
    if due_items:
        products = ", ".join(due_items[:2])
        greeting += f"\n\n💡 {products} 구매하실 때가 되었어요. 추가할까요?"
        suggestions.insert(0, f"{due_items[0]} 추가해줘")
    
    # 만약 장바구니가 비어있지 않다면
    if basket_items:
        greeting = "장바구니에 담긴 물건들을 확인하고 있어요. 무엇을 더 도와드릴까요?"

    return {
        "content": greeting,
        "diff": None,
        "suggestions": suggestions,
    }




async def _apply_preferences(diff: list[dict], user_id: str) -> list[str]:
    """Diff 항목에 대해 선호 브랜드를 확인하고 적용한다 (LOCKED 모드)."""
    messages = []
    
    canon_service = CanonicalizationService()
    repo = PreferredBrandRepository()
    
    for item in diff:
        action = item.get("action")
        if action not in ["add", "modify"]:
            continue
            
        # 이미 고정 모드라면 건너뜀 (사용자가 명시적으로 브랜드 언급했을 가능성 있음)
        # 하지만 LLM이 맘대로 fixed를 붙였을 수도 있으니... 
        # 정책: LLM이 "brand"를 비워뒀거나, 추천모드일 때만 개입.
        # 만약 사용자가 "풀무원 두부 줘" 했으면 LLM이 brand="풀무원" mode="fixed" 줄 것임.
        # 이때는 개입 안 하는게 안전.
        
        current_brand = item.get("brand")
        current_mode = item.get("mode")
        
        # 브랜드가 지정되어 있고 고정 모드면 패스 (사용자 의도 존중)
        if current_brand and current_mode == "fixed":
            continue

        item_name = item.get("item_name", "")
        size = item.get("size")
        
        # 1. Canonical ID 생성
        canonical_id = canon_service.get_canonical_id(item_name, size)
        
        # 2. 선호 브랜드 조회
        pref = await repo.get(user_id, canonical_id)
        
        if pref:
            # 3. Invariant Matching (규격/수량 보정)
            # 예: 사용자 "30구" vs 선호 "15구" -> 수량 2배
            
            # (1) 숫자 추출 헬퍼 (간단 버전)
            import re
            def extract_qty(text):
                if not text: return None
                match = re.search(r'(\d+)', text)
                return int(match.group(1)) if match else None

            target_qty_spec = extract_qty(size) # 사용자가 말한 규격 (30)
            pref_qty_spec = extract_qty(pref.preferred_variant) # 선호 브랜드 규격 (15)
            
            new_quantity = item.get("quantity", 1)
            reason_suffix = ""

            if target_qty_spec and pref_qty_spec and target_qty_spec > pref_qty_spec:
                 # 배수 관계 확인 (약수 여부)
                 if target_qty_spec % pref_qty_spec == 0:
                     multiplier = target_qty_spec // pref_qty_spec # 30 // 15 = 2
                     new_quantity = new_quantity * multiplier
                     reason_suffix = f" ({size} → {pref.preferred_variant} x{multiplier})"
            
            # 4. Diff 수정 (Override)
            item["brand"] = pref.preferred_brand
            if pref.preferred_variant:
                item["size"] = pref.preferred_variant
            
            item["quantity"] = new_quantity
            item["mode"] = "fixed" # LOCKED 모드로 전환
            item["reason"] = f"❤️ 선호 브랜드 적용{reason_suffix}"
            
            # 5. 안내 메시지 생성
            msg = f"💡 선호하시는 **{pref.preferred_brand}** 브랜드로 담았어요.{reason_suffix}"
            messages.append(msg)
            
    return messages


def clear_chat_history():
    """대화 히스토리를 초기화한다."""
    global _chat_history
    _chat_history.clear()
