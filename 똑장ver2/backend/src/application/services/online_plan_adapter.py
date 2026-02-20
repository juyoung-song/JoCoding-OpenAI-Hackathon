"""네이버 쇼핑 기반 온라인 플랜 어댑터."""
from __future__ import annotations

import asyncio
import statistics
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from src.domain.models.basket import Basket, BasketItem
from src.domain.models.plan import MissingPlanItem, Plan, PlanAlternative, PlanItem, PlanType
from src.infrastructure.providers.naver_shopping import (
    CART_LINKS,
    MALL_ALIASES,
    MALL_DISPLAY_NAMES,
    NaverShoppingProvider,
    TARGET_MALL_KEYS,
)

REQUIRED_MALL_KEYWORDS = ["이마트", "홈플러스", "컬리", "쿠팡"]

MALL_DELIVERY_POLICY: dict[str, dict[str, int]] = {
    "emart": {"eta_minutes": 180, "delivery_fee": 3000},
    "homeplus": {"eta_minutes": 210, "delivery_fee": 2500},
    "kurly": {"eta_minutes": 150, "delivery_fee": 0},
    "coupang": {"eta_minutes": 90, "delivery_fee": 0},
}

ONLINE_PRICE_NOTICE = "네이버 쇼핑 검색 기준이며, 결제 시점 실제 가격/재고와 차이가 날 수 있어요."
MIN_REASONABLE_UNIT_PRICE = 100
MAX_REASONABLE_UNIT_PRICE = 300000
OUTLIER_LOWER_RATIO = 0.45
OUTLIER_UPPER_RATIO = 2.2


@dataclass
class OnlineCandidateBuildResult:
    candidates: list[Plan]
    degraded_providers: list[str]


