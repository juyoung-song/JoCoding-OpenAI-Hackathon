"""DB 기반 오프라인 플랜 어댑터.

`ver2` API 계약(PlanResponse)을 유지하면서,
루트 backend 오프라인 데이터/매칭 로직을 단계 이식하기 위한 서비스.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import aiosqlite

from src.application.services.geo import haversine_km
from src.application.services.product_matcher_db import MatchResult, ProductMatcherDB
from src.domain.models.basket import Basket
from src.domain.models.plan import (
    MissingPlanItem,
    Plan,
    PlanAlternative,
    PlanItem,
    PlanType,
)


DEFAULT_USER_LAT = 37.4985
DEFAULT_USER_LNG = 127.0292
DEFAULT_TRAVEL_MODE = "walk"
DEFAULT_MAX_TRAVEL_MINUTES = 30


@dataclass
class RouteInfo:
    distance_km: float
    travel_minutes: int


@dataclass
class CandidateBuildResult:
    candidates: list[Plan]
    degraded_providers: list[str]
    candidate_store_count: int
    filtered_store_count: int


class OfflinePlanAdapter:
    """DB 스냅샷 기반 후보 플랜 생성기."""

    def __init__(self, db: aiosqlite.Connection):
        self._db = db
        self._matcher = ProductMatcherDB(db)

    async def build_candidates(
        self,
        basket: Basket,
        mode: str = "offline",
        lat: float = DEFAULT_USER_LAT,
        lng: float = DEFAULT_USER_LNG,
        travel_mode: str = DEFAULT_TRAVEL_MODE,
        max_travel_minutes: int = DEFAULT_MAX_TRAVEL_MINUTES,
        place_provider: object | None = None,
        routing_provider: object | None = None,
        preferred_brands: Optional[list[str]] = None,
        disliked_brands: Optional[list[str]] = None,
    ) -> CandidateBuildResult:
        if not basket.items:
            return CandidateBuildResult(
                candidates=[],
                degraded_providers=[],
                candidate_store_count=0,
                filtered_store_count=0,
            )

        matched_items = await self._match_basket_items(
            basket,
            preferred_brands=preferred_brands,
            disliked_brands=disliked_brands,
        )
        if not matched_items:
            return CandidateBuildResult(
                candidates=[],
                degraded_providers=[],
                candidate_store_count=0,
                filtered_store_count=0,
            )

        radius_km = self._estimate_radius(max_travel_minutes, travel_mode)
        stores, place_degraded = await self._find_candidate_stores(
            lat, lng, radius_km=radius_km, limit=30, place_provider=place_provider
        )
        if not stores:
            return CandidateBuildResult(
                candidates=[],
                degraded_providers=["place"] if place_degraded else [],
                candidate_store_count=0,
                filtered_store_count=0,
            )

        degraded: list[str] = []
        if place_degraded:
            degraded.append("place")

        store_routes: list[tuple[dict, RouteInfo]] = []
        all_routes: list[tuple[dict, RouteInfo]] = []
        routing_degraded = False
        for store in stores:
            route, route_degraded = await self._estimate_route(
                lat,
                lng,
                float(store["lat"]),
                float(store["lng"]),
                travel_mode=travel_mode,
                routing_provider=routing_provider,
            )
            all_routes.append((store, route))
            if route_degraded:
                routing_degraded = True
            if mode != "offline" or route.travel_minutes <= max_travel_minutes:
                store_routes.append((store, route))

        if not store_routes and all_routes:
            # 이동시간 필터에 걸려도 가까운 후보를 제한적으로 노출
            store_routes = sorted(all_routes, key=lambda sr: sr[1].travel_minutes)[:3]
            if "place" not in degraded:
                degraded.append("place")

        if routing_degraded and "routing" not in degraded:
            degraded.append("routing")

        candidates: list[Plan] = []
        for store, route in store_routes:
            plan = await self._build_store_plan(
                store,
                route,
                basket,
                matched_items,
                mode,
                travel_mode,
                preferred_brands=preferred_brands,
                disliked_brands=disliked_brands,
            )
            if plan:
                candidates.append(plan)

        return CandidateBuildResult(
            candidates=candidates,
            degraded_providers=degraded,
            candidate_store_count=len(stores),
            filtered_store_count=len(store_routes),
        )

    async def _match_basket_items(
        self,
        basket: Basket,
        preferred_brands: Optional[list[str]] = None,
        disliked_brands: Optional[list[str]] = None,
    ) -> list[tuple[int, MatchResult]]:
        result: list[tuple[int, MatchResult]] = []
        for idx, item in enumerate(basket.items):
            matched = await self._matcher.match(
                item,
                preferred_brands=preferred_brands,
                disliked_brands=disliked_brands,
            )
            if matched:
                result.append((idx, matched))
        return result

    async def _find_candidate_stores(
        self,
        lat: float,
        lng: float,
        radius_km: float,
        limit: int,
        place_provider: object | None = None,
    ) -> tuple[list[dict], bool]:
        lat_range = radius_km / 111.0
        lng_range = radius_km / 88.0
        rows = await self._db.execute(
            """SELECT * FROM store_master
               WHERE is_active = 1
                 AND lat BETWEEN ? AND ?
                 AND lng BETWEEN ? AND ?
               ORDER BY updated_at DESC
               LIMIT ?""",
            (lat - lat_range, lat + lat_range, lng - lng_range, lng + lng_range, limit),
        )
        db_stores = [dict(row) for row in await rows.fetchall()]

        if not db_stores:
            fallback = await self._find_fallback_stores(limit)
            if fallback:
                return fallback, True
            return [], True

        if not place_provider:
            return db_stores, False

        try:
            place_stores = await place_provider.search_nearby_stores(
                lat=lat, lng=lng, keyword="마트", radius_km=radius_km
            )
            narrowed = self._filter_db_stores_by_place(db_stores, place_stores)
            if narrowed:
                return narrowed, False
            return db_stores, True
        except Exception:
            return db_stores, True

    async def _build_store_plan(
        self,
        store: dict,
        route: RouteInfo,
        basket: Basket,
        matched_items: list[tuple[int, MatchResult]],
        mode: str,
        travel_mode: str,
        preferred_brands: Optional[list[str]] = None,
        disliked_brands: Optional[list[str]] = None,
    ) -> Optional[Plan]:
        product_keys = [m.product_norm_key for _, m in matched_items]
        snapshots = await self._find_latest_snapshots(store["store_id"], product_keys)
        if not snapshots:
            return None

        plan_items: list[PlanItem] = []
        missing_items: list[MissingPlanItem] = []
        preference_hit_count = 0
        dislike_hit_count = 0
        preferred_brand_set = {self._normalize_text(value) for value in (preferred_brands or []) if value}
        disliked_brand_set = {self._normalize_text(value) for value in (disliked_brands or []) if value}

        for basket_idx, matched in matched_items:
            snap = snapshots.get(matched.product_norm_key)
            if not snap:
                basket_item = basket.items[basket_idx]
                alternative = await self._find_alternative_for_missing(store["store_id"], matched)
                missing_items.append(
                    MissingPlanItem(
                        item_name=basket_item.item_name,
                        requested_brand=basket_item.brand,
                        requested_size=basket_item.size or matched.size_display,
                        reason="판매처 없음",
                        alternative=alternative,
                    )
                )
                continue

            basket_item = basket.items[basket_idx]
            quantity = basket_item.quantity
            unit_price = int(snap["price_won"])
            subtotal = unit_price * quantity
            normalized_size = (
                basket_item.size
                or matched.size_display
                or self._normalize_size_display(snap.get("product_norm_key"), basket_item.item_name)
            )

            plan_items.append(
                PlanItem(
                    item_name=basket_item.item_name,
                    brand=basket_item.brand or matched.brand,
                    size=normalized_size,
                    quantity=quantity,
                    price=subtotal,
                    store_name=store["store_name"],
                    is_sold_out=False,
                )
            )
            resolved_brand = self._normalize_text(basket_item.brand or matched.brand)
            if resolved_brand and resolved_brand in preferred_brand_set:
                preference_hit_count += 1
            if resolved_brand and resolved_brand in disliked_brand_set:
                dislike_hit_count += 1

        if not plan_items:
            return None

        coverage = len(plan_items)
        total_items = len(basket.items)
        base_total = sum(item.price for item in plan_items)
        observed_at = self._resolve_latest_observed_at(snapshots)
        price_source = self._resolve_price_source(snapshots)
        price_notice = self._resolve_price_notice(snapshots)

        if mode == "online":
            delivery_fee = self._estimate_delivery_fee(route.distance_km)
            estimated_total = base_total + delivery_fee
            distance_km = None
            travel_minutes = self._estimate_online_eta(route.distance_km)
            delivery_info = f"배송 약 {travel_minutes}분 · 배송비 {delivery_fee:,}원"
            expected_delivery_hours = max(1, round(travel_minutes / 60))
            data_source = "offline_snapshot_online_estimate"
        else:
            estimated_total = base_total
            distance_km = route.distance_km
            travel_minutes = route.travel_minutes
            delivery_info = f"약 {distance_km:.1f}km · {self._travel_mode_label(travel_mode)} {travel_minutes}분"
            expected_delivery_hours = None
            data_source = "offline_snapshot"

        badges = self._build_preference_badges(preference_hit_count, dislike_hit_count)

        return Plan(
            plan_type=PlanType.CHEAPEST,
            mart_name=store["store_name"],
            mart_icon=self._pick_mart_icon(store["store_name"]),
            items=plan_items,
            estimated_total=estimated_total,
            coverage=coverage,
            total_basket_items=total_items,
            coverage_ratio=coverage / total_items if total_items else 0.0,
            distance_km=distance_km,
            travel_minutes=travel_minutes,
            delivery_info=delivery_info,
            badges=badges,
            missing_items=missing_items,
            explanation="",
            cart_url=None,
            price_source=price_source,
            price_observed_at=observed_at,
            price_notice=price_notice,
            data_source=data_source,
            mall_product_links=[],
            direct_cart_supported=False,
            expected_delivery_hours=expected_delivery_hours,
        )

    async def _find_latest_snapshots(self, store_id: str, product_keys: list[str]) -> dict[str, dict]:
        if not product_keys:
            return {}
        placeholders = ",".join("?" for _ in product_keys)
        rows = await self._db.execute(
            f"""SELECT * FROM offline_price_snapshot
                WHERE store_id = ? AND product_norm_key IN ({placeholders})
                ORDER BY observed_at DESC""",
            [store_id, *product_keys],
        )
        latest: dict[str, dict] = {}
        for row in await rows.fetchall():
            row_dict = dict(row)
            key = row_dict["product_norm_key"]
            if key not in latest:
                latest[key] = row_dict
        return latest

    async def _find_alternative_for_missing(
        self,
        store_id: str,
        matched: MatchResult,
    ) -> Optional[PlanAlternative]:
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
            (matched.product_norm_key, store_id),
        )
        alternative = await rows.fetchone()

        if not alternative and matched.category:
            token = str(matched.normalized_name or "")[:2]
            if token:
                rows = await self._db.execute(
                    """SELECT p.normalized_name, p.brand, p.size_display, ps.price_won
                       FROM product_norm source
                       JOIN product_norm p ON p.category = source.category
                       JOIN offline_price_snapshot ps ON p.product_norm_key = ps.product_norm_key
                       WHERE source.product_norm_key = ?
                         AND source.category = ?
                         AND p.category = source.category
                         AND p.normalized_name LIKE ?
                         AND ps.store_id = ?
                         AND p.product_norm_key != source.product_norm_key
                       ORDER BY ps.price_won ASC
                       LIMIT 1""",
                    (matched.product_norm_key, matched.category, f"%{token}%", store_id),
                )
                alternative = await rows.fetchone()

        if not alternative:
            return None

        row = dict(alternative)
        return PlanAlternative(
            item_name=row.get("normalized_name") or matched.normalized_name,
            brand=row.get("brand"),
            size=row.get("size_display"),
            unit_price=int(row.get("price_won", 0)),
            reason="동일 카테고리 대체품",
        )

    async def _estimate_route(
        self,
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float,
        travel_mode: str,
        routing_provider: object | None = None,
    ) -> tuple[RouteInfo, bool]:
        distance = haversine_km(origin_lat, origin_lng, dest_lat, dest_lng)
        if routing_provider:
            try:
                route = await routing_provider.estimate_route(
                    {"lat": origin_lat, "lng": origin_lng},
                    {"lat": dest_lat, "lng": dest_lng},
                    travel_mode,
                )
                provider_distance = route.get("distance_km")
                if isinstance(provider_distance, (float, int)):
                    distance = float(provider_distance)
                provider_minutes = route.get("duration_min", route.get("travel_minutes"))
                if isinstance(provider_minutes, (float, int)):
                    return (
                        RouteInfo(
                            distance_km=round(distance, 1),
                            travel_minutes=max(1, int(round(float(provider_minutes)))),
                        ),
                        False,
                    )
            except Exception:
                pass

        return (
            RouteInfo(
                distance_km=round(distance, 1),
                travel_minutes=self._estimate_offline_minutes(distance, travel_mode),
            ),
            True,
        )

    def _estimate_online_eta(self, distance_km: float) -> int:
        # 픽업/패킹 포함 최소 90분 + 거리 가중
        return max(90, round(90 + distance_km * 25))

    def _estimate_delivery_fee(self, distance_km: float) -> int:
        if distance_km <= 2.0:
            return 2000
        if distance_km <= 4.0:
            return 3000
        return 4000

    def _normalize_size_display(self, product_norm_key: Optional[str], fallback_name: str) -> Optional[str]:
        if not product_norm_key:
            return None
        parts = str(product_norm_key).split("|")
        if len(parts) >= 3:
            size = parts[-1]
            return size
        if "참이슬" in fallback_name:
            return "360ml"
        if "비타500" in fallback_name.replace(" ", ""):
            return "100ml"
        return None

    async def _find_fallback_stores(self, limit: int = 30) -> list[dict]:
        rows = await self._db.execute(
            """SELECT * FROM store_master
               WHERE is_active = 1
               ORDER BY updated_at DESC, store_name ASC
               LIMIT ?""",
            (limit,),
        )
        return [dict(row) for row in await rows.fetchall()]

    def _filter_db_stores_by_place(self, db_stores: list[dict], place_stores: list[dict]) -> list[dict]:
        if not place_stores:
            return []

        def norm(value: str) -> str:
            return (value or "").replace(" ", "").replace("점", "")

        place_names = [norm(str(store.get("name", ""))) for store in place_stores]
        matched: list[dict] = []
        for store in db_stores:
            db_name = norm(str(store.get("store_name", "")))
            if any(db_name and (db_name in place_name or place_name in db_name) for place_name in place_names):
                matched.append(store)

        if matched:
            return matched

        # 이름 매칭 실패 시 좌표 근접 기준으로 제한적으로 매칭
        for store in db_stores:
            try:
                db_lat = float(store["lat"])
                db_lng = float(store["lng"])
            except Exception:
                continue

            for place in place_stores:
                try:
                    place_lat = float(place.get("lat"))
                    place_lng = float(place.get("lng"))
                except Exception:
                    continue
                if haversine_km(db_lat, db_lng, place_lat, place_lng) <= 1.2:
                    matched.append(store)
                    break

        return matched

    def _estimate_radius(self, max_minutes: int, travel_mode: str) -> float:
        normalized_mode = travel_mode.lower()
        if normalized_mode == "walk":
            return max_minutes * 4 / 60 * 1.5
        if normalized_mode == "transit":
            return max_minutes * 15 / 60 * 1.5
        return max_minutes * 30 / 60 * 1.5

    def _estimate_offline_minutes(self, distance_km: float, travel_mode: str) -> int:
        normalized_mode = travel_mode.lower()
        if normalized_mode == "walk":
            # 평균 도보 속도(약 5km/h) 기준: 1km ≈ 12분
            minutes = round(distance_km * 12)
        elif normalized_mode == "transit":
            # 대중교통 평균 15km/h + 대기시간 포함 근사
            minutes = round(distance_km * 4)
        else:
            minutes = max(1, round(distance_km / 0.5))
        return max(1, int(minutes))

    def _travel_mode_label(self, travel_mode: str) -> str:
        normalized_mode = travel_mode.lower()
        if normalized_mode == "transit":
            return "대중교통"
        if normalized_mode == "car":
            return "자차"
        return "도보"

    def _normalize_text(self, value: Optional[str]) -> str:
        return (value or "").replace(" ", "").lower()

    def _resolve_latest_observed_at(self, snapshots: dict[str, dict]) -> str | None:
        observed = [
            str(row.get("observed_at"))
            for row in snapshots.values()
            if row.get("observed_at")
        ]
        if not observed:
            return None
        return max(observed)

    def _resolve_price_source(self, snapshots: dict[str, dict]) -> str:
        for row in snapshots.values():
            source = row.get("source")
            if source:
                return str(source)
        return "offline_db"

    def _resolve_price_notice(self, snapshots: dict[str, dict]) -> str:
        for row in snapshots.values():
            notice = row.get("notice")
            if notice:
                return str(notice)
        return "DB 스냅샷 기준이며, 현장 가격과 차이가 날 수 있어요."

    def _build_preference_badges(self, preferred_hits: int, disliked_hits: int) -> list[str]:
        badges: list[str] = []
        if preferred_hits > 0:
            badges.append(f"선호브랜드 {preferred_hits}개 반영")
        if disliked_hits > 0:
            badges.append(f"비선호브랜드 {disliked_hits}개 포함")
        return badges

    def _pick_mart_icon(self, store_name: str) -> str:
        if "이마트" in store_name:
            return "🏪"
        if "홈플러스" in store_name:
            return "🏢"
        if "롯데" in store_name:
            return "🏬"
        if "코스트코" in store_name:
            return "🏭"
        return "🛒"
