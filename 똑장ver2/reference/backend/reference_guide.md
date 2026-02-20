# 똑장 Reference Backend — 코드 참고 가이드

> **경로**: `reference/backend/JoCoding-OpenAI-Hackathon-ICH/backend/src/`
> **목적**: 새 서비스 개발 시 재사용 가능한 코드 모음

---

## 1. config.py — 환경변수 설정

**역할**: API 키, DB 경로, 캐시 TTL, API 예산 임계치를 환경변수로 관리. `frozen=True` dataclass라 불변 객체로 안전하게 사용 가능.

```python
from __future__ import annotations
import os
from dataclasses import dataclass, field

@dataclass(frozen=True)
class Settings:
    database_url: str = field(default_factory=lambda: os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./app.db"))
    cache_database_url: str = field(default_factory=lambda: os.getenv("CACHE_DATABASE_URL", "sqlite+aiosqlite:///./cache.db"))

    # 네이버 검색 API (Place Provider)
    naver_client_id: str = field(default_factory=lambda: os.getenv("NAVER_CLIENT_ID", ""))
    naver_client_secret: str = field(default_factory=lambda: os.getenv("NAVER_CLIENT_SECRET", ""))

    # 네이버 클라우드 플랫폼 (Routing Provider)
    ncp_client_id: str = field(default_factory=lambda: os.getenv("NCP_CLIENT_ID", ""))
    ncp_client_secret: str = field(default_factory=lambda: os.getenv("NCP_CLIENT_SECRET", ""))

    # 기상청 단기예보 API
    kma_service_key: str = field(default_factory=lambda: os.getenv("KMA_SERVICE_KEY", ""))

    # 참가격 공공데이터 API
    kamis_api_key: str = field(default_factory=lambda: os.getenv("KAMIS_API_KEY", ""))
    kamis_cert_id: str = field(default_factory=lambda: os.getenv("KAMIS_CERT_ID", ""))

    # 캐시 TTL (초)
    cache_ttl_place: int = 1800       # 30분
    cache_ttl_route_car: int = 600    # 10분
    cache_ttl_weather: int = 1800     # 30분

    # API 호출 예산
    monthly_api_call_limit: int = 300_000
    budget_warning_ratio: float = 0.80
    budget_critical_ratio: float = 0.95

def get_settings() -> Settings:
    return Settings()
```

---

## 2. infrastructure/persistence/database.py — DB 초기화 및 연결

**역할**: SQLite 앱 DB / 캐시 DB를 분리 관리. WAL 모드로 동시 읽기 성능 향상. 앱 시작 시 테이블 자동 생성.

```python
from __future__ import annotations
import aiosqlite

_APP_DB_PATH = "app.db"
_CACHE_DB_PATH = "cache.db"

APP_SCHEMA = """
CREATE TABLE IF NOT EXISTS store_master (
    store_id   TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    address    TEXT NOT NULL,
    category   TEXT NOT NULL,
    lat        REAL NOT NULL,
    lng        REAL NOT NULL,
    source     TEXT NOT NULL,
    is_active  INTEGER DEFAULT 1,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS product_norm (
    product_norm_key TEXT PRIMARY KEY,
    normalized_name  TEXT NOT NULL,
    brand            TEXT,
    size_value       REAL,
    size_unit        TEXT,
    size_display     TEXT,
    category         TEXT,
    aliases_json     TEXT,
    updated_at       DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS offline_price_snapshot (
    price_snapshot_key TEXT PRIMARY KEY,
    store_id           TEXT NOT NULL REFERENCES store_master(store_id),
    product_norm_key   TEXT NOT NULL REFERENCES product_norm(product_norm_key),
    price_won          INTEGER NOT NULL CHECK(price_won > 0),
    observed_at        DATETIME NOT NULL,
    source             TEXT NOT NULL,
    notice             TEXT NOT NULL,
    created_at         DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_price_store ON offline_price_snapshot(store_id);
CREATE INDEX IF NOT EXISTS idx_price_product ON offline_price_snapshot(product_norm_key);

CREATE TABLE IF NOT EXISTS offline_plan_execution_log (
    execution_id          TEXT PRIMARY KEY,
    request_id            TEXT NOT NULL,
    item_count            INTEGER NOT NULL,
    candidate_store_count INTEGER NOT NULL,
    filtered_store_count  INTEGER NOT NULL,
    selected_plan_types   TEXT NOT NULL,
    latency_ms            INTEGER NOT NULL,
    degraded              INTEGER DEFAULT 0,
    created_at            DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS offline_provider_call_log (
    call_id       TEXT PRIMARY KEY,
    provider_name TEXT NOT NULL,
    endpoint_key  TEXT NOT NULL,
    status_code   INTEGER,
    latency_ms    INTEGER NOT NULL,
    cache_hit     INTEGER DEFAULT 0,
    error_class   TEXT,
    created_at    DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS offline_plan_selection_log (
    selection_id       TEXT PRIMARY KEY,
    request_id         TEXT NOT NULL,
    selected_plan_type TEXT NOT NULL,
    store_id           TEXT NOT NULL,
    selected_at        DATETIME NOT NULL
);
"""

CACHE_SCHEMA = """
CREATE TABLE IF NOT EXISTS cache_entries (
    cache_key  TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at);
"""

async def get_app_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(_APP_DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db

async def get_cache_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(_CACHE_DB_PATH)
    db.row_factory = aiosqlite.Row
    return db

async def init_db() -> None:
    """앱 시작 시 DB 테이블 생성."""
    async with aiosqlite.connect(_APP_DB_PATH) as db:
        await db.executescript(APP_SCHEMA)
    async with aiosqlite.connect(_CACHE_DB_PATH) as db:
        await db.executescript(CACHE_SCHEMA)
```

