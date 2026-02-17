from __future__ import annotations

import json
import math
import time
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import aiosqlite
import httpx

from src.config import Settings
from src.domain.types import WeatherAdvisory
from src.infrastructure.persistence.cache_service import CacheService
from src.infrastructure.providers.provider_budget import BudgetExceededError, enforce_api_budget


class KmaWeatherProvider:
    """기상청 단기예보 기반 날씨 안내 Provider."""

    _ENDPOINT = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst"
    _BASE_TIMES = ["0200", "0500", "0800", "1100", "1400", "1700", "2000", "2300"]

    def __init__(self, settings: Settings, cache: CacheService, db: aiosqlite.Connection) -> None:
        self._settings = settings
        self._cache = cache
        self._db = db

    async def get_advisory(self, lat: float, lng: float, time_window: str) -> WeatherAdvisory:
        if not self._settings.kma_service_key:
            raise RuntimeError("KMA service key is not configured.")

        now_kst = datetime.now(timezone(timedelta(hours=9)))
        hour_block = now_kst.strftime("%Y%m%d%H")
        cache_key = f"weather:{lat:.2f}:{lng:.2f}:{hour_block}"
        started = time.monotonic()

        cached = await self._cache.get(cache_key)
        if cached:
            await self._log_call("kma_weather", "vilage_fcst", 200, started, cache_hit=True, error_class=None)
            return WeatherAdvisory(**json.loads(cached))
        try:
            await enforce_api_budget(self._db, self._settings)
        except BudgetExceededError as exc:
            await self._log_call(
                "kma_weather",
                "vilage_fcst",
                None,
                started,
                cache_hit=False,
                error_class=exc.__class__.__name__,
            )
            raise

        nx, ny = self._to_grid(lat, lng)
        base_date, base_time = self._resolve_base_time(now_kst)
        params = {
            "serviceKey": self._settings.kma_service_key,
            "pageNo": 1,
            "numOfRows": 1000,
            "dataType": "JSON",
            "base_date": base_date,
            "base_time": base_time,
            "nx": nx,
            "ny": ny,
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(self._ENDPOINT, params=params)
            response.raise_for_status()

            payload = response.json()
            items = payload["response"]["body"]["items"]["item"]
            parsed = self._extract_weather(items)
            advisory = self._build_advisory(parsed)
            await self._cache.set(cache_key, advisory.model_dump_json(), self._settings.cache_ttl_weather)
            await self._log_call(
                "kma_weather", "vilage_fcst", response.status_code, started, cache_hit=False, error_class=None
            )
            return advisory
        except Exception as exc:
            status_code = getattr(getattr(exc, "response", None), "status_code", None)
            await self._log_call(
                "kma_weather",
                "vilage_fcst",
                status_code,
                started,
                cache_hit=False,
                error_class=exc.__class__.__name__,
            )
            raise

    def _extract_weather(self, items: list[dict]) -> dict[str, int | float]:
        target: dict[str, int | float] = {}
        sorted_items = sorted(items, key=lambda x: (x.get("fcstDate", ""), x.get("fcstTime", "")))
        for category in ("POP", "TMP", "PTY", "SKY"):
            for row in sorted_items:
                if row.get("category") != category:
                    continue
                value = row.get("fcstValue")
                if category == "TMP":
                    target[category] = float(value)
                else:
                    target[category] = int(float(value))
                break
        return target

    def _build_advisory(self, weather: dict[str, int | float]) -> WeatherAdvisory:
        pop = int(weather.get("POP", 0))
        pty = int(weather.get("PTY", 0))
        sky = int(weather.get("SKY", 0))
        tmp_raw = weather.get("TMP")
        tmp = float(tmp_raw) if tmp_raw is not None else None

        note_parts: list[str] = []
        if pty > 0:
            note_parts.append("눈 예보" if pty == 3 else "비 예보")
        elif sky == 1:
            note_parts.append("맑음")
        elif sky == 3:
            note_parts.append("구름많음")
        elif sky == 4:
            note_parts.append("흐림")
        else:
            note_parts.append("날씨 정보 확인 필요")

        if pop >= 60:
            note_parts.append(f"강수확률 {pop}%")

        return WeatherAdvisory(
            note=", ".join(note_parts),
            temperature=tmp,
            precipitation_probability=pop,
        )

    def _resolve_base_time(self, now_kst: datetime) -> tuple[str, str]:
        compare = now_kst - timedelta(minutes=10)
        hhmm = compare.strftime("%H%M")
        candidates = [t for t in self._BASE_TIMES if t <= hhmm]
        if candidates:
            return compare.strftime("%Y%m%d"), candidates[-1]
        prev = compare - timedelta(days=1)
        return prev.strftime("%Y%m%d"), self._BASE_TIMES[-1]

    def _to_grid(self, lat: float, lng: float) -> tuple[int, int]:
        # 기상청 LCC DFS 변환식
        re = 6371.00877
        grid = 5.0
        slat1 = 30.0
        slat2 = 60.0
        olon = 126.0
        olat = 38.0
        xo = 43.0
        yo = 136.0

        deg = math.pi / 180.0
        re = re / grid
        slat1 = slat1 * deg
        slat2 = slat2 * deg
        olon = olon * deg
        olat = olat * deg

        sn = math.tan(math.pi * 0.25 + slat2 * 0.5) / math.tan(math.pi * 0.25 + slat1 * 0.5)
        sn = math.log(math.cos(slat1) / math.cos(slat2)) / math.log(sn)
        sf = math.tan(math.pi * 0.25 + slat1 * 0.5)
        sf = math.pow(sf, sn) * math.cos(slat1) / sn
        ro = math.tan(math.pi * 0.25 + olat * 0.5)
        ro = re * sf / math.pow(ro, sn)

        ra = math.tan(math.pi * 0.25 + lat * deg * 0.5)
        ra = re * sf / math.pow(ra, sn)
        theta = lng * deg - olon
        if theta > math.pi:
            theta -= 2.0 * math.pi
        if theta < -math.pi:
            theta += 2.0 * math.pi
        theta *= sn

        nx = int(ra * math.sin(theta) + xo + 0.5)
        ny = int(ro - ra * math.cos(theta) + yo + 0.5)
        return nx, ny

    async def _log_call(
        self,
        provider_name: str,
        endpoint_key: str,
        status_code: int | None,
        started: float,
        cache_hit: bool,
        error_class: str | None,
    ) -> None:
        latency_ms = int((time.monotonic() - started) * 1000)
        try:
            await self._db.execute(
                """INSERT INTO offline_provider_call_log
                   (call_id, provider_name, endpoint_key, status_code, latency_ms, cache_hit, error_class, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    str(uuid4()),
                    provider_name,
                    endpoint_key,
                    status_code,
                    latency_ms,
                    int(cache_hit),
                    error_class,
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            await self._db.commit()
        except Exception:
            return
