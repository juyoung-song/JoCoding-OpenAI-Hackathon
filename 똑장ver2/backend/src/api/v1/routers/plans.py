"""플랜 생성/선택 API 라우터.

- 1순위: DB 기반 오프라인 엔진
- 2순위: 기존 MockOfflineProvider fallback
- 계약 정렬: offline/online generate+select + /plans/generate 호환 어댑터
"""
from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime, timezone
from time import perf_counter
from typing import List, Literal
from urllib.parse import quote, urlparse
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, Field

from src.api.v1.dependencies import AuthUser, require_auth
from src.api.v1.routers.basket import get_basket_store, sync_basket_store_from_db
from src.api.v1.routers.preferences import _user_preferences, sync_preferences_from_db
from src.application.services.canonicalization import CanonicalizationService
from src.application.services.geo import haversine_km
from src.application.services.offline_plan_adapter import (
    DEFAULT_MAX_TRAVEL_MINUTES,
    DEFAULT_TRAVEL_MODE,
    DEFAULT_USER_LAT,
    DEFAULT_USER_LNG,
    OfflinePlanAdapter,
)
from src.application.services.online_plan_adapter import OnlinePlanAdapter
from src.application.services.ranking_engine import RankingEngine
from src.core.config import settings
from src.core.metrics import get_online_plan_kpi_tracker
from src.domain.models.basket import Basket, BasketItem
from src.domain.models.plan import Plan, PlanType
from src.infrastructure.persistence.user_repository import UserRepository
from src.infrastructure.providers.mock_providers import MockOfflineProvider

router = APIRouter(tags=["plans"])
logger = logging.getLogger(__name__)

canonical_service = CanonicalizationService()
ranking_engine = RankingEngine()
offline_provider = MockOfflineProvider()

CART_LINKS = {
    "이마트": "https://m.ssg.com/cart/dcart.ssg",
    "홈플러스": "https://front.homeplus.co.kr/cart",
    "롯데마트": "https://www.lotteon.com/display/ec/m/cart/cartList",
}

MART_ICONS = {
    "이마트": "🏪",
    "홈플러스": "🏢",
    "롯데마트": "🏬",
}

ONLINE_DELIVERY_INFO = {
    "이마트": {"eta_minutes": 180, "delivery_fee": 3000, "benefit": "새벽배송"},
    "홈플러스": {"eta_minutes": 210, "delivery_fee": 2500, "benefit": "당일배송"},
    "롯데마트": {"eta_minutes": 240, "delivery_fee": 2000, "benefit": "묶음배송"},
}

MOCK_STORE_COORDS = {
    "이마트": (37.4997, 127.0275),
    "홈플러스": (37.5038, 127.0248),
    "롯데마트": (37.4973, 127.0311),
}


class PlanUserContext(BaseModel):
    lat: float | None = Field(None, ge=-90, le=90)
    lng: float | None = Field(None, ge=-180, le=180)
    travel_mode: Literal["walk", "transit", "car"] | None = None
    max_travel_minutes: int | None = Field(None, gt=0, le=120)
    source: str | None = None
    address: str | None = None


class GeneratePlansRequest(BaseModel):
    items: list[BasketItem] = Field(default_factory=list)
    user_context: PlanUserContext | None = None


class EffectivePlanContext(BaseModel):
    lat: float
    lng: float
    travel_mode: Literal["walk", "transit", "car"]
    max_travel_minutes: int
    source: str
    address: str | None = None


class PlanGenerationMeta(BaseModel):
    request_id: str
    generated_at: str
    degraded_providers: list[str] = Field(default_factory=list)
    effective_context: EffectivePlanContext
    weather_note: str | None = None


class PlanListResponse(BaseModel):
    top3: List[Plan]
    headline: str
    last_updated: str
    alternatives: List[Plan] = Field(default_factory=list)
    meta: PlanGenerationMeta | None = None


class OfflineSelectRequest(BaseModel):
    request_id: str
    selected_plan_type: PlanType
    store_id: str | None = None


