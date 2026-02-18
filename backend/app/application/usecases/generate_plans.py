"""플랜 생성 유즈케이스 — 네이버 쇼핑 API 실제 호출 기반.

장바구니의 각 품목을 네이버 쇼핑 API로 검색하여
쇼핑몰별 가격을 수집하고, 총액 기준으로 Top3 플랜을 생성한다.
"""

import asyncio
from collections import defaultdict
from datetime import datetime

from app.domain.models.basket import BasketItem
from app.domain.models.plan import Plan
from app.domain.models.user_preferences import ShoppingContext
from app.application.services.mall_comparer import MallComparisonService
from app.infrastructure.providers.naver_shopping import NaverShoppingProvider
from app.infrastructure.providers.mock_offline import MockOfflineProvider


async def generate_plans(
    basket_items: list[BasketItem],
    context: ShoppingContext = None
) -> list[Plan]:
    """장바구니와 사용자 설정을 기반으로 Top3 플랜을 생성한다.
    
    기존의 최저가/거리순 로직 대신, 사용자가 요청한 '몰별 비교(이마트/홈플러스/컬리)' 로직으로 대체.
    """

    from app.application.services.mall_comparer import MallComparisonService
    
    comparer = MallComparisonService()
    plans = await comparer.compare_basket(basket_items)

    # 아이콘 추가 (UI 처리를 위해)
    for p in plans:
        p.mart_icon = _get_mall_icon(p.mart_name)
    
    # 정렬: 커버리지 내림차순 -> 총액 오름차순 (이미 Comparer에서 총액순 정렬됨)
    # 하지만 커버리지가 낮은건 뒤로 보내야 함.
    plans.sort(key=lambda x: (x.coverage != x.total_basket_items, x.estimated_total))

    return plans


def _get_mall_icon(mall_name: str) -> str:
    """쇼핑몰 이름에 따른 아이콘을 반환한다."""
    icons = {
        "쿠팡": "🚀",
        "네이버": "🟢",
        "마켓컬리": "🥬",
        "컬리": "🥬",
        "이마트": "🏪",
        "홈플러스": "🏬",
        "롯데마트": "🔴",
        "SSG": "🟡",
        "GS": "🟠",
        "옥션": "📦",
        "G마켓": "🟩",
        "11번가": "🔶",
    }
    for key, icon in icons.items():
        if key in mall_name:
            return icon
    return "🛒"
