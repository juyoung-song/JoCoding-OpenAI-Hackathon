from __future__ import annotations

import pytest
from pydantic import ValidationError

from src.application.plan_service import PlanService
from src.domain.types import GeneratePlanRequest, SelectPlanRequest, TravelMode, UserContext
from src.infrastructure.providers.mock_providers import MockRoutingProvider, MockWeatherProvider
from tests.test_support import create_test_db


class BrokenRoutingProvider:
    async def estimate(self, origin, destination, travel_mode):
        raise RuntimeError("routing fail")


class BrokenWeatherProvider:
    async def get_advisory(self, lat, lng, time_window):
        raise RuntimeError("weather fail")


def _request(lat: float = 37.498, lng: float = 127.028, mode: TravelMode = TravelMode.WALK) -> GeneratePlanRequest:
    return GeneratePlanRequest(
        user_context=UserContext(lat=lat, lng=lng, travel_mode=mode, max_travel_minutes=25),
        basket_items=[
            {"item_name": "우유", "quantity": 1},
            {"item_name": "계란", "quantity": 1},
        ],
    )


@pytest.mark.asyncio
async def test_generate_plans_returns_three_plans() -> None:
    db = await create_test_db()
    try:
        service = PlanService(db, MockRoutingProvider(), MockWeatherProvider())
        result = await service.generate_plans(_request())
        assert len(result.plans) == 3
    finally:
        await db.close()


def test_generate_empty_basket_error() -> None:
    with pytest.raises(ValidationError):
        GeneratePlanRequest(
            user_context=UserContext(lat=37.498, lng=127.028, travel_mode=TravelMode.WALK, max_travel_minutes=20),
            basket_items=[],
        )


@pytest.mark.asyncio
async def test_no_nearby_stores_falls_back_to_available_candidates() -> None:
    db = await create_test_db()
    try:
        service = PlanService(db, MockRoutingProvider(), MockWeatherProvider())
        result = await service.generate_plans(_request(lat=33.45, lng=126.57))
        assert result.plans
        assert "place" in result.meta.degraded_providers
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_routing_failure_degrades_gracefully() -> None:
    db = await create_test_db()
    try:
        service = PlanService(db, BrokenRoutingProvider(), MockWeatherProvider())
        result = await service.generate_plans(_request())
        assert result.plans
        assert "routing" in result.meta.degraded_providers
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_weather_failure_returns_info_unavailable() -> None:
    db = await create_test_db()
    try:
        service = PlanService(db, MockRoutingProvider(), BrokenWeatherProvider())
        result = await service.generate_plans(_request())
        assert result.plans
        assert all(plan.weather_note == "정보 없음" for plan in result.plans)
        assert "weather" in result.meta.degraded_providers
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_select_plan_returns_navigation_url() -> None:
    db = await create_test_db()
    try:
        service = PlanService(db, MockRoutingProvider(), MockWeatherProvider())
        selected = await service.select_plan(
            SelectPlanRequest(
                request_id="req-1",
                selected_plan_type="lowest",
                store_id="s1",
            )
        )
        assert selected
        assert selected.navigation_url.startswith("nmap://route")
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_select_nonexistent_store_returns_404() -> None:
    db = await create_test_db()
    try:
        service = PlanService(db, MockRoutingProvider(), MockWeatherProvider())
        selected = await service.select_plan(
            SelectPlanRequest(
                request_id="req-1",
                selected_plan_type="lowest",
                store_id="not_exists",
            )
        )
        assert selected is None
    finally:
        await db.close()