class OfflineSelectResponse(BaseModel):
    status: str
    store_name: str
    store_address: str
    navigation_url: str
    selected_at: str


class OnlineSelectRequest(BaseModel):
    request_id: str
    selected_plan_type: PlanType
    mall_name: str
    cart_redirect_url: str | None = None


class OnlineSelectResponse(BaseModel):
    status: str
    mall_name: str
    cart_redirect_url: str
    selected_at: str
    direct_cart_supported: bool


@router.post("/offline/plans/generate", response_model=PlanListResponse)
async def generate_offline_plans(
    payload: GeneratePlansRequest,
    request: Request,
    response: Response,
    current_user: AuthUser = Depends(require_auth),
):
    return await _generate_plans(
        payload=payload,
        request=request,
        response=response,
        mode="offline",
        user_id=current_user.user_id,
    )


@router.post("/online/plans/generate", response_model=PlanListResponse)
async def generate_online_plans(
    payload: GeneratePlansRequest,
    request: Request,
    response: Response,
    current_user: AuthUser = Depends(require_auth),
):
    return await _generate_plans(
        payload=payload,
        request=request,
        response=response,
        mode="online",
        user_id=current_user.user_id,
    )


@router.post("/plans/generate", response_model=PlanListResponse)
async def generate_plans_compat(
    payload: GeneratePlansRequest,
    request: Request,
    response: Response,
    mode: str = "online",
    current_user: AuthUser = Depends(require_auth),
):
    """2주 호환 어댑터 엔드포인트."""
    normalized_mode = mode.lower()
    if normalized_mode not in {"online", "offline"}:
        raise HTTPException(status_code=400, detail={"code": "INVALID_MODE", "message": "mode must be online/offline"})

    return await _generate_plans(
        payload=payload,
        request=request,
        response=response,
        mode=normalized_mode,
        user_id=current_user.user_id,
    )


@router.post("/offline/plans/select", response_model=OfflineSelectResponse)
async def select_offline_plan(
    payload: OfflineSelectRequest,
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)
    stored = await repo.get_plan_request(
        request_id=payload.request_id,
        user_id=current_user.user_id,
        mode="offline",
    )
    if not stored:
        raise HTTPException(status_code=400, detail={"code": "INVALID_REQUEST_ID", "message": "request_id not found"})

    selected = _find_selected_plan(
        response_data=stored.get("response", {}),
        selected_plan_type=payload.selected_plan_type,
        mart_or_mall=payload.store_id,
    )
    if not selected:
        raise HTTPException(status_code=400, detail={"code": "INVALID_SELECTION", "message": "selected plan not found"})

    store_name = str(selected.get("mart_name") or payload.store_id or "매장")
    store_address = await _resolve_store_address(request, store_name)
    return OfflineSelectResponse(
        status="selected",
        store_name=store_name,
        store_address=store_address,
        navigation_url=f"https://map.naver.com/v5/search/{quote(store_name)}",
        selected_at=datetime.now(timezone.utc).isoformat(),
    )


@router.post("/online/plans/select", response_model=OnlineSelectResponse)
async def select_online_plan(
    payload: OnlineSelectRequest,
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)
    stored = await repo.get_plan_request(
        request_id=payload.request_id,
        user_id=current_user.user_id,
        mode="online",
    )
    if not stored:
        raise HTTPException(status_code=400, detail={"code": "INVALID_REQUEST_ID", "message": "request_id not found"})

    selected = _find_selected_plan(
        response_data=stored.get("response", {}),
        selected_plan_type=payload.selected_plan_type,
        mart_or_mall=payload.mall_name,
    )
    if not selected:
        raise HTTPException(status_code=400, detail={"code": "INVALID_SELECTION", "message": "selected plan not found"})

    candidate_url = payload.cart_redirect_url
    if not candidate_url:
        candidate_url = selected.get("cart_url")
    if not candidate_url:
        links = selected.get("mall_product_links") or []
        candidate_url = links[0] if links else None

    sanitized_url = _sanitize_external_url(candidate_url)
    if not sanitized_url:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_REDIRECT_URL",
                "message": "화이트리스트 외 도메인이거나 URL이 유효하지 않습니다.",
            },
        )

    return OnlineSelectResponse(
        status="selected",
        mall_name=str(selected.get("mart_name") or payload.mall_name),
        cart_redirect_url=sanitized_url,
        selected_at=datetime.now(timezone.utc).isoformat(),
        direct_cart_supported=bool(selected.get("direct_cart_supported", False)),
    )


