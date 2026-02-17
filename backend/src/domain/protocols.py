# Provider 인터페이스 계약 (기획서 섹션 5.2 - 의존 역전 원칙)
from __future__ import annotations

from typing import Protocol

from src.domain.types import OfflineStore, RouteEstimate, WeatherAdvisory


class IPlaceProvider(Protocol):
    """매장 후보 검색 Provider. MVP 구현체: NaverLocalPlaceProvider."""

    async def search_nearby(
        self, lat: float, lng: float, categories: list[str], radius: int
    ) -> list[OfflineStore]: ...


class IRoutingProvider(Protocol):
    """이동시간 추정 Provider. MVP 구현체: NaverRoutingProvider(car), WalkEstimateProvider(walk), TransitEstimateProvider(transit)."""

    async def estimate(
        self, origin: tuple[float, float], destination: tuple[float, float], travel_mode: str
    ) -> RouteEstimate: ...


class IWeatherProvider(Protocol):
    """날씨 주의정보 Provider. MVP 구현체: KmaWeatherProvider."""

    async def get_advisory(self, lat: float, lng: float, time_window: str) -> WeatherAdvisory: ...
