from __future__ import annotations

import pytest

from src.application.product_matcher import ProductMatcher
from src.domain.types import BasketItem
from tests.test_support import create_test_db


@pytest.mark.asyncio
async def test_exact_name_match() -> None:
    db = await create_test_db()
    try:
        matcher = ProductMatcher(db)
        result = await matcher.match(BasketItem(item_name="우유", brand="서울우유", size="1L", quantity=1))
        assert result
        assert result.product_norm_key == "p_milk_1l"
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_brand_filter() -> None:
    db = await create_test_db()
    try:
        matcher = ProductMatcher(db)
        result = await matcher.match(BasketItem(item_name="우유", brand="매일", quantity=1))
        assert result
        assert result.brand == "매일"
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_size_filter() -> None:
    db = await create_test_db()
    try:
        matcher = ProductMatcher(db)
        result = await matcher.match(BasketItem(item_name="우유", size="900ml", quantity=1))
        assert result
        assert result.size_display == "900ml"
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_size_mismatch_returns_none_for_manual_selection() -> None:
    db = await create_test_db()
    try:
        matcher = ProductMatcher(db)
        result = await matcher.match(BasketItem(item_name="우유", size="500ml", quantity=1))
        assert result is None
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_no_brand_creates_assumption() -> None:
    db = await create_test_db()
    try:
        matcher = ProductMatcher(db)
        result = await matcher.match(BasketItem(item_name="우유", quantity=1))
        assert result
        assert any(a.field == "brand" for a in result.assumptions)
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_no_size_creates_assumption() -> None:
    db = await create_test_db()
    try:
        matcher = ProductMatcher(db)
        result = await matcher.match(BasketItem(item_name="우유", quantity=1))
        assert result
        assert any(a.field == "size" for a in result.assumptions)
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_alias_fallback() -> None:
    db = await create_test_db()
    try:
        matcher = ProductMatcher(db)
        result = await matcher.match(BasketItem(item_name="달걀", quantity=1))
        assert result
        assert result.product_norm_key == "p_egg_10"
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_search_based_free_text_match() -> None:
    db = await create_test_db()
    try:
        matcher = ProductMatcher(db)
        result = await matcher.match(BasketItem(item_name="흰 우유", quantity=1))
        assert result
        assert result.product_norm_key in {"p_milk_1l", "p_milk_900"}
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_no_match_returns_none() -> None:
    db = await create_test_db()
    try:
        matcher = ProductMatcher(db)
        result = await matcher.match(BasketItem(item_name="없는품목", quantity=1))
        assert result is None
    finally:
        await db.close()
