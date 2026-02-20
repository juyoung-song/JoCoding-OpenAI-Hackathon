"""네이버쇼핑 API Provider — Hybrid Search Strategy."""
from __future__ import annotations
import asyncio
import logging
import re
import time
import httpx

from src.core.config import settings
from src.domain.models.basket import BasketItem, ItemMode
from src.domain.models.plan import PlanItem
from src.infrastructure.providers.base import OnlinePriceProvider

# 식품 카테고리 판별 키워드
FOOD_CATEGORIES = {"식품", "음료", "과일", "채소", "축산", "수산", "유제품", "알류", "신선식품"}

# 검색 품질 향상 — 품목별 최적 검색어
QUERY_OVERRIDES: dict[str, str] = {
    "계란": "달걀 특란 30개입",
    "달걀": "달걀 특란 30개입",
}

# 규격 정규화
SIZE_NORMALIZATION: dict[str, str] = {
    "30구": "30개입",
    "15구": "15개입",
    "10구": "10개입",
}

# 대형마트/주요 몰 화이트리스트
TARGET_MALLS = {
    "이마트", "이마트몰", "트레이더스", "신세계몰", "SSG",
    "홈플러스", "Homeplus",
    "롯데마트", "롯데ON",
    "쿠팡", "마켓컬리", "컬리",
    "농협몰", "GS프레시몰",
}

# 몰 별칭 정규화
MALL_ALIASES: dict[str, list[str]] = {
    "emart":    ["이마트", "이마트몰", "SSG", "SSG.COM", "신세계몰", "트레이더스", "노브랜드"],
    "homeplus": ["홈플러스", "Homeplus", "Homeplus Special"],
    "kurly":    ["컬리", "마켓컬리", "Kurly", "뷰티컬리"],
    "coupang":  ["쿠팡", "Coupang", "쿠팡로켓"],
    "lotte":    ["롯데마트", "롯데ON", "롯데온"],
}

# 몰별 장바구니 딥링크
CART_LINKS: dict[str, str] = {
    "emart":    "https://m.ssg.com/cart/dcart.ssg",
    "homeplus": "https://front.homeplus.co.kr/cart",
    "kurly":    "https://www.kurly.com/cart",
    "coupang":  "https://mc.coupang.com/",
    "lotte":    "https://www.lotteon.com/display/ec/m/cart/cartList",
}

TARGET_MALL_KEYS = ["emart", "homeplus", "kurly", "coupang"]

MALL_DISPLAY_NAMES = {
    "emart":    "이마트몰 (SSG)",
    "homeplus": "홈플러스",
    "kurly":    "마켓컬리",
    "coupang":  "쿠팡",
    "lotte":    "롯데마트",
}

MALL_ICONS = {
    "이마트": "🏪", "홈플러스": "🏬", "마켓컬리": "🥬",
    "쿠팡": "🚀", "롯데마트": "🔴", "SSG": "🟡",
}

logger = logging.getLogger(__name__)


