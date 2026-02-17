from __future__ import annotations

import json
import math
import time
from datetime import datetime, timezone
from uuid import uuid4

import aiosqlite
import httpx

from src.config import Settings
from src.domain.types import RouteEstimate
from src.infrastructure.persistence.cache_service import CacheService
from src.infrastructure.providers.provider_budget import BudgetExceededError, enforce_api_budget


class NaverRoutingProvider:
    """네이버 Directions 5 기반 차량 이동시간 Provider."""

    _ENDPOINT = "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving"

    def __init__(self, settings: Settings, cache: CacheService, db: aiosqlite.Connection) -> None:
        self._settings = settings
        self._cache = cache
        self._db = db

    async def estimate(
        self, origin: tuple[float, float], destination: tuple[float, float], travel_mode: str
    ) -> RouteEstimate:
        if travel_mode == "walk":
            return self._estimate_linear(origin, destination, travel_mode)
        if travel_mode == "transit":
            return self._estimate_linear(origin, destination, travel_mode)
        if travel_mode != "car":
            return self._estimate_linear(origin, destination, travel_mode)

        o_lat, o_lng = origin
        d_lat, d_lng = destination
        cache_key = f"route:car:{o_lat:.5f}:{o_lng:.5f}:{d_lat:.5f}:{d_lng:.5f}"
        started = time.monotonic()

        cached = await self._cache.get(cache_key)
        if cached:
            await self._log_call("naver_routing", "driving", 200, started, cache_hit=True, error_class=None)
            return RouteEstimate(**json.loads(cached))

        if not self._settings.ncp_client_id or not self._settings.ncp_client_secret:
            raise RuntimeError("NCP routing credentials are not configured.")
        try:
            await enforce_api_budget(self._db, self._settings)
        except BudgetExceededError as exc:
            await self._log_call(
                "naver_routing",
                "driving",
                None,
                started,
                cache_hit=False,
                error_class=exc.__class__.__name__,
            )
            raise

        headers = {
            "X-NCP-APIGW-API-KEY-ID": self._settings.ncp_client_id,
            "X-NCP-APIGW-API-KEY": self._settings.ncp_client_secret,
        }
        params = {"start": f"{o_lng},{o_lat}", "goal": f"{d_lng},{d_lat}"}

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(self._ENDPOINT, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            summary = data["route"]["traoptimal"][0]["summary"]
            distance_km = round(float(summary["distance"]) / 1000.0, 1)
            travel_minutes = max(1, round(float(summary["duration"]) / 60000.0))
            result = RouteEstimate(distance_km=distance_km, travel_minutes=travel_minutes, is_estimated=False)
            await self._cache.set(cache_key, result.model_dump_json(), self._settings.cache_ttl_route_car)
            await self._log_call("naver_routing", "driving", response.status_code, started, cache_hit=False, error_class=None)
            return result
        except Exception as exc:
            status_code = getattr(getattr(exc, "response", None), "status_code", None)
            await self._log_call(
                "naver_routing",
                "driving",
                status_code,
                started,
                cache_hit=False,
                error_class=exc.__class__.__name__,
            )
            raise

    def _estimate_linear(
        self, origin: tuple[float, float], destination: tuple[float, float], travel_mode: str
    ) -> RouteEstimate:
        lat1, lng1 = origin
        lat2, lng2 = destination
        r = 6371
        d_lat = math.radians(lat2 - lat1)
        d_lng = math.radians(lng2 - lng1)
        a = (math.sin(d_lat / 2) ** 2
             + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
             * math.sin(d_lng / 2) ** 2)
        distance_km = r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        if travel_mode == "walk":
            minutes = round(distance_km * 1000 * 1.3 / 66.7)
        elif travel_mode == "transit":
            minutes = round(distance_km * 1000 * 1.8 / 66.7)
        else:
            minutes = max(1, round(distance_km / 0.5))

        return RouteEstimate(distance_km=round(distance_km, 1), travel_minutes=max(1, minutes), is_estimated=True)

    async def _log_call(
        self,
        provider_name: str,
        endpoint_key: str,
        status_code: int | None,
        started: float,
        cache_hit: bool,
        error_class: str | None,
    ) -> None:
        latency_ms = int((time.monotonic() - started) * 1000)
        try:
            await self._db.execute(
                """INSERT INTO offline_provider_call_log
                   (call_id, provider_name, endpoint_key, status_code, latency_ms, cache_hit, error_class, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    str(uuid4()),
                    provider_name,
                    endpoint_key,
                    status_code,
                    latency_ms,
                    int(cache_hit),
                    error_class,
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            await self._db.commit()
        except Exception:
            return
