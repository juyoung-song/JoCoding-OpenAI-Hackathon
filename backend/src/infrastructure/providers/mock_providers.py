# Sprint 0용 Mock Provider 구현체 (실제 API 연동 전 테스트용)
from __future__ import annotations

from datetime import datetime, timezone

from src.domain.types import OfflineStore, RouteEstimate, WeatherAdvisory


class MockPlaceProvider:
    """Mock 매장 검색 - DB에서 반경 내 매장 반환."""

    async def search_nearby(
        self, lat: float, lng: float, categories: list[str], radius: int
    ) -> list[OfflineStore]:
        # Sprint 1에서 실제 DB 조회로 교체
        return []


class MockRoutingProvider:
    """Mock 이동시간 추정 - 직선거리 기반 계산."""

    async def estimate(
        self, origin: tuple[float, float], destination: tuple[float, float], travel_mode: str
    ) -> RouteEstimate:
        import math

        lat1, lng1 = origin
        lat2, lng2 = destination

        # Haversine 직선거리 (km)
        r = 6371
        d_lat = math.radians(lat2 - lat1)
        d_lng = math.radians(lng2 - lng1)
        a = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2
        distance_km = r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        # 기획서 섹션 5.2.1 도보 추정 규칙
        if travel_mode == "walk":
            walk_distance_m = distance_km * 1000 * 1.3  # 도보 우회 보정
            travel_minutes = round(walk_distance_m / 66.7)  # 4km/h 기준
        elif travel_mode == "transit":
            travel_minutes = round(distance_km * 1000 * 1.8 / 66.7)  # 대중교통 보정
        else:  # car
            travel_minutes = max(1, round(distance_km / 0.5))  # 대략 30km/h 도심 평균

        return RouteEstimate(
            distance_km=round(distance_km, 1),
            travel_minutes=max(1, travel_minutes),
            is_estimated=True,
        )


class MockWeatherProvider:
    """Mock 날씨 Provider - 고정 응답."""

    async def get_advisory(self, lat: float, lng: float, time_window: str) -> WeatherAdvisory:
        return WeatherAdvisory(
            note="맑음",
            temperature=5.0,
            precipitation_probability=10,
        )
