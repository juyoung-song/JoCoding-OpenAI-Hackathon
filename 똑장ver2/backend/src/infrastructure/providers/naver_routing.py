"""네이버 클라우드 Directions API Provider — MVP stub."""
from __future__ import annotations

import logging
import math
from typing import Dict

from src.infrastructure.providers.base import RoutingProvider

logger = logging.getLogger(__name__)


class NaverRoutingProvider(RoutingProvider):
    """네이버 클라우드 Directions API.

    MVP: NCP 키 필요. 미발급 시 MockRoutingProvider 사용.
    실제 구현 시 직선거리 Fallback 포함.
    """

    def __init__(self, settings=None, cache=None, db=None):
        self.settings = settings
        self.cache = cache
        self.db = db

    async def estimate_route(self, origin: Dict, destination: Dict, mode: str) -> Dict:
        logger.info("NaverRoutingProvider 호출: %s → %s (%s)", origin, destination, mode)

        # TODO: 실제 NCP Directions API 호출 구현
        origin_lat = float(origin.get("lat", 0.0))
        origin_lng = float(origin.get("lng", 0.0))
        dest_lat = float(destination.get("lat", 0.0))
        dest_lng = float(destination.get("lng", 0.0))
        distance_km = _haversine_km(origin_lat, origin_lng, dest_lat, dest_lng)

        if mode == "walk":
            duration = round(distance_km * 1000 * 1.3 / 66.7)
        elif mode == "transit":
            duration = round(distance_km * 1000 * 1.8 / 66.7)
        else:
            duration = max(1, round(distance_km / 0.5))

        return {
            "duration_min": max(1, int(duration)),
            "distance_km": round(distance_km, 1),
            "mode": mode,
            "source": "ncp_stub",
        }


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