async def _generate_plans(
    *,
    payload: GeneratePlansRequest,
    request: Request,
    response: Response,
    mode: str,
    user_id: str,
) -> PlanListResponse:
    started_at = perf_counter()
    is_online_mode = mode.lower() == "online"
    observed_degraded = False
    success = False

    try:
        await sync_preferences_from_db(request, user_id)

        if payload.items:
            target_basket = Basket(items=payload.items)
        else:
            target_basket = await sync_basket_store_from_db(request, user_id)

        if not target_basket.items:
            raise HTTPException(
                status_code=400,
                detail={"code": "EMPTY_BASKET", "message": "장바구니가 비어 있습니다."},
            )

        _validate_plan_items(target_basket.items)

        normalized_mode = mode.lower()
        resolved_context = _resolve_user_context(payload.user_context)
        degraded_providers: list[str] = []
        weather_note: str | None = None
        preferred_brands, disliked_brands = _resolve_brand_preferences(user_id)

        total_items = len(target_basket.items)
        candidates: list[Plan] = []

        if normalized_mode == "online":
            shopping_provider = getattr(request.app.state, "shopping", None)
            if shopping_provider:
                try:
                    online_adapter = OnlinePlanAdapter(shopping_provider)
                    online_result = await online_adapter.build_candidates(
                        target_basket,
                        preferred_brands=preferred_brands,
                        disliked_brands=disliked_brands,
                    )
                    candidates = online_result.candidates
                    degraded_providers.extend(online_result.degraded_providers)
                except Exception as exc:
                    logger.warning("OnlinePlanAdapter 실패, offline fallback 사용: %s", exc)
                    degraded_providers.append("shopping")
            else:
                degraded_providers.append("shopping")

        try:
            if not candidates:
                adapter = OfflinePlanAdapter(request.app.state.db)
                build_result = await adapter.build_candidates(
                    target_basket,
                    mode=normalized_mode,
                    lat=resolved_context.lat,
                    lng=resolved_context.lng,
                    travel_mode=resolved_context.travel_mode,
                    max_travel_minutes=resolved_context.max_travel_minutes,
                    place_provider=getattr(request.app.state, "place", None),
                    routing_provider=getattr(request.app.state, "routing", None),
                    preferred_brands=preferred_brands,
                    disliked_brands=disliked_brands,
                )
                candidates = build_result.candidates
                degraded_providers.extend(build_result.degraded_providers)
        except Exception as exc:
            logger.warning("OfflinePlanAdapter 실패, mock fallback 사용: %s", exc)

        if not candidates:
            candidates = await _generate_mock_candidates(
                target_basket,
                normalized_mode,
                lat=resolved_context.lat,
                lng=resolved_context.lng,
                travel_mode=resolved_context.travel_mode,
            )
            if "place" not in degraded_providers:
                degraded_providers.append("place")

        if not candidates:
            raise HTTPException(
                status_code=503,
                detail={"code": "DEPENDENCY_FAILURE", "message": "플랜을 생성할 수 없습니다."},
            )

        top3 = ranking_engine.rank_plans(candidates)
        if normalized_mode == "offline":
            order = {PlanType.NEAREST: 0, PlanType.BALANCED: 1, PlanType.CHEAPEST: 2}
        else:
            order = {PlanType.CHEAPEST: 0, PlanType.BALANCED: 1, PlanType.NEAREST: 2}
        top3 = sorted(top3, key=lambda p: order.get(p.plan_type, 99))

        top3_marts = {plan.mart_name for plan in top3}
        alternatives = [candidate for candidate in candidates if candidate.mart_name not in top3_marts]

        for alternative in alternatives:
            _normalize_plan_reliability_fields(alternative, normalized_mode)
            _sanitize_plan_external_links(alternative)

        for plan in top3:
            _normalize_plan_reliability_fields(plan, normalized_mode)
            _sanitize_plan_external_links(plan)
            plan.explanation = _generate_explanation(
                plan,
                total_items,
                normalized_mode,
                preferred_brands=preferred_brands,
                disliked_brands=disliked_brands,
            )

        weather_note, weather_degraded = await _get_weather_note(
            getattr(request.app.state, "weather", None),
            lat=resolved_context.lat,
            lng=resolved_context.lng,
        )
        if weather_degraded:
            degraded_providers.append("weather")

        deduped_degraded = _dedupe(degraded_providers)
        observed_degraded = bool(deduped_degraded)
        headline = _generate_headline(top3, normalized_mode)
        generated_at = datetime.now(timezone.utc).isoformat()
        request_id = f"req-{uuid4().hex[:16]}"

        result = PlanListResponse(
            top3=top3,
            headline=headline,
            last_updated=_now_str(),
            alternatives=alternatives[:3],
            meta=PlanGenerationMeta(
                request_id=request_id,
                generated_at=generated_at,
                degraded_providers=deduped_degraded,
                effective_context=resolved_context,
                weather_note=weather_note,
            ),
        )

        repo = UserRepository(request.app.state.db)
        await repo.save_plan_request(
            request_id=request_id,
            user_id=user_id,
            mode=normalized_mode,
            response=result.model_dump(mode="json"),
        )

        response.status_code = (
            status.HTTP_206_PARTIAL_CONTENT if deduped_degraded else status.HTTP_200_OK
        )
        success = True
        return result
    finally:
        if is_online_mode:
            elapsed_ms = (perf_counter() - started_at) * 1000
            tracker = get_online_plan_kpi_tracker()
            await tracker.record(
                duration_ms=elapsed_ms,
                degraded=observed_degraded,
                success=success,
            )


