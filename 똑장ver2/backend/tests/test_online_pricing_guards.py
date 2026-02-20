from __future__ import annotations

import pytest

from src.application.services.online_plan_adapter import OnlinePlanAdapter
from src.domain.models.basket import Basket, BasketItem
from src.domain.models.plan import PlanItem


class StubShoppingProvider:
    async def search_products(self, item: BasketItem, max_results: int = 80, required_keywords: list[str] | None = None):
        _ = max_results
        _ = required_keywords
        return [
            PlanItem(
                item_name=item.item_name,
                brand=None,
                size=item.size,
                quantity=item.quantity,
                price=120,
                store_name="이마트몰",
                url="https://ssg.com/p/1",
                is_sold_out=False,
            ),
            PlanItem(
                item_name=item.item_name,
                brand=None,
                size=item.size,
                quantity=item.quantity,
                price=2500,
                store_name="이마트몰",
                url="https://ssg.com/p/2",
                is_sold_out=False,
            ),
            PlanItem(
                item_name=item.item_name,
                brand=None,
                size=item.size,
                quantity=item.quantity,
                price=2600,
                store_name="홈플러스",
                url="https://homeplus.co.kr/p/1",
                is_sold_out=False,
            ),
            PlanItem(
                item_name=item.item_name,
                brand=None,
                size=item.size,
                quantity=item.quantity,
                price=2700,
                store_name="마켓컬리",
                url="https://kurly.com/p/1",
                is_sold_out=False,
            ),
            PlanItem(
                item_name=item.item_name,
                brand=None,
                size=item.size,
                quantity=item.quantity,
                price=2800,
                store_name="쿠팡",
                url="https://coupang.com/p/1",
                is_sold_out=False,
            ),
        ]


@pytest.mark.asyncio
async def test_online_adapter_filters_extreme_low_price_outlier():
    adapter = OnlinePlanAdapter(provider=StubShoppingProvider())
    basket = Basket(items=[BasketItem(item_name="우유", quantity=1)])

    result = await adapter.build_candidates(basket)
    assert result.candidates

    emart = next(plan for plan in result.candidates if "이마트" in plan.mart_name)
    assert emart.items[0].price == 2500

