"""똑장 FastAPI 애플리케이션 엔트리포인트."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routers import basket, chat, checkout, plans, setup, preferences, settings as settings_router
from app.core.config import settings
from app.infrastructure.persistence.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행되는 생명주기 관리."""
    # 시작 시
    await init_db()
    yield
    # 종료 시 (정리 작업)


app = FastAPI(
    title=settings.app_name,
    description="2030대를 위한 장보기 에이전트 API",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS 설정 ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 라우터 등록 ──

app.include_router(setup.router, prefix="/api/v1")
app.include_router(basket.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(plans.router, prefix="/api/v1")
app.include_router(checkout.router, prefix="/api/v1")
app.include_router(preferences.router, prefix="/api/v1")
app.include_router(settings_router.router, prefix="/api/v1")


@app.get("/")
async def root():
    """헬스 체크."""
    return {
        "service": settings.app_name,
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/health")
async def health():
    """상세 헬스 체크."""
    return {
        "status": "healthy",
        "database": "connected",
    }