class NaverShoppingProvider(OnlinePriceProvider):
    """네이버 쇼핑 검색 API — Hybrid Search Strategy."""

    BASE_URL = "https://openapi.naver.com/v1/search/shop.json"

    def __init__(self) -> None:
        self._timeout_seconds = max(1.0, float(settings.naver_shopping_timeout_seconds))
        self._max_retries = max(0, int(settings.naver_shopping_max_retries))
        self._retry_backoff_seconds = max(0.05, float(settings.naver_shopping_retry_backoff_seconds))
        self._cache_ttl_seconds = max(1, int(settings.naver_shopping_cache_ttl_seconds))
        self._circuit_failure_threshold = max(1, int(settings.naver_shopping_circuit_failure_threshold))
        self._circuit_cooldown_seconds = max(1, int(settings.naver_shopping_circuit_cooldown_seconds))

        self._response_cache: dict[str, tuple[float, list[PlanItem]]] = {}
        self._failure_count = 0
        self._circuit_open_until = 0.0
        self._state_lock = asyncio.Lock()

    def _build_query(self, item: BasketItem) -> str:
        size = SIZE_NORMALIZATION.get(item.size or "", item.size)
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
        return re.sub(r"<[^>]+>", "", text)

    @staticmethod
    def _is_food_item(raw_item: dict) -> bool:
        all_cats = f"{raw_item.get('category1','')} {raw_item.get('category2','')} {raw_item.get('category3','')}"
        for food_cat in FOOD_CATEGORIES:
            if food_cat in all_cats:
                return True
        non_food = {"보관", "밀폐", "케이스", "방음", "기독교", "반려", "사료", "주방용품", "수납"}
        for nf in non_food:
            if nf in all_cats:
                return False
        return True

    def _credentials_available(self) -> bool:
        return (
            bool(settings.naver_client_id)
            and bool(settings.naver_client_secret)
            and "__SET_IN_SECRET_MANAGER__" not in settings.naver_client_id
            and "__SET_IN_SECRET_MANAGER__" not in settings.naver_client_secret
        )

    async def _read_cache(self, cache_key: str) -> list[PlanItem] | None:
        now = time.monotonic()
        async with self._state_lock:
            cached = self._response_cache.get(cache_key)
            if not cached:
                return None
            expires_at, rows = cached
            if expires_at <= now:
                self._response_cache.pop(cache_key, None)
                return None
            return [item.model_copy(deep=True) for item in rows]

    async def _write_cache(self, cache_key: str, rows: list[PlanItem]) -> None:
        expires_at = time.monotonic() + self._cache_ttl_seconds
        cloned = [item.model_copy(deep=True) for item in rows]
        async with self._state_lock:
            self._response_cache[cache_key] = (expires_at, cloned)

    async def _is_circuit_open(self) -> bool:
        now = time.monotonic()
        async with self._state_lock:
            return self._circuit_open_until > now

    async def _register_success(self) -> None:
        async with self._state_lock:
            self._failure_count = 0
            self._circuit_open_until = 0.0

    async def _register_failure(self) -> bool:
        now = time.monotonic()
        async with self._state_lock:
            self._failure_count += 1
            if self._failure_count >= self._circuit_failure_threshold:
                self._circuit_open_until = now + self._circuit_cooldown_seconds
                return True
        return False

    async def _request_items(self, *, headers: dict[str, str], params: dict[str, str | int]) -> list[dict]:
        if await self._is_circuit_open():
            raise RuntimeError("NAVER_SHOPPING_CIRCUIT_OPEN")

        last_error: Exception | None = None
        for attempt in range(self._max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self._timeout_seconds) as client:
                    response = await client.get(self.BASE_URL, headers=headers, params=params)
                    response.raise_for_status()
                await self._register_success()
                payload = response.json()
                return list(payload.get("items", []))
            except Exception as exc:
                last_error = exc
                opened = await self._register_failure()
                if attempt < self._max_retries:
                    await asyncio.sleep(self._retry_backoff_seconds * (2 ** attempt))
                    continue
                if opened:
                    logger.warning(
                        "[NaverShopping] circuit opened for %ss after %s failures",
                        self._circuit_cooldown_seconds,
                        self._circuit_failure_threshold,
                    )
                raise

        raise RuntimeError("NAVER_SHOPPING_REQUEST_FAILED") from last_error

    async def search_products(
        self,
        item: BasketItem,
        max_results: int = 10,
        required_keywords: list[str] | None = None,
    ) -> list[PlanItem]:
        """Hybrid Search: Phase1 광범위 + Phase2 누락 몰 타겟."""
        if not self._credentials_available():
            return []

        base_query = self._build_query(item)
        required_keywords = required_keywords or []
        keyword_key = ",".join(sorted(set(required_keywords)))
        cache_key = f"{base_query}|max:{max_results}|kw:{keyword_key}"
        cached = await self._read_cache(cache_key)
        if cached is not None:
            return cached

        headers = {
            "X-Naver-Client-Id": settings.naver_client_id,
            "X-Naver-Client-Secret": settings.naver_client_secret,
        }

        results: list[PlanItem] = []
        found_keywords: set[str] = set()
        seen_product_ids: set[str] = set()
        phase1_error: Exception | None = None

        # Phase 1: 광범위 최저가 탐색
        try:
            params = {"query": base_query, "display": 80, "sort": "asc"}
            raw_items = await self._request_items(headers=headers, params=params)
            for raw in raw_items:
                pid = raw.get("productId")
                if pid in seen_product_ids:
                    continue
                plan_item = self._parse_item(item, raw)
                if plan_item:
                    results.append(plan_item)
                    seen_product_ids.add(pid)
                    for kw in required_keywords:
                        if kw in plan_item.store_name:
                            found_keywords.add(kw)
        except Exception as e:
            phase1_error = e
            logger.warning("[NaverShopping] Phase1 실패: %s", e)

        if phase1_error is not None and not results:
            raise RuntimeError("Naver shopping phase1 failed") from phase1_error

        # Phase 2: 누락 몰 타겟 검색
        for kw in [k for k in required_keywords if k not in found_keywords]:
            try:
                params = {"query": f"{base_query} {kw}", "display": 40, "sort": "sim"}
                raw_items = await self._request_items(headers=headers, params=params)
                for raw in raw_items:
                    pid = raw.get("productId")
                    if pid in seen_product_ids:
                        continue
                    if kw not in raw.get("mallName", ""):
                        continue
                    plan_item = self._parse_item(item, raw)
                    if plan_item:
                        results.append(plan_item)
                        seen_product_ids.add(pid)
            except Exception as e:
                logger.warning("[NaverShopping] Phase2 %s 실패: %s", kw, e)

        results.sort(key=lambda x: x.price)
        bounded = results[:max_results] if max_results > 0 else results
        await self._write_cache(cache_key, bounded)
        return [item.model_copy(deep=True) for item in bounded]

    @staticmethod
    def detect_mall_key(mall_name: str) -> str | None:
        normalized = (mall_name or "").strip().lower()
        if not normalized:
            return None
        for mall_key, aliases in MALL_ALIASES.items():
            for alias in aliases:
                if alias.lower() in normalized:
                    return mall_key
        return None

    def _parse_item(self, original_item: BasketItem, raw: dict) -> PlanItem | None:
        price = int(raw.get("lprice", 0))
        if price <= 0:
            return None
        if not self._is_food_item(raw):
            return None
        mall_name = raw.get("mallName", "")
        if not any(target in mall_name for target in TARGET_MALLS):
            return None
        title = self._clean_html(raw.get("title", ""))
        return PlanItem(
            item_name=original_item.item_name,
            brand=raw.get("brand") or None,
            size=original_item.size,
            quantity=original_item.quantity,
            price=price * original_item.quantity,
            store_name=mall_name,
            url=raw.get("link"),
            is_sold_out=False,
        )
