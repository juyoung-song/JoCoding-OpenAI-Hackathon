# 똑장 레퍼런스 코드 가이드 (juyoung)

> **출처**: `reference/backend-juyoung/JoCoding-OpenAI-Hackathon-juyoung/backend/`
> 참고 등급: 🔴 A급(즉시 활용) / 🟡 B급(수정 후 활용) / 🟠 C급(구조 참고)

---

## 목차

1. [도메인 모델](#1-도메인-모델)
2. [Core 설정](#2-core-설정)
3. [Provider 인터페이스](#3-provider-인터페이스)
4. [NaverShopping Provider](#4-navershopping-provider)
5. [NaverLocal Provider](#5-naverlocal-provider)
6. [MockOffline Provider](#6-mockoffline-provider)
7. [Canonicalization Service](#7-canonicalization-service)
8. [MallComparison Service](#8-mallcomparison-service)
9. [Chat Service](#9-chat-service)
10. [Generate Plans Usecase](#10-generate-plans-usecase)
11. [LangGraph 상태 &amp; 노드](#11-langgraph-상태--노드)
12. [API 라우터](#12-api-라우터)

---

## 1. 도메인 모델

### 🔴 `domain/models/basket.py` — 장바구니 핵심 모델

**역할**: `BasketItem`(개별 품목)과 `Basket`(전체 장바구니) 도메인 모델. 브랜드 고정(🔒)/추천(⭐) 모드 포함.

```python
"""장바구니 도메인 모델."""

from enum import Enum
from pydantic import BaseModel, Field


class ItemMode(str, Enum):
    """브랜드 고정(🔒) vs 추천(⭐) 모드."""
    FIXED = "fixed"        # 고정모드 🔒
    RECOMMEND = "recommend"  # 추천모드 ⭐


class BasketItem(BaseModel):
    """장바구니 개별 품목."""
    item_name: str = Field(..., description="정규화된 품목명")
    brand: str | None = Field(None, description="브랜드 (없으면 추천모드에서 결정)")
    size: str | None = Field(None, description="용량/규격 (예: 30구, 1L)")
    quantity: int = Field(1, ge=1, description="수량")
    category: str | None = Field(None, description="카테고리 (예: 축산/계란)")
    mode: ItemMode = Field(ItemMode.RECOMMEND, description="고정모드/추천모드")
    canonical_id: str | None = Field(None, description="표준 품목 ID (예: EGG_30)")


class Basket(BaseModel):
    """사용자의 전체 장바구니."""
    items: list[BasketItem] = Field(default_factory=list)

    @property
    def total_items(self) -> int:
        return sum(item.quantity for item in self.items)

    @property
    def unique_items(self) -> int:
        """중복 없는 품목 수 (수량 무시)."""
        return len(self.items)

    def add_item(self, item: BasketItem) -> None:
        self.items.append(item)

    def remove_item(self, item_name: str) -> bool:
        before = len(self.items)
        self.items = [i for i in self.items if i.item_name != item_name]
        return len(self.items) < before

    def clear(self) -> None:
        self.items.clear()
```

---

### 🔴 `domain/models/plan.py` — 추천 플랜 모델

**역할**: `PlanItem`(개별 상품 후보)과 `Plan`(마트/몰별 추천 플랜) 모델. 커버리지 비율 계산 포함.

```python
"""추천 플랜 도메인 모델."""

from enum import Enum
from pydantic import BaseModel, Field


class PlanType(str, Enum):
    """플랜 유형."""
    CHEAPEST = "cheapest"    # A: 최저가
    NEAREST = "nearest"      # B: 가까움


class PlanItem(BaseModel):
    """플랜 내 개별 상품 후보."""
    item_name: str
    product_name: str = Field(..., description="실제 상품명")
    brand: str | None = None
    price: int = Field(..., description="가격 (원)")
    link: str | None = Field(None, description="구매 링크")
    source: str = Field(..., description="출처 (네이버쇼핑, 쿠팡 등)")
    available: bool = True


class Plan(BaseModel):
    """마트/몰별 추천 플랜."""
    plan_type: PlanType
    mart_name: str = Field(..., description="마트/몰 이름")
    mart_icon: str | None = None
    items: list[PlanItem] = Field(default_factory=list)
    estimated_total: int = Field(0, description="추정 총액 (원)")
    coverage: int = Field(0, description="커버된 품목 수")
    total_basket_items: int = Field(0, description="전체 장바구니 품목 수")
    delivery_info: str | None = Field(None, description="배송 정보")
    badges: list[str] = Field(default_factory=list, description="배지 (선호 쇼핑몰, 로켓배송 등)")
    explanation: str = Field("", description="추천 이유 설명")
    cart_url: str | None = Field(None, description="마트 장바구니/메인 링크")

    @property
    def coverage_ratio(self) -> float:
        if self.total_basket_items == 0:
            return 0.0
        return self.coverage / self.total_basket_items
```

---

### 🔴 `domain/models/preferences.py` — 선호 브랜드 모델

**역할**: 사용자가 특정 품목에 대해 선호하는 브랜드/규격을 저장하는 도메인 모델.

```python
"""선호 브랜드 도메인 모델."""

from pydantic import BaseModel, Field
from datetime import datetime

class PreferredBrand(BaseModel):
    """사용자가 선호하는 브랜드 정보."""
    user_id: str = Field(..., description="사용자 ID (또는 세션 ID)")
    canonical_item_id: str = Field(..., description="표준 품목 ID (예: EGG_30)")
    preferred_brand: str = Field(..., description="선호하는 브랜드명 (예: 풀무원)")
    preferred_variant: str | None = Field(None, description="선호하는 용량/규격 (예: 30구)")
    created_at: datetime | None = None
    updated_at: datetime | None = None
```

---

### 🔴 `domain/models/user_preferences.py` — 쇼핑 환경 설정 모델

**역할**: 사용자 위치, 이동수단, 선호 온라인몰 등 쇼핑 컨텍스트 전체를 담는 모델.

```python
"""사용자 설정 도메인 모델."""

from enum import Enum
from pydantic import BaseModel, Field


class TransportMode(str, Enum):
    """이동 수단."""
    WALK = "walk"
    TRANSIT = "transit"
    CAR = "car"


class Location(BaseModel):
    """위치 정보 (주소 + 좌표)."""
    address: str = Field("", description="주소 문자열")
    lat: float = Field(0.0, description="위도")
    lng: float = Field(0.0, description="경도")
    source: str = Field("unknown", description="gps | search")


class OnlineMall(BaseModel):
    """온라인 쇼핑몰 선호 설정."""
    name: str
    description: str = ""
    enabled: bool = True


class ShoppingContext(BaseModel):
    """쇼핑 환경 설정 (단일 진실)."""
    location: Location = Field(default_factory=Location)
    mobility: dict = Field(default_factory=lambda: {"mode": "walk", "max_minutes": 30})
    online_malls: dict = Field(default_factory=lambda: {"naver": True, "coupang": True, "kurly": False})
    updated_at: str | None = None

    class Config:
        populate_by_name = True
```

---

## 2. Core 설정

### 🔴 `core/config.py` — 환경변수 기반 설정

**역할**: pydantic-settings로 `.env` 파일을 읽어 전역 설정을 관리. OpenAI, 네이버 API, Langfuse 키 포함.

```python
"""앱 설정 관리 — 환경변수 기반 (pydantic-settings)."""

from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """전역 설정. .env 파일 또는 환경변수에서 로드."""

    # ── 앱 기본 ──
    app_name: str = "똑장"
    debug: bool = True
    api_prefix: str = "/api/v1"

    # ── DB 경로 (SQLite) ──
    db_path: str = "app.db"
    cache_db_path: str = "cache.db"

    # ── LLM / OpenAI ──
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # ── 네이버 API ──
    naver_client_id: str = ""
    naver_client_secret: str = ""

    # ── 기상청 API ──
    weather_api_key: str = ""

    # ── Langfuse 관측 ──
    langfuse_secret_key: str = ""
    langfuse_public_key: str = ""
    langfuse_base_url: str = "https://cloud.langfuse.com"

    # ── CORS ──
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
```

---

## 3. Provider 인터페이스

### 🔴 `infrastructure/providers/base.py` — ABC 기반 Provider 인터페이스

**역할**: 모든 외부 API 연동을 추상화. 데이터 소스가 바뀌어도 제품 코드는 그대로 유지되는 구조.

```python
"""Provider 인터페이스 정의 (ABC 기반)."""

from abc import ABC, abstractmethod
from app.domain.models.basket import BasketItem
from app.domain.models.plan import PlanItem


class OnlinePriceProvider(ABC):
    """온라인 가격 수집 Provider 인터페이스."""

    @abstractmethod
    async def search_products(
        self,
        item: BasketItem,
        max_results: int = 5,
    ) -> list[PlanItem]:
        """품목에 대한 온라인 상품 후보를 검색한다."""
        ...


class OfflinePriceProvider(ABC):
    """오프라인 가격 수집 Provider 인터페이스."""

    @abstractmethod
    async def get_store_prices(
        self,
        item: BasketItem,
        lat: float,
        lng: float,
        radius_km: float = 3.0,
    ) -> list[PlanItem]:
        """주변 매장의 상품 가격을 조회한다."""
        ...


class STTProvider(ABC):
    """음성 인식(STT) Provider 인터페이스."""

    @abstractmethod
    async def transcribe(self, audio_bytes: bytes) -> str:
        """음성 데이터를 텍스트로 변환한다."""
        ...


class PlaceProvider(ABC):
    """장소 검색 Provider 인터페이스."""

    @abstractmethod
    async def search_nearby_stores(
        self,
        lat: float,
        lng: float,
        keyword: str = "마트",
        radius_km: float = 3.0,
    ) -> list[dict]:
        """주변 매장을 검색한다."""
        ...


class WeatherProvider(ABC):
    """날씨 Provider 인터페이스."""

    @abstractmethod
    async def get_current_weather(
        self,
        lat: float,
        lng: float,
    ) -> dict:
        """현재 날씨 정보를 조회한다."""
        ...
```

---

## 4. NaverShopping Provider

### 🔴 `infrastructure/providers/naver_shopping.py` — Hybrid Search Strategy

**역할**: 네이버 쇼핑 API로 상품 가격 수집. Phase1(광범위 검색) + Phase2(누락 몰 타겟 검색) 2단계 전략.

> **핵심 포인트**
>
> - `QUERY_OVERRIDES`: 계란 → "달걀 특란 30개입" 처럼 검색 품질 향상
> - `SIZE_NORMALIZATION`: "30구" → "30개입" 마트 상품명 매칭
> - `TARGET_MALLS` 화이트리스트: 대형마트/주요 몰만 필터링
> - `_is_food_item`: 비식품(케이스, 사료 등) 자동 제외

```python
"""네이버 쇼핑 API Provider — 실제 API 호출 구현."""

import re
from datetime import datetime

import httpx

from app.core.config import settings
from app.domain.models.basket import BasketItem, ItemMode
from app.domain.models.plan import PlanItem
from app.infrastructure.providers.base import OnlinePriceProvider


# 식품 카테고리 판별을 위한 키워드
FOOD_CATEGORIES = {"식품", "음료", "과일", "채소", "축산", "수산", "유제품", "알류", "신선식품"}

# 검색 품질 향상을 위한 품목별 최적 검색어 매핑
QUERY_OVERRIDES: dict[str, str] = {
    "계란": "달걀 특란 30개입",
    "달걀": "달걀 특란 30개입",
}

# 규격 정규화 (마트 상품명과 매칭되도록)
SIZE_NORMALIZATION: dict[str, str] = {
    "30구": "30개입",
    "15구": "15개입",
    "10구": "10개입",
}

# 대형마트/주요 몰 필터링 목록
TARGET_MALLS = {
    "이마트", "이마트몰", "트레이더스", "신세계몰", "SSG",
    "홈플러스", "Homeplus",
    "롯데마트", "롯데ON",
    "쿠팡", "마켓컬리", "컬리",
    "농협몰", "GS프레시몰"
}


class NaverShoppingProvider(OnlinePriceProvider):
    """네이버 쇼핑 검색 API를 통한 온라인 가격 수집."""

    BASE_URL = "https://openapi.naver.com/v1/search/shop.json"

    def _build_query(self, item: BasketItem) -> str:
        """검색 쿼리 생성.

        - 고정모드: 브랜드+품목+규격으로 정확 검색
        - 추천모드: 품목명에 맞는 최적화된 검색어 사용
        """
        size = item.size
        if size:
            size = SIZE_NORMALIZATION.get(size, size)

        base_name = item.item_name
        override = QUERY_OVERRIDES.get(base_name)

        if item.mode == ItemMode.FIXED and item.brand:
            parts = [item.brand, base_name]
            if size:
                parts.append(size)
            return " ".join(parts)

        if override:
            return override

        clean_name = re.sub(r"[\(\)]", " ", base_name).strip()
        clean_name = re.sub(r"\s+", " ", clean_name).strip()

        parts = [clean_name]
        if size:
            parts.append(size)
        return " ".join(parts)

    @staticmethod
    def _clean_html(text: str) -> str:
        """HTML 태그를 제거한다."""
        return re.sub(r"<[^>]+>", "", text)

    @staticmethod
    def _is_food_item(raw_item: dict) -> bool:
        """검색 결과가 실제 식품인지 판별한다."""
        cat1 = raw_item.get("category1", "")
        cat2 = raw_item.get("category2", "")
        cat3 = raw_item.get("category3", "")
        all_cats = f"{cat1} {cat2} {cat3}"

        for food_cat in FOOD_CATEGORIES:
            if food_cat in all_cats:
                return True

        non_food = {"보관", "밀폐", "케이스", "방음", "기독교", "반려", "사료", "주방용품", "수납"}
        for nf in non_food:
            if nf in all_cats:
                return False

        return True  # 판별 불가능하면 포함

    async def search_products(
        self,
        item: BasketItem,
        max_results: int = 10,
        required_keywords: list[str] | None = None,
    ) -> list[PlanItem]:
        """네이버 쇼핑 API로 상품을 검색한다 (Hybrid Search Strategy).

        1. 일반 검색 (최저가 정렬) 수행
        2. 필수 몰(예: 이마트, 홈플러스...)이 결과에 없다면, 해당 몰 이름으로 타겟 검색 수행
        """
        base_query = self._build_query(item)
        headers = {
            "X-Naver-Client-Id": settings.naver_client_id,
            "X-Naver-Client-Secret": settings.naver_client_secret,
        }

        results: list[PlanItem] = []
        found_keywords = set()
        seen_product_ids = set()

        # Phase 1: General Search (광범위한 최저가 탐색)
        try:
            params = {
                "query": base_query,
                "display": 80,
                "sort": "asc",
            }
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.BASE_URL, headers=headers, params=params, timeout=5.0
                )
                response.raise_for_status()
                data = response.json()

            for raw in data.get("items", []):
                pid = raw.get("productId")
                if pid in seen_product_ids:
                    continue

                item_obj = self._parse_item(item, raw)
                if item_obj:
                    results.append(item_obj)
                    seen_product_ids.add(pid)

                    if required_keywords:
                        for kw in required_keywords:
                            if kw in item_obj.source:
                                found_keywords.add(kw)

        except Exception as e:
            print(f"[NaverShopping] Primary search failed: {e}")

        # Phase 2: Fallback Search (누락된 몰 타겟 검색)
        if required_keywords:
            missing_kws = [k for k in required_keywords if k not in found_keywords]

            for kw in missing_kws:
                target_query = f"{base_query} {kw}"
                try:
                    params = {"query": target_query, "display": 40, "sort": "sim"}
                    async with httpx.AsyncClient() as client:
                        response = await client.get(
                            self.BASE_URL, headers=headers, params=params, timeout=5.0
                        )
                        response.raise_for_status()
                        sub_data = response.json()

                    for raw in sub_data.get("items", []):
                        pid = raw.get("productId")
                        if pid in seen_product_ids:
                            continue

                        mall_name = raw.get("mallName", "")
                        if kw not in mall_name:
                            continue  # 해당 몰 상품이 아니면 스킵

                        item_obj = self._parse_item(item, raw)
                        if item_obj:
                            results.append(item_obj)
                            seen_product_ids.add(pid)

                except Exception as e:
                    print(f"[NaverShopping] Fallback search failed for {kw}: {e}")

        results.sort(key=lambda x: x.price)
        return results

    def _parse_item(self, original_item: BasketItem, raw: dict) -> PlanItem | None:
        """API 응답 항목을 PlanItem으로 변환 (필터링 포함)"""
        price = int(raw.get("lprice", 0))
        if price <= 0:
            return None

        if not self._is_food_item(raw):
            return None

        mall_name = raw.get("mallName", "")
        is_target_mall = any(target in mall_name for target in TARGET_MALLS)
        if not is_target_mall:
            return None

        title = self._clean_html(raw.get("title", ""))
        return PlanItem(
            item_name=original_item.item_name,
            product_name=title,
            brand=raw.get("brand") or None,
            price=price,
            link=raw.get("link"),
            source=mall_name,
            available=True,
        )
```

---

## 5. NaverLocal Provider

### 🟡 `infrastructure/providers/naver_local.py` — 주변 마트 검색

**역할**: 네이버 지역 검색 API로 주변 마트 목록 조회. 좌표 기반이 아닌 키워드 기반이므로 지역명+마트명 조합으로 검색.

> ⚠️ **주의**: 네이버 Local API는 좌표 필터링을 지원하지 않아 `lat/lng` 파라미터가 실제로 사용되지 않음. 카카오 Local API로 교체 검토 필요.

```python
"""네이버 지역 검색 API Provider — 주변 마트 검색."""

import re
import httpx

from app.core.config import settings
from app.infrastructure.providers.base import PlaceProvider


class NaverLocalProvider(PlaceProvider):
    """네이버 지역 검색 API를 통한 주변 마트 검색."""

    BASE_URL = "https://openapi.naver.com/v1/search/local.json"
    MART_KEYWORDS = ["이마트", "홈플러스", "롯데마트", "코스트코", "하나로마트", "GS더프레시", "마트"]

    @staticmethod
    def _clean_html(text: str) -> str:
        return re.sub(r"<[^>]+>", "", text)

    async def search_nearby_stores(
        self,
        lat: float,
        lng: float,
        keyword: str = "마트",
        radius_km: float = 3.0,
    ) -> list[dict]:
        headers = {
            "X-Naver-Client-Id": settings.naver_client_id,
            "X-Naver-Client-Secret": settings.naver_client_secret,
        }
        params = {
            "query": keyword,
            "display": 5,
            "sort": "comment",  # 리뷰순 (인기순)
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.BASE_URL, headers=headers, params=params, timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPError as e:
            print(f"[NaverLocal] API 호출 실패: {e}")
            return []

        stores: list[dict] = []
        for raw in data.get("items", []):
            title = self._clean_html(raw.get("title", ""))
            stores.append({
                "name": title,
                "category": raw.get("category", ""),
                "address": raw.get("roadAddress") or raw.get("address", ""),
                "link": raw.get("link", ""),
                "telephone": raw.get("telephone", ""),
                "mapx": raw.get("mapx", ""),
                "mapy": raw.get("mapy", ""),
            })

        return stores

    async def search_nearby_marts(self, region: str = "강남") -> list[dict]:
        """특정 지역의 주요 마트를 검색한다."""
        all_stores: list[dict] = []
        for mart_keyword in self.MART_KEYWORDS[:4]:
            query = f"{region} {mart_keyword}"
            stores = await self.search_nearby_stores(lat=0, lng=0, keyword=query)
            all_stores.extend(stores)
        return all_stores
```

---

## 6. MockOffline Provider

### 🟡 `infrastructure/providers/mock_offline.py` — MVP용 오프라인 Mock

**역할**: 실제 오프라인 가격 API 연동 전 MVP 단계에서 사용하는 Mock 데이터 Provider.

```python
"""오프라인 가격 Mock Provider (MVP 용)."""

import random
from app.domain.models.basket import BasketItem
from app.domain.models.plan import PlanItem
from app.infrastructure.providers.base import OfflinePriceProvider

MOCK_STORE_PRICES: dict[str, dict[str, int]] = {
    "이마트": {"계란": 7480, "우유": 2980, "두부": 3200, "라면": 4500, "김치": 8900},
    "홈플러스": {"계란": 7200, "우유": 3100, "두부": 2900, "라면": 4200, "김치": 9200},
    "롯데마트": {"계란": 7600, "우유": 2850, "두부": 3100, "라면": 4800, "김치": 8500},
}


class MockOfflineProvider(OfflinePriceProvider):
    """Mock 오프라인 가격 Provider."""

    async def get_store_prices(
        self,
        item: BasketItem,
        lat: float,
        lng: float,
        radius_km: float = 3.0,
    ) -> list[PlanItem]:
        results = []
        for store_name, prices in MOCK_STORE_PRICES.items():
            base_price = prices.get(item.item_name)
            if base_price is None:
                # item_name의 hash를 기반으로 2000~15000 사이 값 생성
                seed = sum(ord(c) for c in item.item_name)
                base_price = 2000 + (seed * 100) % 13000

            results.append(
                PlanItem(
                    item_name=item.item_name,
                    product_name=f"{item.item_name} {item.size or ''}".strip(),
                    brand=item.brand,
                    price=base_price,
                    link=None,
                    source=store_name,
                    available=True,
                )
            )
        return results
```

---

## 7. Canonicalization Service

### 🟡 `application/services/canonicalization.py` — 품목명 표준화

**역할**: 사용자 입력 품목명을 시스템 표준 ID로 변환. 선호 브랜드 DB 매칭의 핵심 키.

> **확장 필요**: 현재 MVP용 키워드 맵만 있음. 실제 서비스에서는 DB 또는 별도 파일로 분리 권장.

```python
"""품목명 정규화 서비스 (Canonicalization)."""

import re

class CanonicalizationService:
    """사용자가 입력한 품목명을 시스템 표준 ID(Canonical ID)로 변환한다."""

    KEYWORD_MAP = {
        "계란": "EGG", "달걀": "EGG", "특란": "EGG", "대란": "EGG",
        "두부": "TOFU",
        "우유": "MILK",
        "콩나물": "BEAN_SPROUT",
        "신라면": "SHIN_RAMYUN", "진라면": "JIN_RAMYUN",
        "햇반": "RICE_INSTANT",
        "파": "GREEN_ONION", "대파": "GREEN_ONION",
        "양파": "ONION",
        "마늘": "GARLIC",
        "삼겹살": "PORK_BELLY", "목살": "PORK_NECK",
    }

    def get_canonical_id(self, item_name: str, size: str | None = None) -> str:
        """
        품목명과 용량을 분석해 표준 ID를 반환한다.
        예:
          - "계란", "30구" -> "EGG_30"
          - "두부", "300g" -> "TOFU_300"
        """
        code = self._extract_code(item_name)
        if not code:
            return f"UNKNOWN_{item_name.upper()}"

        suffix = ""
        if size:
            numbers = re.findall(r"\d+", size)
            if numbers:
                suffix = f"_{numbers[0]}"

        if code == "EGG" and not suffix:
            suffix = "_30"  # 계란 기본값

        return f"{code}{suffix}"

    def _extract_code(self, name: str) -> str | None:
        name = name.replace(" ", "")
        for key, code in self.KEYWORD_MAP.items():
            if key in name:
                return code
        return None
```

---

## 8. MallComparison Service

### 🔴 `application/services/mall_comparer.py` — 몰별 최저가 비교

**역할**: 장바구니 전체 품목을 이마트/홈플러스/컬리 3사에서 검색하여 몰별 플랜을 생성. 몰 별칭 정규화 포함.

```python
"""몰별 최저가 비교 서비스."""

from app.domain.models.basket import BasketItem
from app.domain.models.plan import Plan, PlanItem
from app.infrastructure.providers.naver_shopping import NaverShoppingProvider

# 몰 별칭 매핑 (정규화)
MALL_ALIASES = {
    "kurly": ["컬리", "마켓컬리", "Kurly", "뷰티컬리"],
    "homeplus": ["홈플러스", "Homeplus", "Homeplus Special"],
    "emart": ["이마트", "이마트몰", "SSG", "SSG.COM", "신세계몰", "트레이더스", "노브랜드"],
    "coupang": ["쿠팡", "Coupang", "쿠팡로켓"],
    "lotte": ["롯데마트", "롯데ON", "롯데온"],
}

TARGET_MALL_KEYS = ["emart", "homeplus", "kurly"]

# 마트별 장바구니 URL
CART_LINKS = {
    "emart": "https://m.ssg.com/cart/dcart.ssg",
    "homeplus": "https://front.homeplus.co.kr/cart",
    "kurly": "https://www.kurly.com/cart",
    "coupang": "https://mc.coupang.com/",
    "lotte": "https://www.lotteon.com/display/ec/m/cart/cartList"
}


class MallComparisonService:
    def __init__(self):
        self.provider = NaverShoppingProvider()

    async def compare_basket(self, basket_items: list[BasketItem]) -> list[Plan]:
        """장바구니 품목을 각 몰별로 검색하여 비교 플랜을 생성한다."""

        # 1. 모든 아이템에 대해 검색 수행
        search_cache = {}
        for item in basket_items:
            results = await self.provider.search_products(
                item,
                max_results=80,
                required_keywords=["이마트", "홈플러스", "컬리"]
            )
            search_cache[item.item_name] = results

        # 2. 몰별 플랜 생성
        plans = []
        for mall_key in TARGET_MALL_KEYS:
            plan = self._create_mall_plan(mall_key, basket_items, search_cache)
            plans.append(plan)

        plans.sort(key=lambda p: p.estimated_total)
        return plans

    def _create_mall_plan(
        self,
        mall_key: str,
        items: list[BasketItem],
        search_cache: dict[str, list[PlanItem]]
    ) -> Plan:
        """특정 몰에 대한 플랜 생성."""
        aliases = MALL_ALIASES.get(mall_key, [])
        plan_items = []
        total_cost = 0
        missing_count = 0

        mall_display_names = {
            "emart": "이마트몰 (SSG)",
            "homeplus": "홈플러스",
            "kurly": "마켓컬리",
            "coupang": "쿠팡",
            "lotte": "롯데마트"
        }
        mall_name = mall_display_names.get(mall_key, mall_key)

        for item in items:
            candidates = search_cache.get(item.item_name, [])
            mall_candidates = [
                c for c in candidates
                if any(alias in c.source for alias in aliases)
            ]

            if mall_candidates:
                mall_candidates.sort(key=lambda x: x.price)
                best = mall_candidates[0]
                final_price = best.price * item.quantity
                selected = best.model_copy(update={"price": final_price})
                plan_items.append(selected)
                total_cost += final_price
            else:
                missing_count += 1
                plan_items.append(PlanItem(
                    item_name=item.item_name,
                    product_name=f"{item.item_name} (미판매)",
                    brand=item.brand,
                    price=0,
                    link=None,
                    source=mall_name,
                    available=False
                ))

        total_count = len(items)
        coverage = total_count - missing_count

        from app.domain.models.plan import PlanType
        return Plan(
            plan_type=PlanType.CHEAPEST,
            mart_name=mall_name,
            items=plan_items,
            estimated_total=total_cost,
            coverage=coverage,
            total_basket_items=total_count,
            cart_url=CART_LINKS.get(mall_key),
            badges=[f"{mall_name} 최저가"],
            explanation=f"{mall_name}에서 {total_count}개 중 {coverage}개 품목을 구매할 수 있습니다. 예상 총액은 {total_cost:,}원입니다."
        )
```

---

## 9. Chat Service

### 🔴 `application/services/chat_service.py` — LLM 챗봇 핵심 서비스

**역할**: GPT-4o-mini 기반 장바구니 비서. 시스템 프롬프트에 장바구니 컨텍스트를 주입하고, LLM 응답에서 JSON diff를 파싱하여 반환. 선호 브랜드 자동 적용 포함.

> **핵심 포인트**
>
> - `SYSTEM_PROMPT`: 장바구니 현황 + 구매이력을 컨텍스트로 주입
> - `_extract_diff`: LLM 응답의 ```json 블록에서 diff 추출
> - `_apply_preferences`: diff 항목에 선호 브랜드 자동 적용 (Canonical ID 기반)
> - ⚠️ `_build_purchase_history_context` 함수가 중복 정의되어 있음 (버그)

```python
"""LLM 챗봇 서비스 — GPT-4o-mini 기반 장바구니 비서."""

import json
import os
import re
from typing import Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.domain.models.basket import ItemMode
from app.application.services.canonicalization import CanonicalizationService
from app.infrastructure.persistence.repositories.preference_repository import PreferredBrandRepository

# Langfuse 설정 (v3 — 환경변수 기반 자동 연동)
os.environ["LANGFUSE_SECRET_KEY"] = settings.langfuse_secret_key
os.environ["LANGFUSE_PUBLIC_KEY"] = settings.langfuse_public_key
os.environ["LANGFUSE_HOST"] = settings.langfuse_base_url

_langfuse_enabled = bool(settings.langfuse_secret_key and settings.langfuse_public_key)

# 대화 히스토리 (세션 기반, MVP 인메모리)
_chat_history: list = []
_MAX_HISTORY = 20

# 구매 이력 Mock 데이터
_MOCK_PURCHASE_HISTORY = [
    {"item_name": "닭가슴살", "cycle": 14, "last_purchased_days_ago": 13, "status": "due"},
    {"item_name": "생수 2L", "cycle": 7, "last_purchased_days_ago": 2, "status": "ok"},
    {"item_name": "햇반", "cycle": 30, "last_purchased_days_ago": 32, "status": "overdue"},
]

# 장바구니 비서 시스템 프롬프트
SYSTEM_PROMPT = """당신은 '똑장' 장보기 AI 비서입니다.

## 역할
사용자의 장보기를 돕는 친근하고 똑똑한 비서입니다.

## 현재 장바구니
{basket_context}

## 구매 이력 (재구매 분석용)
{purchase_history_context}

## 행동 규칙
1. **장바구니 변경안(diff) 생성**:
   - 품목 추가/삭제/수정 시 반드시 JSON diff를 생성하세요.
   - 포맷:
   ```json
   {{"diff": [{{"action": "add", "item_name": "품목명", "brand": null, "size": "규격", "quantity": 수량, "mode": "recommend", "reason": "추가 이유"}}]}}
```

- action: "add", "remove", "modify"
- mode: "recommend"(추천⭐) 또는 "fixed"(고정🔒)
- 고정모드(🔒) 브랜드는 자동 변경 금지.

2. **요리 레시피 기반 추천**:

   - 사용자가 요리 의도를 보이면 필수 재료를 모두 추천하세요.
   - 이미 가지고 있다고 말한 재료는 제외하세요.
3. **재구매 제안**:

   - 구매 이력에 [재구매 시점 도래]로 표시된 품목이 있다면 자연스럽게 추가를 제안하세요.
4. **톤앤매너**: 한국어, 친근하고 적극적인 비서 톤. 이모지 적절히 사용.
   """

def _build_basket_context(basket_items: list[dict]) -> str:
    """현재 장바구니 상태를 텍스트로 변환."""
    if not basket_items:
        return "비어 있음"
    lines = []
    for item in basket_items:
        mode_icon = "🔒" if item.get("mode") == "fixed" else "⭐"
        brand = item.get("brand") or ""
        size = item.get("size") or ""
        qty = item.get("quantity", 1)
        name = item.get("item_name", "")
        line = f"- {mode_icon} {brand} {name} {size} x{qty}".strip()
        lines.append(line)
    return "\n".join(lines)

def _build_purchase_history_context() -> str:
    """구매 이력을 텍스트로 변환."""
    lines = []
    for item in _MOCK_PURCHASE_HISTORY:
        status_icon = "⚠️" if item["status"] in ["due", "overdue"] else "✅"
        msg = f"- {item['item_name']} (주기 {item['cycle']}일, 마지막 구매 {item['last_purchased_days_ago']}일 전)"
        if item["status"] == "due":
            msg += " -> 구매 시점 도래!"
        elif item["status"] == "overdue":
            msg += " -> 구매 시점 지남!"
        lines.append(f"{status_icon} {msg}")
    return "\n".join(lines)

def _get_llm() -> ChatOpenAI:
    return ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        temperature=0.7,
    )

async def chat_with_llm(
    user_message: str,
    basket_items: list[dict],
    user_id: str = "test_user",
) -> dict:
    """사용자 메시지를 LLM으로 처리하고 응답을 반환한다."""
    global _chat_history

    basket_context = _build_basket_context(basket_items)
    history_context = _build_purchase_history_context()

    formatted_prompt = SYSTEM_PROMPT.format(
        basket_context=basket_context,
        purchase_history_context=history_context
    )
    system_msg = SystemMessage(content=formatted_prompt)

    _chat_history.append(HumanMessage(content=user_message))
    if len(_chat_history) > _MAX_HISTORY:
        _chat_history = _chat_history[-_MAX_HISTORY:]

    messages = [system_msg] + _chat_history
    llm = _get_llm()

    try:
        response = await llm.ainvoke(messages)
        assistant_content = response.content
    except Exception as e:
        print(f"[ChatService] LLM 호출 실패: {e}")
        assistant_content = f"죄송해요, 일시적으로 응답할 수 없습니다. (오류: {str(e)[:50]})"

    _chat_history.append(AIMessage(content=assistant_content))

    diff = _extract_diff(assistant_content)
    clean_content = _clean_content(assistant_content)

    # 선호 브랜드 적용
    if diff:
        applied_msgs = await _apply_preferences(diff, user_id)
        if applied_msgs:
            clean_content += "\n\n" + "\n".join(applied_msgs)

    suggestions = _generate_suggestions(basket_items, user_message)

    return {
        "content": clean_content,
        "diff": diff,
        "suggestions": suggestions,
    }

def _extract_diff(content: str) -> Optional[list[dict]]:
    """LLM 응답에서 JSON diff 블록을 추출한다."""
    try:
        json_match = re.search(r'``json\s*(\{.*?\})\s*``', content, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(1))
            if "diff" in data:
                return data["diff"]

    json_match = re.search(r'\{[^{}]*"diff"\s*:\s*\[.*?\]\s*\}', content, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
            if "diff" in data:
                return data["diff"]
    except (json.JSONDecodeError, AttributeError):
        pass
    return None

def _clean_content(content: str) -> str:
    """응답에서 JSON 블록을 제거하여 깨끗한 텍스트만 반환한다."""
    cleaned = re.sub(r'``json\s*\{.*?\}\s*``', '', content, flags=re.DOTALL)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    return cleaned.strip()

def _generate_suggestions(basket_items: list[dict], last_message: str) -> list[str]:
    """현재 상태에 맞는 추천 명령을 생성한다."""
    suggestions = []
    if basket_items:
        suggestions.append("분석 시작해줘")
        suggestions.append("장바구니 보여줘")
    else:
        suggestions.append("계란 30구 추가해줘")
        suggestions.append("김치찌개 재료 추천해줘")
    suggestions.append("도움말")
    return suggestions

async def generate_greeting(basket_items: list[dict]) -> dict:
    """앱 진입 시점의 첫 인사말과 제안을 생성한다."""
    greeting = "안녕하세요! 👋 저는 똑장 AI 비서예요.\n장바구니에 담을 품목을 알려주세요!"

    due_items = [
        item["item_name"] for item in _MOCK_PURCHASE_HISTORY
        if item["status"] in ["due", "overdue"]
    ]
    suggestions = ["계란 30구 추가해줘", "김치찌개 재료 추천해줘"]

    if due_items:
        products = ", ".join(due_items[:2])
        greeting += f"\n\n💡 {products} 구매하실 때가 되었어요. 추가할까요?"
        suggestions.insert(0, f"{due_items[0]} 추가해줘")

    if basket_items:
        greeting = "장바구니에 담긴 물건들을 확인하고 있어요. 무엇을 더 도와드릴까요?"

    return {"content": greeting, "diff": None, "suggestions": suggestions}

async def _apply_preferences(diff: list[dict], user_id: str) -> list[str]:
    """Diff 항목에 대해 선호 브랜드를 확인하고 적용한다 (LOCKED 모드)."""
    messages = []
    canon_service = CanonicalizationService()
    repo = PreferredBrandRepository()

    for item in diff:
        action = item.get("action")
        if action not in ["add", "modify"]:
            continue

    current_brand = item.get("brand")
        current_mode = item.get("mode")

    # 브랜드가 지정되어 있고 고정 모드면 패스 (사용자 의도 존중)
        if current_brand and current_mode == "fixed":
            continue

    item_name = item.get("item_name", "")
        size = item.get("size")

    canonical_id = canon_service.get_canonical_id(item_name, size)
        pref = await repo.get(user_id, canonical_id)

    if pref:
            # Invariant Matching: 규격/수량 보정
            def extract_qty(text):
                if not text: return None
                match = re.search(r'(\d+)', text)
                return int(match.group(1)) if match else None

    target_qty_spec = extract_qty(size)
            pref_qty_spec = extract_qty(pref.preferred_variant)

    new_quantity = item.get("quantity", 1)
            reason_suffix = ""

    if target_qty_spec and pref_qty_spec and target_qty_spec > pref_qty_spec:
                if target_qty_spec % pref_qty_spec == 0:
                    multiplier = target_qty_spec // pref_qty_spec
                    new_quantity = new_quantity * multiplier
                    reason_suffix = f" ({size} → {pref.preferred_variant} x{multiplier})"

    item["brand"] = pref.preferred_brand
            if pref.preferred_variant:
                item["size"] = pref.preferred_variant
            item["quantity"] = new_quantity
            item["mode"] = "fixed"
            item["reason"] = f"❤️ 선호 브랜드 적용{reason_suffix}"

    messages.append(f"💡 선호하시는**{pref.preferred_brand}** 브랜드로 담았어요.{reason_suffix}")

    return messages

def clear_chat_history():
    """대화 히스토리를 초기화한다."""
    global _chat_history
    _chat_history.clear()

```

---

## 10. Generate Plans Usecase

### 🔴 `application/usecases/generate_plans.py` — 플랜 생성 유즈케이스

**역할**: MallComparisonService를 호출하여 Top3 플랜을 생성하고, 커버리지 우선 정렬 + 아이콘 추가.

```python
"""플랜 생성 유즈케이스 — 네이버 쇼핑 API 실제 호출 기반."""

from app.domain.models.basket import BasketItem
from app.domain.models.plan import Plan
from app.domain.models.user_preferences import ShoppingContext
from app.application.services.mall_comparer import MallComparisonService


async def generate_plans(
    basket_items: list[BasketItem],
    context: ShoppingContext = None
) -> list[Plan]:
    """장바구니와 사용자 설정을 기반으로 Top3 플랜을 생성한다."""
    comparer = MallComparisonService()
    plans = await comparer.compare_basket(basket_items)

    for p in plans:
        p.mart_icon = _get_mall_icon(p.mart_name)

    # 정렬: 커버리지 완전 충족 우선 -> 총액 오름차순
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
```

---

## 11. LangGraph 상태 & 노드

### 🟠 `infrastructure/graph/state/chat_state.py` — LangGraph 상태 정의

**역할**: LangGraph 노드 간 공유되는 대화 상태. 메시지 히스토리, 장바구니, pending diff, 의도를 포함.

```python
"""LangGraph 대화 상태 모델."""

from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from app.domain.models.basket import BasketItem


class ChatState(TypedDict):
    """LangGraph 대화 상태.

    Attributes:
        messages: 대화 메시지 히스토리
        basket_items: 현재 장바구니 품목 리스트
        pending_diff: 사용자 확인 대기 중인 변경안
        intent: 현재 사용자 의도 (add/remove/recipe/search 등)
    """
    messages: Annotated[list, add_messages]
    basket_items: list[BasketItem]
    pending_diff: list[dict] | None
    intent: str | None
```

---

### 🟠 `infrastructure/graph/graph_builder.py` — LangGraph 그래프 빌더

**역할**: parse → clarify → END 흐름의 챗봇 그래프 정의. 현재 노드들은 스텁 상태.

```python
"""LangGraph 그래프 빌더 — 대화 흐름 정의."""

from langgraph.graph import END, StateGraph
from app.infrastructure.graph.nodes.clarify import clarify_node
from app.infrastructure.graph.nodes.parse import parse_node
from app.infrastructure.graph.state.chat_state import ChatState


def build_chat_graph() -> StateGraph:
    """챗봇 대화 그래프를 빌드하여 반환한다.

    플로우: parse → clarify → END
    """
    graph = StateGraph(ChatState)

    graph.add_node("parse", parse_node)
    graph.add_node("clarify", clarify_node)

    graph.set_entry_point("parse")
    graph.add_edge("parse", "clarify")
    graph.add_edge("clarify", END)

    return graph.compile()
```

---

### 🟠 `infrastructure/graph/nodes/parse.py` — 파싱 노드 (스텁)

**역할**: 사용자 입력에서 의도(intent)와 품목을 추출하는 노드. 현재 TODO 스텁 — 실제 LLM 연동 필요.

```python
"""사용자 입력 파싱 노드 — 자연어 → 구조화된 의도 + 품목 추출."""

from app.infrastructure.graph.state.chat_state import ChatState

PARSE_SYSTEM_PROMPT = """당신은 '똑장' 장보기 에이전트입니다.
사용자의 메시지를 분석하여 다음 중 하나의 의도(intent)를 판별하세요:

- add: 장바구니에 품목 추가
- remove: 장바구니에서 품목 삭제
- modify: 기존 품목 수정 (수량, 브랜드 등)
- recipe: 요리 기반 재료 자동 구성
- search: 가격 비교 / 분석 시작 요청
- clear: 전체 삭제
- general: 일반 대화

반드시 변경안(diff)을 먼저 보여주고, 사용자 확인 후에만 적용하세요.
고정모드(🔒) 상품의 브랜드를 자동 변경하지 마세요.
"""


async def parse_node(state: ChatState) -> dict:
    """사용자 입력을 파싱하는 노드. (TODO: LLM 연동 필요)"""
    return {
        "intent": "general",
        "pending_diff": None,
    }
```

---

## 12. API 라우터

### 🔴 `api/v1/routers/basket.py` — 장바구니 CRUD

**역할**: 장바구니 조회/추가/삭제 API. MVP에서는 인메모리 `_basket` 전역 변수 사용.

```python
"""장바구니 API 라우터."""

from fastapi import APIRouter
from app.domain.models.basket import Basket, BasketItem
from app.schemas.basket import BasketAddRequest, BasketResponse

router = APIRouter(prefix="/basket", tags=["장바구니"])

# 인메모리 임시 저장 (MVP)
_basket = Basket()


@router.get("", response_model=BasketResponse)
async def get_basket():
    """현재 장바구니를 조회한다."""
    return BasketResponse(items=_basket.items, total_items=_basket.total_items)


@router.post("", response_model=BasketResponse)
async def add_item(request: BasketAddRequest):
    """장바구니에 품목을 추가한다."""
    item = BasketItem(
        item_name=request.item_name,
        brand=request.brand,
        size=request.size,
        quantity=request.quantity,
        category=request.category,
        mode=request.mode,
    )
    _basket.add_item(item)
    return BasketResponse(items=_basket.items, total_items=_basket.total_items)


@router.delete("/{item_name}", response_model=BasketResponse)
async def remove_item(item_name: str):
    """장바구니에서 품목을 삭제한다."""
    _basket.remove_item(item_name)
    return BasketResponse(items=_basket.items, total_items=_basket.total_items)


@router.delete("", response_model=BasketResponse)
async def clear_basket():
    """장바구니를 비운다."""
    _basket.clear()
    return BasketResponse(items=_basket.items, total_items=_basket.total_items)
```

---

### 🔴 `api/v1/routers/chat.py` — 챗봇 API

**역할**: LLM 챗봇 메시지 송수신 API. LLM 응답의 diff를 `DiffItem` 리스트로 파싱하여 반환.

```python
"""챗봇 API 라우터."""

from fastapi import APIRouter
from app.application.services.chat_service import chat_with_llm, clear_chat_history, generate_greeting
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse, DiffAction, DiffItem, MessageRole
from app.domain.models.basket import BasketItem, ItemMode

router = APIRouter(prefix="/chat", tags=["챗봇"])
from app.api.v1.routers.basket import _basket  # MVP 임시


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(request: ChatMessageRequest):
    """챗봇 메시지를 전송하고 GPT 응답을 받는다."""
    basket_items = [item.model_dump() for item in _basket.items]
    result = await chat_with_llm(
        user_message=request.message,
        basket_items=basket_items,
        user_id="test_user",
    )

    diff_items = None
    if result.get("diff"):
        diff_items = []
        for d in result["diff"]:
            try:
                action = DiffAction(d.get("action", "add"))
                mode = ItemMode.FIXED if d.get("mode") == "fixed" else ItemMode.RECOMMEND
                basket_item = BasketItem(
                    item_name=d.get("item_name", ""),
                    brand=d.get("brand"),
                    size=d.get("size"),
                    quantity=d.get("quantity", 1),
                    mode=mode,
                )
                diff_items.append(DiffItem(action=action, item=basket_item, reason=d.get("reason", "")))
            except Exception as e:
                print(f"[Chat] diff 파싱 오류: {e}")
                continue

    return ChatMessageResponse(
        role=MessageRole.ASSISTANT,
        content=result["content"],
        diff=diff_items if diff_items else None,
        suggestions=result.get("suggestions", ["최저가 비교해줘"]),
    )


@router.get("/greeting", response_model=ChatMessageResponse)
async def get_greeting():
    """앱 진입 시점의 첫 인사말과 제안을 반환한다."""
    basket_items = [item.model_dump() for item in _basket.items]
    result = await generate_greeting(basket_items)
    return ChatMessageResponse(
        role=MessageRole.ASSISTANT,
        content=result["content"],
        diff=None,
        suggestions=result["suggestions"],
    )


@router.post("/clear")
async def clear_history():
    """대화 히스토리를 초기화한다."""
    clear_chat_history()
    return {"status": "ok", "message": "대화 히스토리가 초기화되었습니다."}
```

---

### 🔴 `api/v1/routers/plans.py` — 플랜 생성/조회 API

**역할**: 장바구니 기반 Top3 추천 플랜 생성 및 캐시 조회. 동적 헤드라인 생성 포함.

```python
from datetime import datetime
from fastapi import APIRouter, Depends
from app.application.usecases.generate_plans import generate_plans
from app.infrastructure.persistence.repositories.shopping_settings_repository import ShoppingSettingsRepository
from app.schemas.plan import PlanListResponse

router = APIRouter(prefix="/plans", tags=["추천 플랜"])
from app.api.v1.routers.basket import _basket  # MVP 임시

_last_result: PlanListResponse | None = None


@router.post("/generate", response_model=PlanListResponse)
async def generate(
    settings_repo: ShoppingSettingsRepository = Depends(lambda: ShoppingSettingsRepository())
):
    """장바구니 기반으로 Top3 추천 플랜을 생성한다."""
    global _last_result
    context = await settings_repo.get_context()
    plans_result = await generate_plans(_basket.items, context)

    top3 = plans_result[:3]
    alternatives = plans_result[3:]
    now = datetime.now().strftime("%H:%M")

    if top3:
        cheapest = top3[0]
        headline = f"{cheapest.mart_name}에서 {cheapest.estimated_total:,}원이 최저가에요"
    else:
        headline = "장바구니에 품목을 추가해주세요"

    _last_result = PlanListResponse(
        top3=top3,
        alternatives=alternatives,
        headline=headline,
        last_updated=f"오늘 {now} 기준",
    )
    return _last_result


@router.get("", response_model=PlanListResponse)
async def get_plans():
    """마지막으로 생성된 플랜을 조회한다 (캐시)."""
    if _last_result:
        return _last_result
    return PlanListResponse(headline="아직 분석이 시작되지 않았습니다.")
```

---

### 🔴 `api/v1/routers/preferences.py` — 선호 브랜드 API

**역할**: 사용자 선호 브랜드 조회/저장 API. Canonical ID 기반으로 품목별 선호 브랜드 관리.

```python
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.preference import SetBrandPreferenceRequest, BrandPreferenceResponse
from app.infrastructure.persistence.repositories.preference_repository import PreferredBrandRepository
from app.domain.models.preferences import PreferredBrand

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("/brands/{canonical_item_id}", response_model=BrandPreferenceResponse)
async def get_brand_preference(
    user_id: str,
    canonical_item_id: str,
    repo: PreferredBrandRepository = Depends(lambda: PreferredBrandRepository())
):
    """특정 품목(Canonical ID)에 대한 선호 브랜드를 조회한다."""
    pref = await repo.get(user_id, canonical_item_id)
    if not pref:
        raise HTTPException(status_code=404, detail="Preference not found")
    return BrandPreferenceResponse(
        user_id=pref.user_id,
        canonical_item_id=pref.canonical_item_id,
        preferred_brand=pref.preferred_brand,
        preferred_variant=pref.preferred_variant,
        updated_at=pref.updated_at
    )


@router.post("/brands", response_model=BrandPreferenceResponse)
async def set_brand_preference(
    req: SetBrandPreferenceRequest,
    repo: PreferredBrandRepository = Depends(lambda: PreferredBrandRepository())
):
    """선호 브랜드를 설정(저장/업데이트)한다."""
    pref = PreferredBrand(
        user_id=req.user_id,
        canonical_item_id=req.canonical_item_id,
        preferred_brand=req.preferred_brand,
        preferred_variant=req.preferred_variant
    )
    await repo.set(pref)
    saved = await repo.get(req.user_id, req.canonical_item_id)
    return BrandPreferenceResponse(
        user_id=saved.user_id,
        canonical_item_id=saved.canonical_item_id,
        preferred_brand=saved.preferred_brand,
        preferred_variant=saved.preferred_variant,
        updated_at=saved.updated_at
    )
```

---

## 주요 이슈 & 개선 포인트

| 항목                                          | 내용                                                     | 우선순위        |
| --------------------------------------------- | -------------------------------------------------------- | --------------- |
| `_build_purchase_history_context` 중복 정의 | `chat_service.py`에 동일 함수 두 번 정의 (버그)        | 즉시 수정       |
| LangGraph 노드 스텁                           | `parse_node`, `clarify_node` 실제 LLM 연동 미구현    | 중간            |
| 라우터 간 `_basket` 직접 import             | `basket.py`의 전역 변수를 다른 라우터에서 직접 참조    | DB 연동 시 해결 |
| NaverLocal 좌표 미사용                        | 네이버 Local API가 좌표 필터링 미지원 → 카카오 API 검토 | 중간            |
| 인메모리 히스토리                             | `_chat_history`가 서버 재시작 시 초기화됨              | DB 연동 시 해결 |
