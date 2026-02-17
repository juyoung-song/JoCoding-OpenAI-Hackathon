# 똑장 오프라인 파트 공통 도메인 타입 (기획서 섹션 5.3 기반)
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# --- Enums ---


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
    """대체품 추천 정보."""

    item_name: str
    brand: Optional[str] = None
    unit_price_won: int
    saving_won: int = 0
    tag: Optional[str] = None


class MatchedItem(BaseModel):
    """매칭된 품목 상세."""

    item_name: str
    brand: Optional[str] = None
    size_display: Optional[str] = None
    quantity: int
    unit_price_won: int
    subtotal_won: int
    item_tag: Optional[str] = None
    price_verified_at: Optional[datetime] = None


class MissingItem(BaseModel):
    """미커버 품목."""

    item_name: str
    reason: str
    alternative: Optional[ItemAlternative] = None


class PlanAssumption(BaseModel):
    """자동 선택 근거."""

    item_name: str
    field: str
    assumed_value: str
    reason: str


class OfflinePlan(BaseModel):
    """오프라인 플랜 응답 단위."""

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
    """랭킹 엔진 입력 (기획서 섹션 7.2)."""

    store_id: str
    total_price_won: int
    travel_minutes: int
    coverage_ratio: float
    matched_items: list[MatchedItem]
    missing_items: list[MissingItem]
