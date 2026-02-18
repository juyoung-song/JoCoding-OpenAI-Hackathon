"""네이버 지역 검색 API Provider — 주변 마트 검색.

docs: https://developers.naver.com/docs/serviceapi/search/local/local.md
"""

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
        """HTML 태그 제거."""
        return re.sub(r"<[^>]+>", "", text)

    async def search_nearby_stores(
        self,
        lat: float,
        lng: float,
        keyword: str = "마트",
        radius_km: float = 3.0,
    ) -> list[dict]:
        """주변 마트를 검색한다.

        네이버 지역 검색 API는 좌표 기반이 아닌 키워드 기반이므로,
        사용자 주소 주변 지역명 + 마트 키워드로 검색한다.
        """
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
                    self.BASE_URL,
                    headers=headers,
                    params=params,
                    timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPError as e:
            print(f"[NaverLocal] API 호출 실패: {e}")
            return []

        stores: list[dict] = []
        for raw in data.get("items", []):
            title = self._clean_html(raw.get("title", ""))
            category = raw.get("category", "")

            stores.append({
                "name": title,
                "category": category,
                "address": raw.get("roadAddress") or raw.get("address", ""),
                "link": raw.get("link", ""),
                "telephone": raw.get("telephone", ""),
                "mapx": raw.get("mapx", ""),
                "mapy": raw.get("mapy", ""),
            })

        return stores

    async def search_nearby_marts(
        self,
        region: str = "강남",
    ) -> list[dict]:
        """특정 지역의 주요 마트를 검색한다."""
        all_stores: list[dict] = []

        for mart_keyword in self.MART_KEYWORDS[:4]:  # 주요 4개만
            query = f"{region} {mart_keyword}"
            stores = await self.search_nearby_stores(
                lat=0, lng=0, keyword=query
            )
            all_stores.extend(stores)

        return all_stores