---

## 3. infrastructure/persistence/cache_service.py — SQLite 캐시

**역할**: TTL 기반 키-값 캐시. 외부 Redis 없이 SQLite만으로 캐시 구현. 만료 자동 처리, 패턴 삭제 지원.

```python
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Optional
import aiosqlite

class CacheService:
    """SQLite 기반 캐시 서비스."""

    def __init__(self, db: aiosqlite.Connection) -> None:
        self._db = db

    async def get(self, key: str) -> Optional[str]:
        row = await self._db.execute(
            "SELECT value_json, expires_at FROM cache_entries WHERE cache_key = ?",
            (key,),
        )
        record = await row.fetchone()
        if not record:
            return None

        expires_at = datetime.fromisoformat(record["expires_at"])
        now = datetime.now(timezone.utc)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= now:
            await self._db.execute("DELETE FROM cache_entries WHERE cache_key = ?", (key,))
            await self._db.commit()
            return None

        return record["value_json"]

    async def set(self, key: str, value_json: str, ttl_seconds: int) -> None:
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=ttl_seconds)
        await self._db.execute(
            """INSERT INTO cache_entries (cache_key, value_json, expires_at, created_at)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(cache_key) DO UPDATE SET
                 value_json = excluded.value_json,
                 expires_at = excluded.expires_at,
                 created_at = excluded.created_at""",
            (key, value_json, expires_at.isoformat(), now.isoformat()),
        )
        await self._db.commit()

    async def delete_pattern(self, prefix: str) -> int:
        await self._db.execute(
            "DELETE FROM cache_entries WHERE cache_key LIKE ?",
            (f"{prefix}%",),
        )
        row = await self._db.execute("SELECT changes() AS count")
        changes = await row.fetchone()
        await self._db.commit()
        return int(changes["count"])

    async def cleanup_expired(self) -> int:
        await self._db.execute(
            "DELETE FROM cache_entries WHERE expires_at <= ?",
            (datetime.now(timezone.utc).isoformat(),),
        )
        row = await self._db.execute("SELECT changes() AS count")
        changes = await row.fetchone()
        await self._db.commit()
        return int(changes["count"])
```

---

## 4. infrastructure/providers/provider_budget.py — API 예산 관리

**역할**: 월간 API 호출 횟수를 DB에서 집계해 임계치 초과 시 차단. 모든 Provider에서 `await enforce_api_budget(db, settings)` 한 줄로 사용.

```python
from __future__ import annotations
from datetime import datetime, timezone
import aiosqlite
from src.config import Settings

class BudgetExceededError(RuntimeError):
    """월간 API 호출 예산 초과."""

async def enforce_api_budget(db: aiosqlite.Connection, settings: Settings) -> tuple[int, bool]:
    """월간 호출량을 확인하고 임계치 상태를 반환.

    Returns:
        (used_calls, is_warning)
    Raises:
        BudgetExceededError: critical 임계치 이상일 때
    """
    limit = settings.monthly_api_call_limit
    if limit <= 0:
        return 0, False

    month_start = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    ).isoformat()
    row = await db.execute(
        "SELECT COUNT(*) AS cnt FROM offline_provider_call_log WHERE created_at >= ?",
        (month_start,),
    )
    count_row = await row.fetchone()
    used = int(count_row["cnt"]) if count_row else 0

    warning_threshold = int(limit * settings.budget_warning_ratio)
    critical_threshold = int(limit * settings.budget_critical_ratio)
    if used >= critical_threshold:
        raise BudgetExceededError(
            f"API monthly budget exceeded: used={used}, critical_threshold={critical_threshold}, limit={limit}"
        )
    return used, used >= warning_threshold
```

---

## 5. domain/types.py — 공통 도메인 타입

**역할**: 요청/응답/엔티티/Provider 반환 타입을 Pydantic으로 정의. 서비스 전체의 타입 계약.