def _validate_plan_items(items: list[BasketItem]) -> None:
    for item in items:
        name = str(item.item_name or "").strip()
        if len(name) < 2:
            raise HTTPException(
                status_code=422,
                detail={
                    "code": "ITEM_CLARIFICATION_REQUIRED",
                    "message": "품목명이 모호합니다. 항목을 구체적으로 입력해주세요.",
                },
            )
        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail={"code": "INVALID_QUANTITY", "message": "quantity는 1 이상이어야 합니다."},
            )


def _find_selected_plan(
    *,
    response_data: dict,
    selected_plan_type: PlanType,
    mart_or_mall: str | None,
) -> dict | None:
    plans = list(response_data.get("top3") or []) + list(response_data.get("alternatives") or [])
    normalized_target = (mart_or_mall or "").strip().lower()
    for plan in plans:
        if str(plan.get("plan_type")) != selected_plan_type.value:
            continue
        if normalized_target:
            mart_name = str(plan.get("mart_name") or "").strip().lower()
            if mart_name != normalized_target:
                continue
        return plan
    return None


async def _resolve_store_address(request: Request, store_name: str) -> str:
    row = await request.app.state.db.execute(
        "SELECT address FROM store_master WHERE store_name = ? LIMIT 1",
        (store_name,),
    )
    fetched = await row.fetchone()
    await row.close()
    if not fetched:
        return "주소 정보 없음"
    return str(fetched["address"] or "주소 정보 없음")


