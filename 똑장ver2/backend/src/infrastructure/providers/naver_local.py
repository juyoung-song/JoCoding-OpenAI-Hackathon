"""네이버 Local 검색 API Provider — MVP stub."""
from __future__ import annotations

import logging
from typing import Dict, List

from src.infrastructure.providers.base import PlaceProvider

logger = logging.getLogger(__name__)


class NaverLocalProvider(PlaceProvider):
    """네이버 Local 검색 API.

    MVP: 기본 마트 목록 반환.
    실제 구현 시 Haversine 후처리 필수 (좌표 미지원 주의).
    """

    async def search_nearby_stores(
        self,
        lat: float,
        lng: float,
        keyword: str = "마트",
        radius_km: float = 3.0,
    ) -> List[Dict]:
        logger.info("NaverLocalProvider 호출: lat=%.4f, lng=%.4f, keyword=%s", lat, lng, keyword)

        # TODO: 실제 네이버 Local API 호출 구현
        return [
            {"name": "이마트 역삼점", "lat": lat + 0.005, "lng": lng + 0.003, "category": "대형마트"},
            {"name": "홈플러스 강남점", "lat": lat - 0.003, "lng": lng - 0.005, "category": "대형마트"},
            {"name": "롯데마트 강남점", "lat": lat + 0.008, "lng": lng - 0.002, "category": "대형마트"},
        ]