```python
from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class TravelMode(str, Enum):
    WALK = "walk"
    TRANSIT = "transit"
    CAR = "car"

class PlanType(str, Enum):
    LOWEST = "lowest"
    NEAREST = "nearest"
    BALANCED = "balanced"

class PriceSource(str, Enum):
    REFERENCE = "참가격"
    MOCK = "mock"
    PARTNER = "partner"

class ItemTag(str, Enum):
    LOWEST_PRICE = "최저가"
    BEST_VALUE = "가성비"
    AI_RECOMMEND = "AI추천"

class MissingReason(str, Enum):
    OUT_OF_STOCK = "재고 없음"
    NO_SELLER = "판매처 없음"

# --- 요청 타입 ---

class UserContext(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    travel_mode: TravelMode
    max_travel_minutes: int = Field(..., gt=0, le=120)

class BasketItem(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=100)
    brand: Optional[str] = None
    size: Optional[str] = None
    quantity: int = Field(default=1, ge=1)

class GeneratePlanRequest(BaseModel):
    user_context: UserContext
    basket_items: list[BasketItem] = Field(..., min_length=1, max_length=30)

class SelectPlanRequest(BaseModel):
    request_id: str
    selected_plan_type: PlanType
    store_id: str

# --- 도메인 엔티티 ---

class OfflineStore(BaseModel):
    store_id: str
    store_name: str
    address: str
    category: str
    lat: float
    lng: float
    source: str
    is_active: bool = True
    updated_at: datetime

class ProductNorm(BaseModel):
    product_norm_key: str
    normalized_name: str
    brand: Optional[str] = None
    size_value: Optional[float] = None
    size_unit: Optional[str] = None
    size_display: Optional[str] = None
    category: Optional[str] = None
    aliases_json: Optional[str] = None
    updated_at: datetime

class OfflinePriceSnapshot(BaseModel):
    price_snapshot_key: str
    store_id: str
    product_norm_key: str
    price_won: int = Field(..., gt=0)
    observed_at: datetime
    source: str
    notice: str
    created_at: datetime

# --- 응답 타입 ---

class ItemAlternative(BaseModel):
    item_name: str
    brand: Optional[str] = None
    unit_price_won: int
    saving_won: int = 0
    tag: Optional[str] = None

class MatchedItem(BaseModel):
    item_name: str
    brand: Optional[str] = None
    size_display: Optional[str] = None
    quantity: int
    unit_price_won: int
    subtotal_won: int
    item_tag: Optional[str] = None
    price_verified_at: Optional[datetime] = None

class MissingItem(BaseModel):
    item_name: str
    reason: str
    alternative: Optional[ItemAlternative] = None

class PlanAssumption(BaseModel):
    item_name: str
    field: str
    assumed_value: str
    reason: str

class OfflinePlan(BaseModel):
    plan_type: PlanType
    store_id: str
    store_name: str
    store_address: str
    total_price_won: int
    coverage_ratio: float = Field(..., ge=0.0, le=1.0)
    recommendation_reason: str
    matched_items: list[MatchedItem]
    missing_items: list[MissingItem] = []
    assumptions: list[PlanAssumption] = []
    travel_minutes: int
    distance_km: float
    weather_note: Optional[str] = None
    price_source: str
    price_observed_at: datetime
    price_notice: str = "조사 시점 기준, 현장 가격과 차이 가능"

class PlanMeta(BaseModel):
    request_id: str
    generated_at: datetime
    degraded_providers: list[str] = []

class GeneratePlanResponse(BaseModel):
    plans: list[OfflinePlan]
    meta: PlanMeta

class SelectPlanResponse(BaseModel):
    status: str = "confirmed"
    store_name: str
    store_address: str
    navigation_url: str
    selected_at: datetime

# --- 에러 응답 ---

class ErrorDetail(BaseModel):
    field: Optional[str] = None
    reason: str

class ErrorResponse(BaseModel):
    code: str
    message: str
    details: list[ErrorDetail] = []
    request_id: Optional[str] = None

# --- Provider 반환 타입 ---

class RouteEstimate(BaseModel):
    distance_km: float
    travel_minutes: int
    is_estimated: bool = False

class WeatherAdvisory(BaseModel):
    note: str
    temperature: Optional[float] = None
    precipitation_probability: Optional[int] = None

# --- 랭킹 입력 ---

class RankingPolicyInput(BaseModel):
    store_id: str
    total_price_won: int
    travel_minutes: int
    coverage_ratio: float
    matched_items: list[MatchedItem]
    missing_items: list[MissingItem]
```

---

## 6. infrastructure/providers/naver_place.py — 네이버 장소 검색 Provider

**역할**: 네이버 Local 검색 API로 주변 매장 후보 탐색. 캐시 + API 예산 + 호출 로그 패턴의 표준 구현체. `_haversine_km()`과 `_parse_coordinates()`는 어디서든 재사용 가능.

