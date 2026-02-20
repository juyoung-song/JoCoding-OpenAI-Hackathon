from __future__ import annotations
import asyncio
import logging
from contextlib import asynccontextmanager, suppress
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1.routers import (
    auth,
    basket,
    chat,
    ops,
    payments,
    plans,
    preferences,
    public_data,
    reservations,
    stt,
    user_data,
)
from src.application.services.public_catalog_sync import PublicCatalogSyncService
from src.core.config import settings
from src.core.logging_mask import install_sensitive_data_filter
from src.infrastructure.persistence.cache_service import CacheService
from src.infrastructure.persistence.database import get_app_db, get_cache_db, init_db
from src.infrastructure.persistence.seed_offline_mock_data import seed_offline_mock_data
from src.infrastructure.persistence.user_repository import UserRepository
from src.infrastructure.providers.mock_providers import MockRoutingProvider, MockWeatherProvider

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
install_sensitive_data_filter()
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logger = logging.getLogger(__name__)


def _is_secret_configured(value: str | None) -> bool:
    normalized = (value or "").strip()
    if not normalized:
        return False
    return not normalized.startswith("__SET_IN_SECRET_MANAGER__")


async def _reservation_scheduler(app: FastAPI, stop_event: asyncio.Event) -> None:
    while not stop_event.is_set():
        try:
            repo = UserRepository(app.state.db)
            dispatched = await repo.dispatch_due_reservations()
            if dispatched:
                logger.info("예약 스케줄러 디스패치 완료: %s건", dispatched)
        except Exception as exc:
            logger.warning("예약 스케줄러 처리 중 오류: %s", exc)

        try:
            await asyncio.wait_for(
                stop_event.wait(),
                timeout=max(10, settings.reservation_scheduler_interval_seconds),
            )
        except asyncio.TimeoutError:
            continue


async def _run_public_catalog_sync_on_startup(db) -> None:
    if not settings.public_catalog_sync_on_startup:
        logger.info("PUBLIC_CATALOG_SYNC_ON_STARTUP=false → 공공데이터 동기화 생략")
        return

    service = PublicCatalogSyncService(
        db=db,
        cert_key=settings.kamis_cert_key,
        cert_id=settings.kamis_cert_id,
        timeout_seconds=settings.public_catalog_timeout_seconds,
    )
    result = await service.sync_catalog()
    status = str(result.get("status") or "unknown")
    reason = result.get("reason")
    fetched_items = int(result.get("fetched_items") or 0)
    if status in {"ok", "partial"}:
        logger.info(
            "공공데이터 카탈로그 동기화 완료: status=%s, fetched_items=%s, products=%s, snapshots=%s",
            status,
            fetched_items,
            int(result.get("upserted_products") or 0),
            int(result.get("upserted_snapshots") or 0),
        )
        if status == "partial":
            logger.warning("공공데이터 카탈로그 부분 실패: %s", result.get("errors") or [])
        return

    logger.info("공공데이터 카탈로그 동기화 생략: %s", reason or status)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await init_db()
    db = await get_app_db()
    cache_db = await get_cache_db()
    cache = CacheService(cache_db)
    await seed_offline_mock_data(db)
    await _run_public_catalog_sync_on_startup(db)

    # API 키 유무에 따라 실제 / Mock Provider 자동 선택
    if _is_secret_configured(settings.ncp_client_id) and _is_secret_configured(settings.ncp_client_secret):
        from src.infrastructure.providers.naver_routing import NaverRoutingProvider
        routing = NaverRoutingProvider(settings=settings, cache=cache, db=db)
    else:
        routing = MockRoutingProvider()
        logger.info("NCP 키 없음 → MockRoutingProvider 사용")

    if _is_secret_configured(settings.kma_service_key):
        from src.infrastructure.providers.kma_weather import KmaWeatherProvider
        weather = KmaWeatherProvider(settings=settings, cache=cache, db=db)
    else:
        weather = MockWeatherProvider()
        logger.info("KMA 키 없음 → MockWeatherProvider 사용")

    if _is_secret_configured(settings.naver_client_id) and _is_secret_configured(settings.naver_client_secret):
        from src.infrastructure.providers.naver_local import NaverLocalProvider
        from src.infrastructure.providers.naver_shopping import NaverShoppingProvider
        place = NaverLocalProvider()
        shopping = NaverShoppingProvider()
    else:
        place = None
        shopping = None
        logger.info("Naver 키 없음 → 오프라인 Mock 사용")

    app.state.db = db
    app.state.cache_db = cache_db
    app.state.routing = routing
    app.state.weather = weather
    app.state.place = place
    app.state.shopping = shopping

    stop_event = asyncio.Event()
    scheduler_task = asyncio.create_task(_reservation_scheduler(app, stop_event))
    app.state.scheduler_stop_event = stop_event
    app.state.scheduler_task = scheduler_task

    logger.info("똑장 백엔드 시작 완료")
    yield

    stop_event.set()
    scheduler_task.cancel()
    with suppress(asyncio.CancelledError):
        await scheduler_task

    await db.close()
    await cache_db.close()
    logger.info("똑장 백엔드 종료")


app = FastAPI(
    title="똑장 API",
    version="0.1.0",
    description="똑똑한 장보기 AI 에이전트",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(basket.router, prefix=settings.api_prefix)
app.include_router(chat.router, prefix=settings.api_prefix)
app.include_router(ops.router, prefix=settings.api_prefix)
app.include_router(payments.router, prefix=settings.api_prefix)
app.include_router(plans.router, prefix=settings.api_prefix)
app.include_router(preferences.router, prefix=settings.api_prefix)
app.include_router(public_data.router, prefix=settings.api_prefix)
app.include_router(reservations.router, prefix=settings.api_prefix)
app.include_router(stt.router, prefix=settings.api_prefix)
app.include_router(user_data.router, prefix=settings.api_prefix)


@app.get(settings.api_prefix)
@app.get(f"{settings.api_prefix}/")
async def api_root():
    return {
        "service": "똑장 API",
        "version": app.version,
        "docs": "/docs",
        "health": "/health",
        "prefix": settings.api_prefix,
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "똑장"}