async def _generate_mock_candidates(
    target_basket: Basket,
    mode: str,
    lat: float,
    lng: float,
    travel_mode: str,
) -> list[Plan]:
    for item in target_basket.items:
        if not item.canonical_id:
            item.canonical_id = canonical_service.get_canonical_id(item.item_name, item.size)

    mart_baskets: dict[str, list] = defaultdict(list)
    for item in target_basket.items:
        results = await offline_provider.get_store_prices(item, lat, lng)
        for plan_item in results:
            mart_baskets[plan_item.store_name].append(plan_item)

    total_items = len(target_basket.items)
    candidates: list[Plan] = []
    for mart_name, items in mart_baskets.items():
        total_price = sum(i.price for i in items)
        delivery = ONLINE_DELIVERY_INFO.get(
            mart_name, {"eta_minutes": 240, "delivery_fee": 3000, "benefit": "일반배송"}
        )
        coverage = len(items)

        if mode == "online":
            estimated_total = max(total_price + delivery["delivery_fee"] - 1500, 0)
            distance_km = None
            travel_minutes = delivery["eta_minutes"]
            delivery_info = f"{delivery['benefit']} · 약 {delivery['eta_minutes']}분"
        else:
            mocked_route = _estimate_mock_route(lat, lng, mart_name, travel_mode)
            estimated_total = total_price
            distance_km = mocked_route["distance_km"]
            travel_minutes = mocked_route["travel_minutes"]
            delivery_info = f"약 {distance_km:.1f}km · {_travel_mode_label(travel_mode)} {travel_minutes}분"

        candidates.append(
            Plan(
                plan_type=PlanType.CHEAPEST,
                mart_name=mart_name,
                mart_icon=MART_ICONS.get(mart_name, "🛒"),
                items=items,
                estimated_total=estimated_total,
                coverage=coverage,
                total_basket_items=total_items,
                coverage_ratio=coverage / total_items if total_items else 0.0,
                distance_km=distance_km,
                travel_minutes=travel_minutes,
                delivery_info=delivery_info,
                badges=[],
                explanation="",
                cart_url=CART_LINKS.get(mart_name),
                price_source="mock_online" if mode == "online" else "offline_db",
                price_observed_at=datetime.now(timezone.utc).isoformat(),
                price_notice=(
                    "모의 데이터 기준이며 실제 결제 금액과 차이가 날 수 있어요."
                    if mode == "online"
                    else "DB 스냅샷 기준이며, 현장 가격과 차이가 날 수 있어요."
                ),
                data_source="mock_online" if mode == "online" else "offline_snapshot",
                mall_product_links=[CART_LINKS[mart_name]] if CART_LINKS.get(mart_name) else [],
                direct_cart_supported=False,
                expected_delivery_hours=max(1, round(delivery["eta_minutes"] / 60)) if mode == "online" else None,
            )
        )
    return candidates


def _resolve_user_context(raw: PlanUserContext | None) -> EffectivePlanContext:
    has_client_context = bool(
        raw
        and (
            raw.lat is not None
            or raw.lng is not None
            or raw.travel_mode is not None
            or raw.max_travel_minutes is not None
        )
    )

    return EffectivePlanContext(
        lat=raw.lat if raw and raw.lat is not None else DEFAULT_USER_LAT,
        lng=raw.lng if raw and raw.lng is not None else DEFAULT_USER_LNG,
        travel_mode=raw.travel_mode if raw and raw.travel_mode else DEFAULT_TRAVEL_MODE,
        max_travel_minutes=(
            raw.max_travel_minutes
            if raw and raw.max_travel_minutes is not None
            else DEFAULT_MAX_TRAVEL_MINUTES
        ),
        source=raw.source if raw and raw.source else ("client" if has_client_context else "default"),
        address=raw.address if raw else None,
    )


async def _get_weather_note(
    weather_provider: object | None,
    lat: float,
    lng: float,
) -> tuple[str | None, bool]:
    if not weather_provider:
        return None, True
    try:
        weather = await weather_provider.get_current_weather(lat, lng)
    except Exception:
        return None, True

    sky = weather.get("sky")
    temp = weather.get("temp")
    rain_prob = weather.get("rain_prob")
    if sky is None and temp is None and rain_prob is None:
        return None, False

    note_parts: list[str] = []
    if sky:
        note_parts.append(str(sky))
    if isinstance(temp, (float, int)):
        note_parts.append(f"{float(temp):.1f}℃")
    if isinstance(rain_prob, (float, int)):
        note_parts.append(f"강수확률 {int(rain_prob)}%")

    if not note_parts:
        return None, False
    return " · ".join(note_parts), False