```python
from __future__ import annotations
import json, math, re, time, hashlib
from datetime import datetime, timezone
from uuid import uuid4
import aiosqlite, httpx
from src.config import Settings
from src.domain.types import OfflineStore
from src.infrastructure.persistence.cache_service import CacheService
from src.infrastructure.providers.provider_budget import BudgetExceededError, enforce_api_budget

class NaverLocalPlaceProvider:
    _ENDPOINT = "https://openapi.naver.com/v1/search/local.json"
    _HTML_TAG_RE = re.compile(r"<[^>]+>")

    def __init__(self, settings: Settings, cache: CacheService, db: aiosqlite.Connection) -> None:
        self._settings = settings
        self._cache = cache
        self._db = db

    async def search_nearby(self, lat: float, lng: float, categories: list[str], radius: int) -> list[OfflineStore]:
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
                for row in json.loads(cached):
                    store = OfflineStore(**row)
                    merged[store.store_id] = store
                await self._log_call("naver_place", "local_search", 200, started, True, None)
                continue
            try:
                await enforce_api_budget(self._db, self._settings)
                params = {"query": f"마트 {category}".strip(), "display": 20, "start": 1, "sort": "random"}
                async with httpx.AsyncClient(timeout=8.0) as client:
                    response = await client.get(self._ENDPOINT, headers=headers, params=params)
                response.raise_for_status()
                stores: list[OfflineStore] = []
                for item in response.json().get("items", []):
                    converted = self._to_store(item, category)
                    if not converted:
                        continue
                    if self._haversine_km(lat, lng, converted.lat, converted.lng) * 1000.0 <= radius:
                        stores.append(converted)
                        merged[converted.store_id] = converted
                await self._cache.set(
                    cache_key,
                    json.dumps([s.model_dump(mode="json") for s in stores], ensure_ascii=False),
                    self._settings.cache_ttl_place,
                )
                await self._log_call("naver_place", "local_search", response.status_code, started, False, None)
            except Exception as exc:
                status_code = getattr(getattr(exc, "response", None), "status_code", None)
                await self._log_call("naver_place", "local_search", status_code, started, False, exc.__class__.__name__)
                if isinstance(exc, BudgetExceededError):
                    break
        return list(merged.values())

    def _to_store(self, item: dict, category: str) -> OfflineStore | None:
        coords = self._parse_coordinates(item.get("mapx"), item.get("mapy"))
        if not coords:
            return None
        lat, lng = coords
        title = self._HTML_TAG_RE.sub("", item.get("title", "")).strip()
        address = item.get("roadAddress") or item.get("address") or ""
        identity = f"{title}|{address}|{lat:.6f}|{lng:.6f}"
        store_id = f"naver:{hashlib.md5(identity.encode('utf-8')).hexdigest()[:16]}"
        return OfflineStore(
            store_id=store_id, store_name=title or "이름 없음",
            address=address, category=category, lat=lat, lng=lng,
            source="naver_local", is_active=True, updated_at=datetime.now(timezone.utc),
        )

    def _parse_coordinates(self, mapx: object, mapy: object) -> tuple[float, float] | None:
        """네이버 API 좌표 파싱. WGS84와 1e7 스케일 두 포맷 모두 처리."""
        try:
            raw_x, raw_y = float(mapx), float(mapy)
        except (TypeError, ValueError):
            return None
        if -180.0 <= raw_x <= 180.0 and -90.0 <= raw_y <= 90.0:
            lng, lat = raw_x, raw_y
        elif 1_240_000_000 <= raw_x <= 1_320_000_000 and 330_000_000 <= raw_y <= 390_000_000:
            lng, lat = raw_x / 10_000_000.0, raw_y / 10_000_000.0
        else:
            return None
        if not (33.0 <= lat <= 39.5 and 124.0 <= lng <= 132.0):
            return None
        return lat, lng

    def _haversine_km(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """두 좌표 간 직선거리(km) — Haversine 공식."""
        r = 6371.0
        d_lat = math.radians(lat2 - lat1)
        d_lng = math.radians(lng2 - lng1)
        a = (math.sin(d_lat / 2) ** 2
             + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
             * math.sin(d_lng / 2) ** 2)
        return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    async def _log_call(self, provider_name, endpoint_key, status_code, started, cache_hit, error_class) -> None:
        """Provider API 호출 로그 저장 — 모든 Provider 공통 패턴."""
        latency_ms = int((time.monotonic() - started) * 1000)
        try:
            await self._db.execute(
                """INSERT INTO offline_provider_call_log
                   (call_id, provider_name, endpoint_key, status_code, latency_ms, cache_hit, error_class, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (str(uuid4()), provider_name, endpoint_key, status_code,
                 latency_ms, int(cache_hit), error_class, datetime.now(timezone.utc).isoformat()),
            )
            await self._db.commit()
        except Exception:
            return
```

---

## 7. infrastructure/providers/naver_routing.py — 이동시간 계산 Provider

**역할**: 네이버 Directions API로 차량 이동시간 계산. API 없을 때는 `_estimate_linear()`로 직선거리 fallback. walk/transit도 fallback으로 처리.

