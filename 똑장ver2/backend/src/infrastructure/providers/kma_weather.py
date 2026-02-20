"""기상청 단기예보 API Provider — MVP stub."""
from __future__ import annotations

import logging
from typing import Dict

from src.infrastructure.providers.base import WeatherProvider

logger = logging.getLogger(__name__)


class KmaWeatherProvider(WeatherProvider):
    """기상청 단기예보 API.

    MVP: 실제 API 호출 대신 기본 날씨 데이터 반환.
    실제 구현 시 _to_grid() LCC DFS 좌표변환 포함.
    """

    def __init__(self, settings=None, cache=None, db=None):
        self.settings = settings
        self.cache = cache
        self.db = db

    async def get_current_weather(self, lat: float, lng: float) -> Dict:
        logger.info("KmaWeatherProvider 호출: lat=%.4f, lng=%.4f", lat, lng)

        # TODO: 실제 기상청 API 호출 구현
        # 1. _to_grid(lat, lng) → nx, ny 좌표 변환
        # 2. getUltraSrtFcst API 호출
        # 3. 응답 파싱 → sky, temp, rain_prob 추출
        return {
            "sky": "맑음",
            "temp": 18.0,
            "rain_prob": 10,
            "condition": "Good",
            "source": "kma_stub",
        }
