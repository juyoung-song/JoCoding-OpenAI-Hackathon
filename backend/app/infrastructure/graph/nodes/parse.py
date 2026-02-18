"""사용자 입력 파싱 노드 — 자연어 → 구조화된 의도 + 품목 추출."""

from langchain_core.messages import SystemMessage

from app.infrastructure.graph.state.chat_state import ChatState

PARSE_SYSTEM_PROMPT = """당신은 '똑장' 장보기 에이전트입니다.
사용자의 메시지를 분석하여 다음 중 하나의 의도(intent)를 판별하세요:

- add: 장바구니에 품목 추가
- remove: 장바구니에서 품목 삭제
- modify: 기존 품목 수정 (수량, 브랜드 등)
- recipe: 요리 기반 재료 자동 구성
- search: 가격 비교 / 분석 시작 요청
- clear: 전체 삭제
- general: 일반 대화

반드시 변경안(diff)을 먼저 보여주고, 사용자 확인 후에만 적용하세요.
고정모드(🔒) 상품의 브랜드를 자동 변경하지 마세요.
"""


async def parse_node(state: ChatState) -> dict:
    """사용자 입력을 파싱하는 노드.

    LLM을 호출하여 의도(intent)와 품목을 추출한다.
    실제 LLM 연동은 OpenAI API 키 설정 후 활성화.
    """
    # TODO: LLM 호출로 의도 파악 및 품목 추출
    # 현재는 스텁으로 general intent 반환
    return {
        "intent": "general",
        "pending_diff": None,
    }