```python
from __future__ import annotations
import json, math, time
from datetime import datetime, timezone
from uuid import uuid4
import aiosqlite, httpx
from src.config import Settings
from src.domain.types import RouteEstimate
from src.infrastructure.persistence.cache_service import CacheService
from src.infrastructure.providers.provider_budget import BudgetExceededError, enforce_api_budget

class NaverRoutingProvider:
    _ENDPOINT = "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving"

    def __init__(self, settings: Settings, cache: CacheService, db: aiosqlite.Connection) -> None:
        self._settings = settings
        self._cache = cache
        self._db = db

    async def estimate(self, origin: tuple[float, float], destination: tuple[float, float], travel_mode: str) -> RouteEstimate:
        if travel_mode != "car":
            return self._estimate_linear(origin, destination, travel_mode)

        o_lat, o_lng = origin
        d_lat, d_lng = destination
        cache_key = f"route:car:{o_lat:.5f}:{o_lng:.5f}:{d_lat:.5f}:{d_lng:.5f}"
        started = time.monotonic()

        cached = await self._cache.get(cache_key)
        if cached:
            await self._log_call("naver_routing", "driving", 200, started, True, None)
            return RouteEstimate(**json.loads(cached))

        try:
            await enforce_api_budget(self._db, self._settings)
        except BudgetExceededError as exc:
            await self._log_call("naver_routing", "driving", None, started, False, exc.__class__.__name__)
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
            summary = response.json()["route"]["traoptimal"][0]["summary"]
            distance_km = round(float(summary["distance"]) / 1000.0, 1)
            travel_minutes = max(1, round(float(summary["duration"]) / 60000.0))
            result = RouteEstimate(distance_km=distance_km, travel_minutes=travel_minutes, is_estimated=False)
            await self._cache.set(cache_key, result.model_dump_json(), self._settings.cache_ttl_route_car)
            await self._log_call("naver_routing", "driving", response.status_code, started, False, None)
            return result
        except Exception as exc:
            status_code = getattr(getattr(exc, "response", None), "status_code", None)
            await self._log_call("naver_routing", "driving", status_code, started, False, exc.__class__.__name__)
            raise

    def _estimate_linear(self, origin: tuple[float, float], destination: tuple[float, float], travel_mode: str) -> RouteEstimate:
        """API 없이 직선거리 기반 이동시간 추정 (Haversine + 이동수단별 속도)."""
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
            minutes = round(distance_km * 1000 * 1.3 / 66.7)   # 4km/h, 경로계수 1.3
        elif travel_mode == "transit":
            minutes = round(distance_km * 1000 * 1.8 / 66.7)
        else:
            minutes = max(1, round(distance_km / 0.5))          # 차량 30km/h 도심
        return RouteEstimate(distance_km=round(distance_km, 1), travel_minutes=max(1, minutes), is_estimated=True)

    async def _log_call(self, provider_name, endpoint_key, status_code, started, cache_hit, error_class) -> None:
        latency_ms = int((time.monotonic() - started) * 1000)
        try:
            await self._db.execute(
                """INSERT INTO offline_provider_call_log
                   (call_id, provider_name, endpoint_key, status_code, latency_ms, cache_hit, error_class, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (str(uuid4()), provider_name, endpoint_key, status_code,
                 latency_ms, int(cache_hit), error_class, datetime.now(timezone.utc).isoformat()),
            )
            await self._db.commit()
        except Exception:
            return
```

---

## 8. infrastructure/providers/kma_weather.py — 기상청 날씨 Provider

**역할**: 기상청 단기예보 API로 날씨 안내 생성. `_to_grid()`는 위경도→기상청 격자 변환 공식(LCC DFS)으로 **절대 수정 금지**. `_resolve_base_time()`은 발표 시각 자동 계산.

