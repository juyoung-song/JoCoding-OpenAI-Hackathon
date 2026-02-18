"""네이버 쇼핑 API Provider — 실제 API 호출 구현.

네이버 검색 API (shop) 를 통해 상품 가격을 수집한다.
docs: https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md
"""

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
        # 규격 정규화
        size = item.size
        if size:
            size = SIZE_NORMALIZATION.get(size, size)

        # 품목별 쿼리 오버라이드 적용
        base_name = item.item_name
        override = QUERY_OVERRIDES.get(base_name)

        if item.mode == ItemMode.FIXED and item.brand:
            # 고정모드: 브랜드 + 품목 + 규격
            parts = [item.brand, base_name]
            if size:
                parts.append(size)
            return " ".join(parts)

        if override:
            return override

        # 일반 검색: 괄호 내용을 삭제하지 않고 공백으로 치환하여 무게/수량 정보 보존
        # 예: "국간장(1큰술)" -> "국간장 1큰술" (검색 정확도 향상)
        clean_name = re.sub(r"[\(\)]", " ", base_name).strip()
        # 중복 공백 제거
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

        # 식품 카테고리 포함 여부
        for food_cat in FOOD_CATEGORIES:
            if food_cat in all_cats:
                return True

        # 비식품 카테고리 명확한 경우 제외
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
        2. 필수 몰(예: 이마트, 홈플러스...)이 결과에 없다면, 해당 몰 이름으로 **타겟 검색** 수행
        """
        base_query = self._build_query(item)
        headers = {
            "X-Naver-Client-Id": settings.naver_client_id,
            "X-Naver-Client-Secret": settings.naver_client_secret,
        }
        
        results: list[PlanItem] = []
        found_keywords = set()
        seen_product_ids = set()

        # -----------------------------------------------------
        # Phase 1: General Search (광범위한 최저가 탐색)
        # -----------------------------------------------------
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
                    
                    # 키워드 발견 체크
                    if required_keywords:
                        for kw in required_keywords:
                            if kw in item_obj.source:
                                found_keywords.add(kw)

        except Exception as e:
            print(f"[NaverShopping] Primary search failed: {e}")

        # -----------------------------------------------------
        # Phase 2: Fallback Search (누락된 몰 타겟 검색)
        # -----------------------------------------------------
        if required_keywords:
            missing_kws = [k for k in required_keywords if k not in found_keywords]
            
            for kw in missing_kws:
                # 몰 이름을 포함한 구체적 쿼리 (예: "신라면 이마트")
                target_query = f"{base_query} {kw}"
                try:
                    params = { "query": target_query, "display": 40, "sort": "sim" } # 정확도순 권장
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
                        
                        # 타겟 몰이 맞는지 재확인 (검색어에 몰 이름 넣어도 엉뚱한 거 나올 수 있음)
                        mall_name = raw.get("mallName", "")
                        if kw not in mall_name: 
                            continue # 해당 몰 상품이 아니면 스킵

                        item_obj = self._parse_item(item, raw)
                        if item_obj:
                            results.append(item_obj)
                            seen_product_ids.add(pid)
                            # (Optional) Break early if we found one valid item for this mall?
                            # For better price comparison, let's keep collecting top N

                except Exception as e:
                    print(f"[NaverShopping] Fallback search failed for {kw}: {e}")

        # 가격 오름차순 정렬
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
        # Whitelist Filtering
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