class OnlinePlanAdapter:
    """네이버 쇼핑 결과를 몰 단위 Top 후보로 묶는다."""

    def __init__(self, provider: NaverShoppingProvider):
        self._provider = provider

    async def build_candidates(
        self,
        basket: Basket,
        preferred_brands: Optional[list[str]] = None,
        disliked_brands: Optional[list[str]] = None,
    ) -> OnlineCandidateBuildResult:
        if not basket.items:
            return OnlineCandidateBuildResult(candidates=[], degraded_providers=[])

        degraded_providers: list[str] = []
        search_cache: dict[str, list[PlanItem]] = {}
        unique_items: dict[str, BasketItem] = {}
        for item in basket.items:
            cache_key = self._basket_item_key(item)
            unique_items.setdefault(cache_key, item)

        async def _search(
            cache_key: str,
            basket_item: BasketItem,
        ) -> tuple[str, list[PlanItem], bool]:
            try:
                products = await self._provider.search_products(
                    basket_item,
                    max_results=80,
                    required_keywords=REQUIRED_MALL_KEYWORDS,
                )
                return cache_key, products, False
            except Exception:
                return cache_key, [], True

        search_results = await asyncio.gather(
            *(_search(cache_key, item) for cache_key, item in unique_items.items())
        )

        for cache_key, products, failed in search_results:
            search_cache[cache_key] = products
            if failed and "shopping" not in degraded_providers:
                degraded_providers.append("shopping")

        candidates: list[Plan] = []
        for mall_key in TARGET_MALL_KEYS:
            plan = self._create_mall_plan(
                mall_key,
                basket.items,
                search_cache,
                preferred_brands=preferred_brands or [],
                disliked_brands=disliked_brands or [],
            )
            if plan and plan.coverage > 0:
                candidates.append(plan)

        return OnlineCandidateBuildResult(
            candidates=candidates,
            degraded_providers=degraded_providers,
        )

    def _create_mall_plan(
        self,
        mall_key: str,
        items: list[BasketItem],
        search_cache: dict[str, list[PlanItem]],
        preferred_brands: list[str],
        disliked_brands: list[str],
    ) -> Plan | None:
        aliases = MALL_ALIASES.get(mall_key, [])
        mall_name = MALL_DISPLAY_NAMES.get(mall_key, mall_key)
        policy = MALL_DELIVERY_POLICY.get(mall_key, {"eta_minutes": 180, "delivery_fee": 3000})

        selected_items: list[PlanItem] = []
        missing_items: list[MissingPlanItem] = []
        mall_links: list[str] = []

        preferred_set = {self._normalize_text(value) for value in preferred_brands if value}
        disliked_set = {self._normalize_text(value) for value in disliked_brands if value}
        preferred_hits = 0
        disliked_hits = 0

        for basket_item in items:
            item_key = self._basket_item_key(basket_item)
            candidates = search_cache.get(item_key, [])
            filtered_candidates = self._filter_price_outliers(basket_item, candidates)
            mall_candidates = [
                candidate
                for candidate in filtered_candidates
                if self._matches_mall(candidate.store_name, aliases)
            ]
            if mall_candidates:
                mall_candidates.sort(key=lambda row: row.price)
                best = mall_candidates[0]
                selected_items.append(
                    PlanItem(
                        item_name=basket_item.item_name,
                        brand=best.brand or basket_item.brand,
                        size=basket_item.size or best.size,
                        quantity=basket_item.quantity,
                        price=best.price,
                        store_name=mall_name,
                        url=best.url,
                        is_sold_out=False,
                    )
                )
                if best.url:
                    mall_links.append(best.url)
                normalized_brand = self._normalize_text(best.brand or basket_item.brand)
                if normalized_brand and normalized_brand in preferred_set:
                    preferred_hits += 1
                if normalized_brand and normalized_brand in disliked_set:
                    disliked_hits += 1
                continue

            alternative = self._pick_alternative(basket_item, filtered_candidates)
            missing_items.append(
                MissingPlanItem(
                    item_name=basket_item.item_name,
                    requested_brand=basket_item.brand,
                    requested_size=basket_item.size,
                    reason="판매처 없음",
                    alternative=alternative,
                )
            )

        if not selected_items:
            return None

        items_total = sum(item.price for item in selected_items)
        delivery_fee = int(policy["delivery_fee"])
        eta_minutes = int(policy["eta_minutes"])
        total_items = len(items)
        coverage = len(selected_items)
        observed_at = datetime.now(timezone.utc).isoformat()
        unique_links = self._unique_values(mall_links)

        badges: list[str] = [f"{mall_name} 온라인"]
        if preferred_hits > 0:
            badges.append(f"선호브랜드 {preferred_hits}개 반영")
        if disliked_hits > 0:
            badges.append(f"비선호브랜드 {disliked_hits}개 포함")

        return Plan(
            plan_type=PlanType.CHEAPEST,
            mart_name=mall_name,
            mart_icon=self._mall_icon(mall_name),
            items=selected_items,
            estimated_total=items_total + delivery_fee,
            coverage=coverage,
            total_basket_items=total_items,
            coverage_ratio=coverage / total_items if total_items else 0.0,
            distance_km=None,
            travel_minutes=eta_minutes,
            delivery_info=f"배송 약 {eta_minutes}분 · 배송비 {delivery_fee:,}원",
            badges=badges,
            missing_items=missing_items,
            explanation="",
            cart_url=CART_LINKS.get(mall_key),
            price_source="naver_shopping",
            price_observed_at=observed_at,
            price_notice=ONLINE_PRICE_NOTICE,
            data_source="online_naver_shopping",
            mall_product_links=unique_links,
            direct_cart_supported=False,
            expected_delivery_hours=max(1, round(eta_minutes / 60)),
        )

    def _pick_alternative(self, basket_item: BasketItem, candidates: list[PlanItem]) -> PlanAlternative | None:
        if not candidates:
            return None
        best = sorted(candidates, key=lambda row: row.price)[0]
        quantity = max(1, basket_item.quantity)
        unit_price = max(1, round(best.price / quantity))
        return PlanAlternative(
            item_name=best.item_name,
            brand=best.brand,
            size=best.size,
            unit_price=unit_price,
            reason="타 온라인몰 대체품",
        )

    def _basket_item_key(self, item: BasketItem) -> str:
        return "|".join(
            [
                self._normalize_text(item.item_name),
                self._normalize_text(item.brand),
                self._normalize_text(item.size),
                str(item.quantity),
            ]
        )

    def _matches_mall(self, store_name: str, aliases: list[str]) -> bool:
        normalized = self._normalize_text(store_name)
        for alias in aliases:
            if self._normalize_text(alias) in normalized:
                return True
        return False

    def _mall_icon(self, mall_name: str) -> str:
        if "이마트" in mall_name or "SSG" in mall_name:
            return "🏪"
        if "홈플러스" in mall_name:
            return "🏬"
        if "컬리" in mall_name:
            return "🥬"
        if "쿠팡" in mall_name:
            return "🚀"
        return "🛒"

    def _normalize_text(self, value: str | None) -> str:
        return (value or "").replace(" ", "").lower()

    def _unique_values(self, values: list[str]) -> list[str]:
        seen: set[str] = set()
        deduped: list[str] = []
        for value in values:
            if value in seen:
                continue
            seen.add(value)
            deduped.append(value)
        return deduped

    def _unit_price(self, candidate: PlanItem, quantity: int) -> float:
        qty = max(1, quantity)
        return float(candidate.price) / qty

    def _filter_price_outliers(self, basket_item: BasketItem, candidates: list[PlanItem]) -> list[PlanItem]:
        if not candidates:
            return []

        in_range = [
            candidate
            for candidate in candidates
            if MIN_REASONABLE_UNIT_PRICE
            <= self._unit_price(candidate, basket_item.quantity)
            <= MAX_REASONABLE_UNIT_PRICE
        ]
        if not in_range:
            return candidates

        unit_prices = [self._unit_price(candidate, basket_item.quantity) for candidate in in_range]
        if len(unit_prices) < 3:
            return in_range

        median_price = float(statistics.median(unit_prices))
        lower_bound = max(MIN_REASONABLE_UNIT_PRICE, median_price * OUTLIER_LOWER_RATIO)
        upper_bound = min(MAX_REASONABLE_UNIT_PRICE, median_price * OUTLIER_UPPER_RATIO)

        filtered = [
            candidate
            for candidate in in_range
            if lower_bound <= self._unit_price(candidate, basket_item.quantity) <= upper_bound
        ]
        if filtered:
            return filtered

        closest = min(
            in_range,
            key=lambda candidate: abs(self._unit_price(candidate, basket_item.quantity) - median_price),
        )
        return [closest]