```python
from __future__ import annotations
import json, math, time
from datetime import datetime, timedelta, timezone
from uuid import uuid4
import aiosqlite, httpx
from src.config import Settings
from src.domain.types import WeatherAdvisory
from src.infrastructure.persistence.cache_service import CacheService
from src.infrastructure.providers.provider_budget import BudgetExceededError, enforce_api_budget

class KmaWeatherProvider:
    _ENDPOINT = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst"
    _BASE_TIMES = ["0200", "0500", "0800", "1100", "1400", "1700", "2000", "2300"]

    def __init__(self, settings: Settings, cache: CacheService, db: aiosqlite.Connection) -> None:
        self._settings = settings
        self._cache = cache
        self._db = db

    async def get_advisory(self, lat: float, lng: float, time_window: str) -> WeatherAdvisory:
        now_kst = datetime.now(timezone(timedelta(hours=9)))
        cache_key = f"weather:{lat:.2f}:{lng:.2f}:{now_kst.strftime('%Y%m%d%H')}"
        started = time.monotonic()
        cached = await self._cache.get(cache_key)
        if cached:
            await self._log_call("kma_weather", "vilage_fcst", 200, started, True, None)
            return WeatherAdvisory(**json.loads(cached))
        try:
            await enforce_api_budget(self._db, self._settings)
        except BudgetExceededError as exc:
            await self._log_call("kma_weather", "vilage_fcst", None, started, False, exc.__class__.__name__)
            raise
        nx, ny = self._to_grid(lat, lng)
        base_date, base_time = self._resolve_base_time(now_kst)
        params = {
            "serviceKey": self._settings.kma_service_key,
            "pageNo": 1, "numOfRows": 1000, "dataType": "JSON",
            "base_date": base_date, "base_time": base_time, "nx": nx, "ny": ny,
        }
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(self._ENDPOINT, params=params)
            response.raise_for_status()
            items = response.json()["response"]["body"]["items"]["item"]
            advisory = self._build_advisory(self._extract_weather(items))
            await self._cache.set(cache_key, advisory.model_dump_json(), self._settings.cache_ttl_weather)
            await self._log_call("kma_weather", "vilage_fcst", response.status_code, started, False, None)
            return advisory
        except Exception as exc:
            status_code = getattr(getattr(exc, "response", None), "status_code", None)
            await self._log_call("kma_weather", "vilage_fcst", status_code, started, False, exc.__class__.__name__)
            raise

    def _extract_weather(self, items: list[dict]) -> dict[str, int | float]:
        target: dict[str, int | float] = {}
        sorted_items = sorted(items, key=lambda x: (x.get("fcstDate", ""), x.get("fcstTime", "")))
        for category in ("POP", "TMP", "PTY", "SKY"):
            for row in sorted_items:
                if row.get("category") != category:
                    continue
                value = row.get("fcstValue")
                target[category] = float(value) if category == "TMP" else int(float(value))
                break
        return target

    def _build_advisory(self, weather: dict[str, int | float]) -> WeatherAdvisory:
        pop = int(weather.get("POP", 0))
        pty = int(weather.get("PTY", 0))
        sky = int(weather.get("SKY", 0))
        tmp = float(weather["TMP"]) if "TMP" in weather else None
        note_parts: list[str] = []
        if pty > 0:
            note_parts.append("눈 예보" if pty == 3 else "비 예보")
        elif sky == 1:
            note_parts.append("맑음")
        elif sky == 3:
            note_parts.append("구름많음")
        elif sky == 4:
            note_parts.append("흐림")
        else:
            note_parts.append("날씨 정보 확인 필요")
        if pop >= 60:
            note_parts.append(f"강수확률 {pop}%")
        return WeatherAdvisory(note=", ".join(note_parts), temperature=tmp, precipitation_probability=pop)

    def _resolve_base_time(self, now_kst: datetime) -> tuple[str, str]:
        """기상청 발표 시각 자동 계산 (10분 여유 포함)."""
        compare = now_kst - timedelta(minutes=10)
        hhmm = compare.strftime("%H%M")
        candidates = [t for t in self._BASE_TIMES if t <= hhmm]
        if candidates:
            return compare.strftime("%Y%m%d"), candidates[-1]
        prev = compare - timedelta(days=1)
        return prev.strftime("%Y%m%d"), self._BASE_TIMES[-1]

    def _to_grid(self, lat: float, lng: float) -> tuple[int, int]:
        """위경도 → 기상청 격자(nx, ny) 변환 — LCC DFS 공식 (절대 수정 금지)."""
        re_val = 6371.00877
        grid = 5.0
        slat1, slat2 = 30.0, 60.0
        olon, olat = 126.0, 38.0
        xo, yo = 43.0, 136.0
        deg = math.pi / 180.0
        re_val = re_val / grid
        slat1, slat2 = slat1 * deg, slat2 * deg
        olon, olat = olon * deg, olat * deg
        sn = math.tan(math.pi * 0.25 + slat2 * 0.5) / math.tan(math.pi * 0.25 + slat1 * 0.5)
        sn = math.log(math.cos(slat1) / math.cos(slat2)) / math.log(sn)
        sf = math.tan(math.pi * 0.25 + slat1 * 0.5)
        sf = math.pow(sf, sn) * math.cos(slat1) / sn
        ro = math.tan(math.pi * 0.25 + olat * 0.5)
        ro = re_val * sf / math.pow(ro, sn)
        ra = math.tan(math.pi * 0.25 + lat * deg * 0.5)
        ra = re_val * sf / math.pow(ra, sn)
        theta = lng * deg - olon
        if theta > math.pi:
            theta -= 2.0 * math.pi
        if theta < -math.pi:
            theta += 2.0 * math.pi
        theta *= sn
        nx = int(ra * math.sin(theta) + xo + 0.5)
        ny = int(ro - ra * math.cos(theta) + yo + 0.5)
        return nx, ny

    async def _log_call(self, provider_name, endpoint_key, status_code, started, cache_hit, error_class) -> None:
        latency_ms = int((time.monotonic() - started) * 1000)
        try:
            await self._db.execute(
                """INSERT INTO offline_provider_call_log
                   (call_id, provider_name, endpoint_key, status_code, latency_ms, cache_hit, error_class, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (str(uuid4()), provider_name, endpoint_key, status_code,
                 latency_ms, int(cache_hit), error_class, datetime.now(timezone.utc).isoformat()),
            )
            await self._db.commit()
        except Exception:
            return
```

---

## 9. application/ranking_engine.py — 3종 플랜 랭킹 엔진

**역할**: 후보 매장들을 최저가/가까움/균형 3가지 정책으로 평가해 Top1씩 선정. min-max 정규화 + 가중합으로 balanced 점수 계산. 동일 매장 중복 제거 포함.

