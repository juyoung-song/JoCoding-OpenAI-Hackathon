from __future__ import annotations

import json
import math
import re
import time
import hashlib
from datetime import datetime, timezone
from uuid import uuid4

import aiosqlite
import httpx

from src.config import Settings
from src.domain.types import OfflineStore
from src.infrastructure.persistence.cache_service import CacheService
from src.infrastructure.providers.provider_budget import BudgetExceededError, enforce_api_budget


class NaverLocalPlaceProvider:
    """네이버 Local 검색 기반 매장 후보 Provider."""

    _ENDPOINT = "https://openapi.naver.com/v1/search/local.json"
    _HTML_TAG_RE = re.compile(r"<[^>]+>")

    def __init__(self, settings: Settings, cache: CacheService, db: aiosqlite.Connection) -> None:
        self._settings = settings
        self._cache = cache
        self._db = db

    async def search_nearby(
        self, lat: float, lng: float, categories: list[str], radius: int
    ) -> list[OfflineStore]:
        if not self._settings.naver_client_id or not self._settings.naver_client_secret:
            return []

        merged: dict[str, OfflineStore] = {}
        headers = {
            "X-Naver-Client-Id": self._settings.naver_client_id,
            "X-Naver-Client-Secret": self._settings.naver_client_secret,
        }

        for category in categories:
            cache_key = f"place:{lat:.3f}:{lng:.3f}:{category}:{radius}"
            started = time.monotonic()
            cached = await self._cache.get(cache_key)
            if cached:
                rows = json.loads(cached)
                for row in rows:
                    store = OfflineStore(**row)
                    merged[store.store_id] = store
                await self._log_call("naver_place", "local_search", 200, started, cache_hit=True, error_class=None)
                continue

            try:
                await enforce_api_budget(self._db, self._settings)
                params = {
                    "query": f"마트 {category}".strip(),
                    "display": 20,
                    "start": 1,
                    "sort": "random",
                }
                async with httpx.AsyncClient(timeout=8.0) as client:
                    response = await client.get(self._ENDPOINT, headers=headers, params=params)
                response.raise_for_status()
                payload = response.json()

                stores: list[OfflineStore] = []
                for item in payload.get("items", []):
                    converted = self._to_store(item, category)
                    if not converted:
                        continue
                    distance_m = self._haversine_km(lat, lng, converted.lat, converted.lng) * 1000.0
                    if distance_m <= radius:
                        stores.append(converted)
                        merged[converted.store_id] = converted

                await self._cache.set(
                    cache_key,
                    json.dumps([s.model_dump(mode="json") for s in stores], ensure_ascii=False),
                    self._settings.cache_ttl_place,
                )
                await self._log_call(
                    "naver_place",
                    "local_search",
                    response.status_code,
                    started,
                    cache_hit=False,
                    error_class=None,
                )
            except Exception as exc:
                status_code = getattr(getattr(exc, "response", None), "status_code", None)
                await self._log_call(
                    "naver_place",
                    "local_search",
                    status_code,
                    started,
                    cache_hit=False,
                    error_class=exc.__class__.__name__,
                )
                if isinstance(exc, BudgetExceededError):
                    break

        return list(merged.values())

    def _to_store(self, item: dict, category: str) -> OfflineStore | None:
        mapx = item.get("mapx")
        mapy = item.get("mapy")
        if not mapx or not mapy:
            return None

        coords = self._parse_coordinates(mapx, mapy)
        if not coords:
            return None
        lat, lng = coords

        title = self._HTML_TAG_RE.sub("", item.get("title", "")).strip()
        address = item.get("roadAddress") or item.get("address") or ""
        identity = f"{title}|{address}|{lat:.6f}|{lng:.6f}"
        store_id = f"naver:{hashlib.md5(identity.encode('utf-8')).hexdigest()[:16]}"
        return OfflineStore(
            store_id=store_id,
            store_name=title or "이름 없음",
            address=address,
            category=category,
            lat=lat,
            lng=lng,
            source="naver_local",
            is_active=True,
            updated_at=datetime.now(timezone.utc),
        )

    def _parse_coordinates(self, mapx: object, mapy: object) -> tuple[float, float] | None:
        try:
            raw_x = float(mapx)
            raw_y = float(mapy)
        except (TypeError, ValueError):
            return None

        # 일부 응답은 이미 WGS84, 일부는 1e7 스케일 좌표를 반환.
        if -180.0 <= raw_x <= 180.0 and -90.0 <= raw_y <= 90.0:
            lng, lat = raw_x, raw_y
        elif 1_240_000_000 <= raw_x <= 1_320_000_000 and 330_000_000 <= raw_y <= 390_000_000:
            lng, lat = raw_x / 10_000_000.0, raw_y / 10_000_000.0
        else:
            return None

        if not self._is_valid_korea_wgs84(lat, lng):
            return None
        return lat, lng

    def _is_valid_korea_wgs84(self, lat: float, lng: float) -> bool:
        return 33.0 <= lat <= 39.5 and 124.0 <= lng <= 132.0

    def _haversine_km(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        r = 6371.0
        d_lat = math.radians(lat2 - lat1)
        d_lng = math.radians(lng2 - lng1)
        a = (math.sin(d_lat / 2) ** 2
             + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
             * math.sin(d_lng / 2) ** 2)
        return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

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
