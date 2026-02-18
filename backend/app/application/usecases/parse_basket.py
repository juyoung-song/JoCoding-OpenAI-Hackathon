"""장바구니 파싱 유즈케이스 — 자연어 → BasketItem 리스트 변환."""

from app.domain.models.basket import BasketItem, ItemMode


async def parse_basket_input(text: str) -> list[BasketItem]:
    """자연어 입력을 BasketItem 리스트로 변환한다.

    TODO: LLM을 활용한 고급 파싱 구현 (OpenAI API 키 설정 후)
    현재는 간단한 규칙 기반 파싱 스텁.

    Examples:
        "계란 30구" → [BasketItem(item_name="계란", size="30구", ...)]
        "서울우유 1L 2개" → [BasketItem(item_name="우유", brand="서울우유", ...)]
    """
    # 스텁: 입력 텍스트를 그대로 하나의 품목으로 생성
    items = []
    if text.strip():
        items.append(
            BasketItem(
                item_name=text.strip(),
                mode=ItemMode.RECOMMEND,
            )
        )
    return items