```python
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
from src.domain.types import MatchedItem, MissingItem, PlanType

@dataclass
class StoreScore:
    store_id: str
    store_name: str
    store_address: str
    total_price_won: int
    coverage_ratio: float
    travel_minutes: int
    distance_km: float
    matched_items: list[MatchedItem]
    missing_items: list[MissingItem]
    price_source: str
    price_observed_at: str
    balanced_score: float = 0.0

class RankingEngine:
    """Top3 플랜 선정 엔진.

    정책:
    - lowest:   total_price_won ASC, coverage_ratio DESC, travel_minutes ASC
    - nearest:  travel_minutes ASC, total_price_won ASC, coverage_ratio DESC
    - balanced: 0.5*norm_price + 0.3*norm_travel - 0.2*norm_coverage (낮을수록 좋음)

    커버리지 필터: 기본 60% 이상, 후보 부족 시 40%까지 허용
    """
    MIN_COVERAGE = 0.6
    FALLBACK_MIN_COVERAGE = 0.4

    def rank(self, candidates: list[StoreScore]) -> dict[PlanType, Optional[StoreScore]]:
        if not candidates:
            return {PlanType.LOWEST: None, PlanType.NEAREST: None, PlanType.BALANCED: None}
        filtered = [c for c in candidates if c.coverage_ratio >= self.MIN_COVERAGE]
        if not filtered:
            filtered = [c for c in candidates if c.coverage_ratio >= self.FALLBACK_MIN_COVERAGE]
        if not filtered:
            return {PlanType.LOWEST: None, PlanType.NEAREST: None, PlanType.BALANCED: None}
        self._compute_balanced_scores(filtered)
        lowest   = sorted(filtered, key=lambda c: (c.total_price_won, -c.coverage_ratio, c.travel_minutes))
        nearest  = sorted(filtered, key=lambda c: (c.travel_minutes, c.total_price_won, -c.coverage_ratio))
        balanced = sorted(filtered, key=lambda c: c.balanced_score)
        result = {PlanType.LOWEST: lowest[0], PlanType.NEAREST: nearest[0], PlanType.BALANCED: balanced[0]}
        self._deduplicate(result, filtered)
        return result

    def _compute_balanced_scores(self, candidates: list[StoreScore]) -> None:
        """min-max 정규화 후 가중합으로 balanced 점수 계산."""
        if len(candidates) <= 1:
            for c in candidates:
                c.balanced_score = 0.0
            return
        prices    = [c.total_price_won for c in candidates]
        travels   = [c.travel_minutes  for c in candidates]
        coverages = [c.coverage_ratio  for c in candidates]
        price_range    = max(prices)    - min(prices)    or 1
        travel_range   = max(travels)   - min(travels)   or 1
        coverage_range = max(coverages) - min(coverages) or 1
        for c in candidates:
            norm_price    = (c.total_price_won - min(prices))    / price_range
            norm_travel   = (c.travel_minutes  - min(travels))   / travel_range
            norm_coverage = (c.coverage_ratio  - min(coverages)) / coverage_range
            c.balanced_score = 0.5 * norm_price + 0.3 * norm_travel - 0.2 * norm_coverage

    def _deduplicate(self, result: dict[PlanType, Optional[StoreScore]], candidates: list[StoreScore]) -> None:
        """balanced가 lowest/nearest와 같은 매장이면 차선책으로 교체."""
        if not result[PlanType.BALANCED]:
            return
        used_stores = {s.store_id for s in [result[PlanType.LOWEST], result[PlanType.NEAREST]] if s}
        if result[PlanType.BALANCED].store_id in used_stores:
            for candidate in sorted(candidates, key=lambda c: c.balanced_score):
                if candidate.store_id not in used_stores:
                    result[PlanType.BALANCED] = candidate
                    break
```

---

## 10. api/routes.py — 공통 유틸 함수

**역할**: 표준 에러 응답 포맷, 네이버 좌표 파싱, 지오코딩 쿼리 후보 생성. 어떤 FastAPI 프로젝트에서도 재사용 가능.