def _estimate_mock_route(lat: float, lng: float, mart_name: str, travel_mode: str) -> dict[str, float | int]:
    store_lat, store_lng = MOCK_STORE_COORDS.get(mart_name, (DEFAULT_USER_LAT, DEFAULT_USER_LNG))
    distance_km = haversine_km(lat, lng, store_lat, store_lng)
    return {
        "distance_km": round(distance_km, 1),
        "travel_minutes": _estimate_travel_minutes(distance_km, travel_mode),
    }


def _estimate_travel_minutes(distance_km: float, travel_mode: str) -> int:
    normalized_mode = travel_mode.lower()
    if normalized_mode == "walk":
        minutes = round(distance_km * 12)
    elif normalized_mode == "transit":
        minutes = round(distance_km * 4)
    else:
        minutes = max(1, round(distance_km / 0.5))
    return max(1, int(minutes))


def _travel_mode_label(travel_mode: str) -> str:
    normalized_mode = travel_mode.lower()
    if normalized_mode == "transit":
        return "대중교통"
    if normalized_mode == "car":
        return "자차"
    return "도보"


def _normalize_plan_reliability_fields(plan: Plan, mode: str) -> None:
    now_iso = datetime.now(timezone.utc).isoformat()
    if not plan.price_source:
        plan.price_source = "naver_shopping" if mode == "online" else "offline_db"
    if not plan.price_observed_at:
        plan.price_observed_at = now_iso
    if not plan.price_notice:
        plan.price_notice = (
            "네이버 쇼핑 검색 기준이며, 결제 시점 실제 가격/재고와 차이가 날 수 있어요."
            if mode == "online"
            else "DB 스냅샷 기준이며, 현장 가격과 차이가 날 수 있어요."
        )
    if not plan.data_source:
        plan.data_source = "online_naver_shopping" if mode == "online" else "offline_snapshot"
    plan.mall_product_links = list(plan.mall_product_links or [])
    plan.direct_cart_supported = bool(plan.direct_cart_supported)
    if mode == "online" and not plan.expected_delivery_hours and plan.travel_minutes:
        plan.expected_delivery_hours = max(1, round(plan.travel_minutes / 60))


def _sanitize_plan_external_links(plan: Plan) -> None:
    plan.cart_url = _sanitize_external_url(plan.cart_url)
    plan.mall_product_links = [
        url
        for url in (
            _sanitize_external_url(candidate) for candidate in (plan.mall_product_links or [])
        )
        if url
    ]


def _sanitize_external_url(url: str | None) -> str | None:
    if not url:
        return None

    try:
        parsed = urlparse(url)
    except Exception:
        return None

    if parsed.scheme not in {"http", "https"}:
        return None

    host = (parsed.hostname or "").lower()
    if not host:
        return None

    for domain in settings.allowed_external_domains:
        if host == domain or host.endswith(f".{domain}"):
            return url
    return None


