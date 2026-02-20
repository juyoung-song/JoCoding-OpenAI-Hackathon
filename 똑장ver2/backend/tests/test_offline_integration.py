"""루트 backend 오프라인 엔진 단계 이식 검증 테스트."""
from __future__ import annotations

import pytest
import aiosqlite

from src.application.services.offline_plan_adapter import OfflinePlanAdapter
from src.application.services.product_matcher_db import ProductMatcherDB
from src.domain.models.basket import Basket, BasketItem
from src.infrastructure.persistence.database import INIT_SQL
from src.infrastructure.persistence.seed_offline_mock_data import seed_offline_mock_data


@pytest.mark.asyncio
async def test_product_matcher_db_matches_milk():
    async with aiosqlite.connect(":memory:") as db:
        db.row_factory = aiosqlite.Row
        await db.executescript(INIT_SQL)
        await seed_offline_mock_data(db)
        matcher = ProductMatcherDB(db)
        matched = await matcher.match(BasketItem(item_name="서울우유"))
        assert matched is not None
        assert "우유" in matched.normalized_name


@pytest.mark.asyncio
async def test_offline_plan_adapter_builds_candidates():
    async with aiosqlite.connect(":memory:") as db:
        db.row_factory = aiosqlite.Row
        await db.executescript(INIT_SQL)
        await seed_offline_mock_data(db)
        adapter = OfflinePlanAdapter(db)
        basket = Basket(
            items=[
                BasketItem(item_name="삼겹살", quantity=1),
                BasketItem(item_name="우유", quantity=1),
                BasketItem(item_name="두부", quantity=1),
            ]
        )
        result = await adapter.build_candidates(basket, mode="offline")
        assert len(result.candidates) > 0
        assert all(candidate.coverage > 0 for candidate in result.candidates)
        assert all(candidate.total_basket_items == 3 for candidate in result.candidates)
