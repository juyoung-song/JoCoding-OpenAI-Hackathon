from __future__ import annotations

import pytest

from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.api.dependencies import get_plan_service
from src.api.routes import router
from src.application.plan_service import PlanService
from src.infrastructure.providers.mock_providers import MockRoutingProvider, MockWeatherProvider
from tests.test_support import create_test_db


class BrokenWeatherProvider:
    async def get_advisory(self, lat, lng, time_window):
        raise RuntimeError("weather fail")


def _build_client(service: PlanService) -> TestClient:
    app = FastAPI()
    app.include_router(router, prefix="/v1/offline")
    app.dependency_overrides[get_plan_service] = lambda: service
    app.state.db = service._db
    return TestClient(app)


def _generate_payload(lat: float = 37.498, lng: float = 127.028) -> dict:
    return {
        "user_context": {
            "lat": lat,
            "lng": lng,
            "travel_mode": "walk",
            "max_travel_minutes": 25,
        },
        "basket_items": [
            {"item_name": "우유", "quantity": 1},
            {"item_name": "계란", "quantity": 1},
        ],
    }


def _assert_no_forbidden_keys(value):
    if isinstance(value, dict):
        for key, child in value.items():
            assert not key.startswith("accuracy_")
            assert not key.startswith("confidence_")
            _assert_no_forbidden_keys(child)
    elif isinstance(value, list):
        for child in value:
            _assert_no_forbidden_keys(child)


@pytest.mark.asyncio
async def test_generate_endpoint_200() -> None:
    db = await create_test_db()
    client = _build_client(PlanService(db, MockRoutingProvider(), MockWeatherProvider()))
    try:
        response = client.post("/v1/offline/plans/generate", json=_generate_payload())
        assert response.status_code == 200
        assert len(response.json()["plans"]) == 3
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_generate_endpoint_206_degraded() -> None:
    db = await create_test_db()
    client = _build_client(PlanService(db, MockRoutingProvider(), BrokenWeatherProvider()))
    try:
        response = client.post("/v1/offline/plans/generate", json=_generate_payload())
        assert response.status_code == 206
        assert "weather" in response.json()["meta"]["degraded_providers"]
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_generate_endpoint_206_with_fallback_when_no_nearby_stores() -> None:
    db = await create_test_db()
    client = _build_client(PlanService(db, MockRoutingProvider(), MockWeatherProvider()))
    try:
        response = client.post("/v1/offline/plans/generate", json=_generate_payload(33.45, 126.57))
        assert response.status_code == 206
        body = response.json()
        assert body["plans"]
        assert "place" in body["meta"]["degraded_providers"]
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_select_endpoint_200() -> None:
    db = await create_test_db()
    client = _build_client(PlanService(db, MockRoutingProvider(), MockWeatherProvider()))
    try:
        response = client.post(
            "/v1/offline/plans/select",
            json={"request_id": "req-1", "selected_plan_type": "lowest", "store_id": "s1"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "confirmed"
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_select_endpoint_404() -> None:
    db = await create_test_db()
    client = _build_client(PlanService(db, MockRoutingProvider(), MockWeatherProvider()))
    try:
        response = client.post(
            "/v1/offline/plans/select",
            json={"request_id": "req-1", "selected_plan_type": "lowest", "store_id": "missing"},
        )
        assert response.status_code == 404
        assert response.json()["code"] == "PLAN_NOT_FOUND"
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_compliance_no_accuracy_fields() -> None:
    db = await create_test_db()
    client = _build_client(PlanService(db, MockRoutingProvider(), MockWeatherProvider()))
    try:
        response = client.post("/v1/offline/plans/generate", json=_generate_payload())
        assert response.status_code == 200
        _assert_no_forbidden_keys(response.json())
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_geocode_endpoint_503_without_keys(monkeypatch) -> None:
    monkeypatch.setenv("NAVER_CLIENT_ID", "")
    monkeypatch.setenv("NAVER_CLIENT_SECRET", "")
    db = await create_test_db()
    client = _build_client(PlanService(db, MockRoutingProvider(), MockWeatherProvider()))
    try:
        response = client.get("/v1/offline/utils/geocode", params={"query": "서울 강남구 테헤란로"})
        assert response.status_code == 503
        assert response.json()["code"] == "GEOCODER_UNAVAILABLE"
    finally:
        await db.close()


class _MockGeocodeResponse:
    status_code = 200

    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict:
        return {
            "items": [
                {
                    "mapx": "1270280000",
                    "mapy": "374980000",
                    "roadAddress": "서울 강남구 테헤란로",
                }
            ]
        }


@pytest.mark.asyncio
async def test_geocode_endpoint_200(monkeypatch) -> None:
    monkeypatch.setenv("NAVER_CLIENT_ID", "id")
    monkeypatch.setenv("NAVER_CLIENT_SECRET", "secret")

    async def _mock_get(self, url, headers=None, params=None):
        return _MockGeocodeResponse()

    monkeypatch.setattr("src.api.routes.httpx.AsyncClient.get", _mock_get)

    db = await create_test_db()
    client = _build_client(PlanService(db, MockRoutingProvider(), MockWeatherProvider()))
    try:
        response = client.get("/v1/offline/utils/geocode", params={"query": "서울 강남구 테헤란로"})
        assert response.status_code == 200
        body = response.json()
        assert body["lat"] == 37.498
        assert body["lng"] == 127.028
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_match_candidates_endpoint_returns_suggestions() -> None:
    db = await create_test_db()
    client = _build_client(PlanService(db, MockRoutingProvider(), MockWeatherProvider()))
    try:
        response = client.post(
            "/v1/offline/utils/match-candidates",
            json={"items": [{"item_name": "흰 우유", "quantity": 1}]},
        )
        assert response.status_code == 200
        body = response.json()
        assert "items" in body
        assert len(body["items"]) == 1
        assert body["items"][0]["item_name"] == "흰 우유"
        assert len(body["items"][0]["candidates"]) >= 1
    finally:
        await db.close()