def _dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    deduped: list[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        deduped.append(value)
    return deduped


def _now_str() -> str:
    return datetime.now().strftime("오늘 %H:%M 기준")


def _generate_explanation(
    plan: Plan,
    total_items: int,
    mode: str,
    preferred_brands: list[str],
    disliked_brands: list[str],
) -> str:
    ratio_pct = int(plan.coverage_ratio * 100)
    missing_text = _build_missing_summary(plan)
    preference_text = _build_preference_summary(plan, preferred_brands, disliked_brands)
    if mode == "online":
        if plan.plan_type == PlanType.CHEAPEST:
            base = (
                f"{plan.mart_name} 온라인몰 기준 {plan.coverage}개 품목 구매 가능 "
                f"(커버리지 {ratio_pct}%). 배송비 반영 총액 {plan.estimated_total:,}원으로 최저가."
            )
            return f"{base}{preference_text}{missing_text}"
        if plan.plan_type == PlanType.NEAREST:
            base = (
                f"{plan.mart_name} 온라인몰의 예상 배송 시간은 약 {plan.travel_minutes or '?'}분입니다. "
                f"빠른 수령을 원할 때 적합해요."
            )
            return f"{base}{preference_text}{missing_text}"
        base = (
            f"{plan.mart_name} 온라인몰 기준 {plan.coverage}개 품목 구매 가능 "
            f"(커버리지 {ratio_pct}%). 가격과 배송시간의 균형 플랜입니다."
        )
        return f"{base}{preference_text}{missing_text}"

    if plan.plan_type == PlanType.CHEAPEST:
        base = (
            f"{plan.mart_name}에서 {plan.coverage}개 품목 구매 가능 "
            f"(커버리지 {ratio_pct}%). 예상 총액 {plan.estimated_total:,}원으로 최저가."
        )
        return f"{base}{preference_text}{missing_text}"
    if plan.plan_type == PlanType.NEAREST:
        route_text = plan.delivery_info or f"약 {plan.travel_minutes or '?'}분"
        base = (
            f"{plan.mart_name}에서 {plan.coverage}개 품목 구매 가능 "
            f"(커버리지 {ratio_pct}%). {route_text}."
        )
        return f"{base}{preference_text}{missing_text}"
    base = (
        f"{plan.mart_name}에서 {plan.coverage}개 품목 구매 가능 "
        f"(커버리지 {ratio_pct}%). 가격과 거리의 균형."
    )
    return f"{base}{preference_text}{missing_text}"


def _resolve_brand_preferences(user_id: str) -> tuple[list[str], list[str]]:
    profile = _user_preferences.get(user_id, {"like": [], "dislike": []})
    preferred_brands = [str(value) for value in profile.get("like", []) if value]
    disliked_brands = [str(value) for value in profile.get("dislike", []) if value]
    return preferred_brands, disliked_brands


def _build_preference_summary(plan: Plan, preferred_brands: list[str], disliked_brands: list[str]) -> str:
    if not preferred_brands and not disliked_brands:
        return ""

    preferred_set = {value.replace(" ", "").lower() for value in preferred_brands}
    disliked_set = {value.replace(" ", "").lower() for value in disliked_brands}
    preferred_hits = 0
    disliked_hits = 0
    for item in plan.items:
        normalized = (item.brand or "").replace(" ", "").lower()
        if not normalized:
            continue
        if normalized in preferred_set:
            preferred_hits += 1
        if normalized in disliked_set:
            disliked_hits += 1

    parts: list[str] = []
    if preferred_hits > 0:
        parts.append(f"선호 브랜드 {preferred_hits}개 반영")
    if disliked_hits > 0:
        parts.append(f"비선호 브랜드 {disliked_hits}개 포함")
    if not parts:
        return ""
    return " " + " · ".join(parts) + "."


def _build_missing_summary(plan: Plan) -> str:
    if not plan.missing_items:
        return ""
    alternatives = [item for item in plan.missing_items if item.alternative]
    if alternatives:
        sample = alternatives[0]
        alt = sample.alternative
        return (
            f" 미커버 품목 {len(plan.missing_items)}개는 대체품 추천을 제공해요 "
            f"(예: {sample.item_name} → {alt.item_name}{f' {alt.size}' if alt and alt.size else ''})."
        )
    return f" 미커버 품목 {len(plan.missing_items)}개는 해당 매장에서 재고가 없어요."


def _generate_headline(top3: list[Plan], mode: str = "online") -> str:
    if not top3:
        return "플랜을 생성할 수 없습니다."

    if mode == "offline":
        nearest = next((p for p in top3 if p.plan_type == PlanType.NEAREST), top3[0])
        distance_text = f"{nearest.distance_km}" if nearest.distance_km is not None else "?"
        time_text = f"{nearest.travel_minutes}" if nearest.travel_minutes is not None else "?"
        return f"{nearest.mart_name}이(가) 가장 가까워요 (약 {distance_text}km / {time_text}분)"

    cheapest = next((p for p in top3 if p.plan_type == PlanType.CHEAPEST), top3[0])
    return f"{cheapest.mart_name}에서 {cheapest.estimated_total:,}원이 최저가에요"
