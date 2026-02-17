# 오프라인 플랜 생성 오케스트레이터 (기획서 섹션 4.2 시퀀스, 7.1 UC-01)
from __future__ import annotations

import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

import aiosqlite

from src.application.product_matcher import ProductMatcher
from src.application.ranking_engine import RankingEngine, StoreScore
from src.domain.types import (
    BasketItem,
    GeneratePlanRequest,
    GeneratePlanResponse,
    ItemAlternative,
    MatchedItem,
    MissingItem,
    OfflinePlan,
    PlanAssumption,
    PlanMeta,
    PlanType,
    RouteEstimate,
    SelectPlanRequest,
    SelectPlanResponse,
    WeatherAdvisory,
)

logger = logging.getLogger(__name__)


class ServiceUnavailableError(Exception):
    """필수 의존 실패 시 503으로 매핑하기 위한 예외."""

    def __init__(self, code: str, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(message)


class PlanService:
    """오프라인 플랜 생성 파이프라인 (기획서 4.2 시퀀스).

    1. 품목 정규화 및 매칭
    2. 매장 후보 검색 (DB 기반)
    3. 이동시간 계산 후 필터링
    4. 가격 매칭 및 총액/커버리지 계산
    5. 날씨 주의정보 결합
    6. Top3 플랜 생성
    7. 실행 로그 저장
    """

    def __init__(
        self,
        db: aiosqlite.Connection,
        routing_provider: object,
        weather_provider: object,
        place_provider: object | None = None,
    ) -> None:
        self._db = db
        self._routing = routing_provider
        self._weather = weather_provider
        self._place = place_provider
        self._matcher = ProductMatcher(db)
        self._ranking = RankingEngine()

    async def generate_plans(self, request: GeneratePlanRequest) -> GeneratePlanResponse:
        """플랜 생성 메인 파이프라인."""
        start_time = time.monotonic()
        request_id = str(uuid.uuid4())
        degraded_providers: list[str] = []

        # Step 1: 품목 매칭
        matched_products, all_assumptions = await self._match_basket(request.basket_items)

        if not matched_products:
            return GeneratePlanResponse(
                plans=[],
                meta=PlanMeta(
                    request_id=request_id,
                    generated_at=datetime.now(timezone.utc),
                    degraded_providers=[],
                ),
            )

        product_keys = [m["product_norm_key"] for m in matched_products]

        # Step 2: 매장 후보 검색 (DB + Place Provider 병합)
        ctx = request.user_context
        radius_km = self._estimate_radius(ctx.max_travel_minutes, ctx.travel_mode.value)
        radius_m = int(radius_km * 1000)
        categories = await self._infer_store_categories(request.basket_items)
        try:
            stores, place_degraded = await self._find_candidate_stores(
                ctx.lat, ctx.lng, radius_km, radius_m, categories
            )
            if place_degraded and "place" not in degraded_providers:
                degraded_providers.append("place")
        except Exception as exc:
            logger.exception("매장 후보 조회 실패")
            raise ServiceUnavailableError(
                code="PLACE_UNAVAILABLE",
                message="주변 매장 정보를 조회할 수 없습니다.",
            ) from exc

        if not stores:
            raise ServiceUnavailableError(
                code="PLACE_UNAVAILABLE",
                message="주변 매장 정보를 조회할 수 없습니다.",
            )

        # Step 3: 이동시간 계산 + 필터링
        store_routes: list[tuple[dict, RouteEstimate]] = []
        all_store_routes: list[tuple[dict, RouteEstimate]] = []
        for store in stores:
            try:
                route = await self._routing.estimate(
                    (ctx.lat, ctx.lng),
                    (store["lat"], store["lng"]),
                    ctx.travel_mode.value,
                )
                if route.travel_minutes <= ctx.max_travel_minutes:
                    store_routes.append((store, route))
            except Exception:
                degraded_providers.append("routing") if "routing" not in degraded_providers else None
                # Graceful degradation: 직선거리 fallback (기획서 7.4)
                route = self._fallback_route(ctx.lat, ctx.lng, store["lat"], store["lng"], ctx.travel_mode.value)
                if route.travel_minutes <= ctx.max_travel_minutes:
                    store_routes.append((store, route))
            all_store_routes.append((store, route))

        if not store_routes:
            if all_store_routes:
                # 원거리 지역 등에서 시간 필터에 모두 걸리면, 가장 가까운 후보를 제한적으로 제시.
                store_routes = sorted(all_store_routes, key=lambda sr: sr[1].travel_minutes)[:3]
                if "place" not in degraded_providers:
                    degraded_providers.append("place")
            else:
                return GeneratePlanResponse(
                    plans=[],
                    meta=PlanMeta(
                        request_id=request_id,
                        generated_at=datetime.now(timezone.utc),
                        degraded_providers=degraded_providers,
                    ),
                )

        if not store_routes:
            return GeneratePlanResponse(
                plans=[],
                meta=PlanMeta(
                    request_id=request_id,
                    generated_at=datetime.now(timezone.utc),
                    degraded_providers=degraded_providers,
                ),
            )

        # Step 4: 가격 매칭 및 총액/커버리지 계산
        candidates: list[StoreScore] = []
        for store, route in store_routes:
            score = await self._evaluate_store(
                store, route, matched_products, request.basket_items, all_assumptions,
            )
            if score:
                candidates.append(score)

        # Step 5: 날씨 주의정보
        weather_note: Optional[str] = None
        try:
            advisory: WeatherAdvisory = await self._weather.get_advisory(ctx.lat, ctx.lng, "2h")
            weather_note = advisory.note
        except Exception:
            weather_note = "정보 없음"
            if "weather" not in degraded_providers:
                degraded_providers.append("weather")

        # Step 6: Top3 랭킹
        ranked = self._ranking.rank(candidates)

        # Step 7: 응답 구성
        plans: list[OfflinePlan] = []
        for plan_type, score in ranked.items():
            if score is None:
                continue
            plans.append(self._build_plan(plan_type, score, weather_note, all_assumptions))

        # Step 8: 실행 로그 저장
        elapsed_ms = int((time.monotonic() - start_time) * 1000)
        await self._log_execution(
            request_id, len(request.basket_items), len(stores),
            len(store_routes), [p.plan_type.value for p in plans],
            elapsed_ms, bool(degraded_providers),
        )

        return GeneratePlanResponse(
            plans=plans,
            meta=PlanMeta(
                request_id=request_id,
                generated_at=datetime.now(timezone.utc),
                degraded_providers=degraded_providers,
            ),
        )

    async def select_plan(self, request: SelectPlanRequest) -> Optional[SelectPlanResponse]:
        """플랜 선택 기록 및 네이버 지도 딥링크 반환."""
        # 매장 정보 조회
        row = await self._db.execute(
            "SELECT store_name, address, lat, lng FROM store_master WHERE store_id = ?",
            (request.store_id,),
        )
        store = await row.fetchone()
        if not store:
            return None

        store_dict = dict(store)
        nav_url = (
            f"nmap://route?dlat={store_dict['lat']}&dlng={store_dict['lng']}"
            f"&dname={store_dict['store_name']}"
        )

        # 선택 로그 저장
        await self._db.execute(
            """INSERT INTO offline_plan_selection_log
               (selection_id, request_id, selected_plan_type, store_id, selected_at)
               VALUES (?, ?, ?, ?, ?)""",
            (str(uuid.uuid4()), request.request_id, request.selected_plan_type.value,
             request.store_id, datetime.now(timezone.utc).isoformat()),
        )
        await self._db.commit()

        return SelectPlanResponse(
            status="confirmed",
            store_name=store_dict["store_name"],
            store_address=store_dict["address"],
            navigation_url=nav_url,
            selected_at=datetime.now(timezone.utc),
        )

    # --- Private helpers ---

    async def _match_basket(
        self, items: list[BasketItem]
    ) -> tuple[list[dict], list[PlanAssumption]]:
        """장바구니 품목 → product_norm_key 매칭."""
        matched: list[dict] = []
        all_assumptions: list[PlanAssumption] = []

        for item in items:
            result = await self._matcher.match(item)
            if result:
                matched.append({
                    "product_norm_key": result.product_norm_key,
                    "normalized_name": result.normalized_name,
                    "brand": result.brand,
                    "size_display": result.size_display,
                    "quantity": item.quantity,
                    "original_item": item,
                })
                all_assumptions.extend(result.assumptions)

        return matched, all_assumptions

    def _estimate_radius(self, max_minutes: int, travel_mode: str) -> float:
        """이동시간으로 검색 반경(km) 추정."""
        if travel_mode == "walk":
            return max_minutes * 4 / 60 * 1.5  # 4km/h, 여유 1.5배
        elif travel_mode == "transit":
            return max_minutes * 15 / 60 * 1.5  # 15km/h 평균
        else:  # car
            return max_minutes * 30 / 60 * 1.5  # 30km/h 도심

    async def _find_nearby_stores(self, lat: float, lng: float, radius_km: float) -> list[dict]:
        """반경 내 매장 조회."""
        lat_range = radius_km / 111.0
        lng_range = radius_km / 88.0

        rows = await self._db.execute(
            """SELECT * FROM store_master
               WHERE is_active = 1
                 AND lat BETWEEN ? AND ?
                 AND lng BETWEEN ? AND ?""",
            (lat - lat_range, lat + lat_range, lng - lng_range, lng + lng_range),
        )
        return [dict(row) for row in await rows.fetchall()]

    async def _find_candidate_stores(
        self,
        lat: float,
        lng: float,
        radius_km: float,
        radius_m: int,
        categories: list[str],
    ) -> tuple[list[dict], bool]:
        db_stores = await self._find_nearby_stores(lat, lng, radius_km)
        merged = {store["store_id"]: store for store in db_stores}
        degraded = False

        if not self._place:
            if merged:
                return list(merged.values()), degraded
            fallback = await self._find_fallback_stores(limit=30)
            if fallback:
                return fallback, True
            return [], True

        try:
            found = await self._place.search_nearby(lat, lng, categories, radius_m)
            for store in found:
                row = store.model_dump(mode="python")
                if not isinstance(row.get("updated_at"), str):
                    row["updated_at"] = row["updated_at"].isoformat()
                merged[row["store_id"]] = row
        except Exception:
            degraded = True
            logger.warning("Place provider failed. Continue with DB-only candidates.")

        if not merged:
            fallback = await self._find_fallback_stores(limit=30)
            if fallback:
                return fallback, True
            return [], True

        return list(merged.values()), degraded

    async def _find_fallback_stores(self, limit: int = 30) -> list[dict]:
        rows = await self._db.execute(
            """SELECT * FROM store_master
               WHERE is_active = 1
               ORDER BY updated_at DESC, store_name ASC
               LIMIT ?""",
            (limit,),
        )
        return [dict(row) for row in await rows.fetchall()]

    async def _infer_store_categories(self, basket_items: list[BasketItem]) -> list[str]:
        rows = await self._db.execute(
            "SELECT DISTINCT category FROM store_master WHERE is_active = 1 ORDER BY category"
        )
        categories = [r["category"] for r in await rows.fetchall() if r["category"]]
        if categories:
            return categories
        return ["mart", "supermarket", "discount"]

    def _fallback_route(
        self, lat1: float, lng1: float, lat2: float, lng2: float, travel_mode: str
    ) -> RouteEstimate:
        """Routing Provider 실패 시 직선거리 fallback (기획서 7.4)."""
        import math

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

    async def _evaluate_store(
        self,
        store: dict,
        route: RouteEstimate,
        matched_products: list[dict],
        basket_items: list[BasketItem],
        all_assumptions: list[PlanAssumption],
    ) -> Optional[StoreScore]:
        """매장별 가격 매칭/총액/커버리지 계산."""
        product_keys = [m["product_norm_key"] for m in matched_products]

        # 해당 매장의 가격 스냅샷 조회
        placeholders = ",".join("?" for _ in product_keys)
        rows = await self._db.execute(
            f"""SELECT * FROM offline_price_snapshot
                WHERE store_id = ? AND product_norm_key IN ({placeholders})
                ORDER BY observed_at DESC""",
            [store["store_id"], *product_keys],
        )
        snapshots_raw = await rows.fetchall()

        # 품목별 최신 1건만
        seen: set[str] = set()
        price_map: dict[str, dict] = {}
        for row in snapshots_raw:
            snap = dict(row)
            pk = snap["product_norm_key"]
            if pk not in seen:
                seen.add(pk)
                price_map[pk] = snap

        if not price_map:
            return None

        # matched_items / missing_items 구성
        matched_items: list[MatchedItem] = []
        missing_items: list[MissingItem] = []
        total_price = 0
        latest_observed = ""

        for mp in matched_products:
            pk = mp["product_norm_key"]
            if pk in price_map:
                snap = price_map[pk]
                qty = mp["quantity"]
                unit_price = snap["price_won"]
                subtotal = unit_price * qty
                total_price += subtotal

                observed_at_str = snap["observed_at"]
                if observed_at_str > latest_observed:
                    latest_observed = observed_at_str

                matched_items.append(MatchedItem(
                    item_name=mp["normalized_name"],
                    brand=mp["brand"],
                    size_display=mp["size_display"],
                    quantity=qty,
                    unit_price_won=unit_price,
                    subtotal_won=subtotal,
                    item_tag=self._compute_item_tag(unit_price, pk, price_map),
                    price_verified_at=datetime.fromisoformat(observed_at_str) if observed_at_str else None,
                ))
            else:
                missing_items.append(MissingItem(
                    item_name=mp["normalized_name"],
                    reason="판매처 없음",
                    alternative=await self._find_alternative(mp, store["store_id"]),
                ))

        coverage = len(matched_items) / len(matched_products) if matched_products else 0.0

        return StoreScore(
            store_id=store["store_id"],
            store_name=store["store_name"],
            store_address=store["address"],
            total_price_won=total_price,
            coverage_ratio=round(coverage, 2),
            travel_minutes=route.travel_minutes,
            distance_km=route.distance_km,
            matched_items=matched_items,
            missing_items=missing_items,
            price_source=price_map[next(iter(price_map))]["source"] if price_map else "mock",
            price_observed_at=latest_observed or "2026-02-14T00:00:00+09:00",
        )

    def _compute_item_tag(self, unit_price: int, product_key: str, all_prices: dict) -> Optional[str]:
        """품목 태그 계산 (최저가 여부)."""
        if not all_prices or product_key not in all_prices:
            return None

        unit_prices = [int(v["price_won"]) for v in all_prices.values() if v.get("price_won") is not None]
        if not unit_prices:
            return None

        min_price = min(unit_prices)
        if unit_price == min_price:
            return "최저가"

        sorted_prices = sorted(unit_prices)
        mid = len(sorted_prices) // 2
        median_price = (
            sorted_prices[mid]
            if len(sorted_prices) % 2 == 1
            else (sorted_prices[mid - 1] + sorted_prices[mid]) / 2
        )
        if median_price > 0 and unit_price <= median_price * 1.1:
            return "가성비"

        return None

    async def _find_alternative(self, product: dict, store_id: str) -> Optional[ItemAlternative]:
        """미커버 품목의 대체품 추천."""
        # 1) 동일 normalized_name(브랜드/규격 다른 변형) 우선
        rows = await self._db.execute(
            """SELECT p.normalized_name, p.brand, p.size_display, ps.price_won
               FROM product_norm source
               JOIN product_norm p ON p.normalized_name = source.normalized_name
               JOIN offline_price_snapshot ps ON p.product_norm_key = ps.product_norm_key
               WHERE source.product_norm_key = ?
                 AND ps.store_id = ?
                 AND p.product_norm_key != source.product_norm_key
               ORDER BY ps.price_won ASC
               LIMIT 1""",
            (product["product_norm_key"], store_id),
        )
        alt = await rows.fetchone()
        if not alt:
            # 2) 같은 카테고리 내에서 이름 토큰 일부가 겹치는 경우만 제한적으로 허용
            name = str(product.get("normalized_name") or "")
            token = name[:2] if len(name) >= 2 else name
            if not token:
                return None
            rows = await self._db.execute(
                """SELECT p.normalized_name, p.brand, p.size_display, ps.price_won
                   FROM product_norm source
                   JOIN product_norm p ON p.category = source.category
                   JOIN offline_price_snapshot ps ON p.product_norm_key = ps.product_norm_key
                   WHERE source.product_norm_key = ?
                     AND p.category = source.category
                     AND ps.store_id = ?
                     AND p.normalized_name LIKE ?
                     AND p.product_norm_key != source.product_norm_key
                   ORDER BY ps.price_won ASC
                   LIMIT 1""",
                (product["product_norm_key"], store_id, f"%{token}%"),
            )
            alt = await rows.fetchone()
        if alt:
            alt_dict = dict(alt)
            return ItemAlternative(
                item_name=alt_dict["normalized_name"],
                brand=alt_dict.get("brand"),
                unit_price_won=alt_dict["price_won"],
                tag="AI추천",
            )
        return None

    def _build_plan(
        self,
        plan_type: PlanType,
        score: StoreScore,
        weather_note: Optional[str],
        assumptions: list[PlanAssumption],
    ) -> OfflinePlan:
        """StoreScore → OfflinePlan 변환."""
        reasons = {
            PlanType.LOWEST: f"전체 장바구니 기준 최저가입니다. 총 {score.total_price_won:,}원, {score.coverage_ratio:.0%} 커버리지.",
            PlanType.NEAREST: f"가장 가까운 매장입니다. 도보 {score.travel_minutes}분, {score.distance_km}km.",
            PlanType.BALANCED: f"가격과 거리의 균형이 좋습니다. {score.total_price_won:,}원, {score.travel_minutes}분.",
        }

        return OfflinePlan(
            plan_type=plan_type,
            store_id=score.store_id,
            store_name=score.store_name,
            store_address=score.store_address,
            total_price_won=score.total_price_won,
            coverage_ratio=score.coverage_ratio,
            recommendation_reason=reasons.get(plan_type, ""),
            matched_items=score.matched_items,
            missing_items=score.missing_items,
            assumptions=assumptions,
            travel_minutes=score.travel_minutes,
            distance_km=score.distance_km,
            weather_note=weather_note,
            price_source=score.price_source,
            price_observed_at=datetime.fromisoformat(score.price_observed_at),
            price_notice="조사 시점 기준, 현장 가격과 차이 가능",
        )

    async def _log_execution(
        self, request_id: str, item_count: int, candidate_count: int,
        filtered_count: int, plan_types: list[str], latency_ms: int, degraded: bool,
    ) -> None:
        """실행 로그 저장."""
        try:
            await self._db.execute(
                """INSERT INTO offline_plan_execution_log
                   (execution_id, request_id, item_count, candidate_store_count,
                    filtered_store_count, selected_plan_types, latency_ms, degraded, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (str(uuid.uuid4()), request_id, item_count, candidate_count,
                 filtered_count, ",".join(plan_types), latency_ms,
                 int(degraded), datetime.now(timezone.utc).isoformat()),
            )
            await self._db.commit()
        except Exception as e:
            logger.warning("실행 로그 저장 실패: %s", e)
