# 똑장 오프라인 파트 설정 관리
from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass(frozen=True)
class Settings:
    """환경변수 기반 애플리케이션 설정."""

    database_url: str = field(default_factory=lambda: os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./app.db"))
    cache_database_url: str = field(
        default_factory=lambda: os.getenv("CACHE_DATABASE_URL", "sqlite+aiosqlite:///./cache.db")
    )

    # 네이버 검색 API (Place Provider)
    naver_client_id: str = field(default_factory=lambda: os.getenv("NAVER_CLIENT_ID", ""))
    naver_client_secret: str = field(default_factory=lambda: os.getenv("NAVER_CLIENT_SECRET", ""))

    # 네이버 클라우드 플랫폼 (Routing Provider - Directions API)
    ncp_client_id: str = field(default_factory=lambda: os.getenv("NCP_CLIENT_ID", ""))
    ncp_client_secret: str = field(default_factory=lambda: os.getenv("NCP_CLIENT_SECRET", ""))

    # 기상청 단기예보 API
    kma_service_key: str = field(default_factory=lambda: os.getenv("KMA_SERVICE_KEY", ""))

    # 참가격 공공데이터 API
    kamis_api_key: str = field(default_factory=lambda: os.getenv("KAMIS_API_KEY", ""))
    kamis_cert_id: str = field(default_factory=lambda: os.getenv("KAMIS_CERT_ID", ""))

    # 캐시 TTL (초)
    cache_ttl_place: int = 1800  # 30분
    cache_ttl_route_car: int = 600  # 10분
    cache_ttl_weather: int = 1800  # 30분

    # API 호출 예산
    monthly_api_call_limit: int = 300_000
    budget_warning_ratio: float = 0.80
    budget_critical_ratio: float = 0.95


def get_settings() -> Settings:
    return Settings()