```python
from __future__ import annotations
import uuid
from urllib.parse import unquote
import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from src.domain.types import ErrorResponse
from src.config import get_settings

router = APIRouter(tags=["offline-plans"])

def _error_response(status_code: int, code: str, message: str, request_id: str | None = None) -> JSONResponse:
    """표준 에러 응답 포맷."""
    payload = ErrorResponse(code=code, message=message, request_id=request_id)
    return JSONResponse(status_code=status_code, content=payload.model_dump(mode="json"))

def _parse_naver_map_coordinates(mapx: object, mapy: object) -> tuple[float, float] | None:
    """네이버 좌표 파싱. WGS84와 1e7 스케일 두 포맷 모두 처리."""
    try:
        raw_x, raw_y = float(mapx), float(mapy)
    except (TypeError, ValueError):
        return None
    if -180.0 <= raw_x <= 180.0 and -90.0 <= raw_y <= 90.0:
        lng, lat = raw_x, raw_y
    elif 1_240_000_000 <= raw_x <= 1_320_000_000 and 330_000_000 <= raw_y <= 390_000_000:
        lng, lat = raw_x / 10_000_000.0, raw_y / 10_000_000.0
    else:
        return None
    if not (33.0 <= lat <= 39.5 and 124.0 <= lng <= 132.0):
        return None
    return lat, lng

def _geocode_query_candidates(query: str) -> list[str]:
    """주소 쿼리를 토큰 분해해 여러 후보 쿼리 생성 (매칭률 향상)."""
    tokens = [t for t in query.replace(",", " ").split() if t]
    candidates: list[str] = [query]
    if len(tokens) >= 2:
        candidates.append(" ".join(tokens[:2]))
    if len(tokens) >= 3:
        candidates.append(" ".join(tokens[:3]))
    if tokens:
        candidates.extend([tokens[-1], f"{tokens[-1]}역", f"{tokens[-1]} 주민센터"])
    seen: set[str] = set()
    result: list[str] = []
    for c in candidates:
        c = c.strip()
        if not c or c in seen:
            continue
        seen.add(c)
        result.append(c)
    return result

@router.get("/utils/geocode")
async def geocode_address(query: str) -> JSONResponse:
    decoded_query = unquote(query).strip()
    if not decoded_query:
        return JSONResponse(status_code=400, content={"code": "INVALID_QUERY", "message": "query가 비어 있습니다."})
    settings = get_settings()
    if not settings.naver_client_id or not settings.naver_client_secret:
        return JSONResponse(status_code=503, content={"code": "GEOCODER_UNAVAILABLE", "message": "네이버 Search API 키가 설정되지 않았습니다."})
    headers = {"X-Naver-Client-Id": settings.naver_client_id, "X-Naver-Client-Secret": settings.naver_client_secret}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            for candidate in _geocode_query_candidates(decoded_query):
                params = {"query": candidate, "display": 5, "start": 1, "sort": "random"}
                response = await client.get("https://openapi.naver.com/v1/search/local.json", headers=headers, params=params)
                response.raise_for_status()
                for item in response.json().get("items", []):
                    parsed = _parse_naver_map_coordinates(item.get("mapx"), item.get("mapy"))
                    if not parsed:
                        continue
                    lat, lng = parsed
                    address = item.get("roadAddress") or item.get("address") or candidate
                    return JSONResponse(status_code=200, content={
                        "query": decoded_query, "resolved_query": candidate,
                        "lat": lat, "lng": lng, "resolved_address": address,
                    })
        return JSONResponse(status_code=404, content={"code": "GEOCODE_NOT_FOUND", "message": "주소를 좌표로 변환하지 못했습니다."})
    except httpx.HTTPError:
        return JSONResponse(status_code=503, content={"code": "GEOCODER_UNAVAILABLE", "message": "지오코딩 서비스 호출에 실패했습니다."})
```

---

## 11. main.py — FastAPI 앱 엔트리포인트

**역할**: `lifespan`으로 DB 연결 + Provider 초기화 + `app.state`에 서비스 주입. API 키 유무에 따라 실제 Provider / Mock Provider 자동 선택.

```python
from __future__ import annotations
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from src.config import get_settings
from src.api.routes import router
from src.application.plan_service import PlanService
from src.infrastructure.persistence.cache_service import CacheService
from src.infrastructure.persistence.database import get_app_db, get_cache_db, init_db
from src.infrastructure.providers.kma_weather import KmaWeatherProvider
from src.infrastructure.providers.mock_providers import MockRoutingProvider, MockWeatherProvider
from src.infrastructure.providers.naver_place import NaverLocalPlaceProvider
from src.infrastructure.providers.naver_routing import NaverRoutingProvider

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await init_db()
    db = await get_app_db()
    cache_db = await get_cache_db()
    cache = CacheService(cache_db)
    settings = get_settings()

    # API 키 유무에 따라 실제 / Mock Provider 자동 선택
    routing = NaverRoutingProvider(settings=settings, cache=cache, db=db) \
              if settings.ncp_client_id and settings.ncp_client_secret \
              else MockRoutingProvider()
    weather = KmaWeatherProvider(settings=settings, cache=cache, db=db) \
              if settings.kma_service_key else MockWeatherProvider()
    place = NaverLocalPlaceProvider(settings=settings, cache=cache, db=db) \
            if settings.naver_client_id and settings.naver_client_secret else None

    app.state.plan_service = PlanService(
        db=db, routing_provider=routing, weather_provider=weather, place_provider=place
    )
    app.state.db = db
    app.state.cache_db = cache_db
    yield
    await db.close()
    await cache_db.close()

app = FastAPI(title="똑장 오프라인 API", version="0.1.0", lifespan=lifespan)
app.include_router(router, prefix="/v1/offline")

demo_dir = Path(__file__).resolve().parent.parent / "mock" / "ui-demo"
if demo_dir.exists():
    app.mount("/demo", StaticFiles(directory=demo_dir, html=True), name="demo")
```

---

## ⚠️ 주의사항 요약

| 항목 | 내용 |
|------|------|
| `_to_grid()` | 기상청 LCC DFS 공식 — **절대 수정 금지** |
| `_parse_coordinates()` | 네이버 좌표 포맷 2가지(WGS84 / 1e7) 모두 처리 필수 |
| `_log_call()` | 3개 Provider에 동일 코드 중복 → 새 서비스에선 `BaseProvider` 추상 클래스로 공통화 권장 |
| DB 경로 | `"app.db"` 하드코딩 → 환경변수로 관리 권장 |
| `row_factory` | `db.row_factory = aiosqlite.Row` 설정 없으면 `dict(row)` 변환 불가 |
| 캐시 키 소수점 | 장소 `:.3f`, 경로 `:.5f` — 정밀도 다름 (의도적) |
| `degraded_providers` | fallback 발생 시 206 Partial Content 반환 — API 설계 패턴으로 참고 |
