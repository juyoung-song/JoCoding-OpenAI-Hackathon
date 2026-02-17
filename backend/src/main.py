# 똑장 오프라인 파트 FastAPI 메인 엔트리포인트
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from src.config import get_settings
from src.api.routes import router
from src.application.plan_service import PlanService
from src.infrastructure.persistence.cache_service import CacheService
from src.infrastructure.persistence.database import get_app_db, get_cache_db, init_db
from src.infrastructure.providers.kma_weather import KmaWeatherProvider
from src.infrastructure.providers.mock_providers import MockRoutingProvider, MockWeatherProvider
from src.infrastructure.providers.naver_place import NaverLocalPlaceProvider
from src.infrastructure.providers.naver_routing import NaverRoutingProvider

# .env 로드
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await init_db()

    # DB 연결 및 서비스 초기화
    db = await get_app_db()
    cache_db = await get_cache_db()
    cache = CacheService(cache_db)
    settings = get_settings()

    if settings.ncp_client_id and settings.ncp_client_secret:
        routing = NaverRoutingProvider(settings=settings, cache=cache, db=db)
    else:
        routing = MockRoutingProvider()

    if settings.kma_service_key:
        weather = KmaWeatherProvider(settings=settings, cache=cache, db=db)
    else:
        weather = MockWeatherProvider()

    place = None
    if settings.naver_client_id and settings.naver_client_secret:
        place = NaverLocalPlaceProvider(settings=settings, cache=cache, db=db)

    app.state.plan_service = PlanService(
        db=db,
        routing_provider=routing,
        weather_provider=weather,
        place_provider=place,
    )
    app.state.db = db
    app.state.cache_db = cache_db

    yield

    # cleanup
    await db.close()
    await cache_db.close()


app = FastAPI(
    title="똑장 오프라인 API",
    description="오프라인 장보기 플랜 생성 API - MVP",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(router, prefix="/v1/offline")

demo_dir = Path(__file__).resolve().parent.parent / "mock" / "ui-demo"
if demo_dir.exists():
    app.mount("/demo", StaticFiles(directory=demo_dir, html=True), name="demo")
