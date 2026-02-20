"""똑장 설정 — python-dotenv + os.getenv 방식 (pydantic-settings PermissionError 회피)."""
from __future__ import annotations

import json
import os
from pathlib import Path

from dotenv import load_dotenv

# .env 로딩 (루트 .env 단일 SoR, /tmp/ddokjang/.env는 예비 fallback)
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent  # backend/
_PROJECT_ROOT = _BACKEND_DIR.parent
_ENV_LOADED = False
for _env in [
    _PROJECT_ROOT / ".env",
    Path("/tmp/ddokjang/.env"),
]:
    try:
        if _env.exists():
            load_dotenv(_env, override=False)
            _ENV_LOADED = True
            break
    except OSError:
        continue

# KAMIS_API_KEY → KAMIS_CERT_KEY 호환 (루트 .env 변수명 차이 대응)
if not os.getenv("KAMIS_CERT_KEY") and os.getenv("KAMIS_API_KEY"):
    os.environ["KAMIS_CERT_KEY"] = os.getenv("KAMIS_API_KEY", "")

# 한글 경로에서 sqlite3가 동작하지 않으므로 ASCII 경로 사용
_DATA_DIR = Path("/tmp/ddokjang")
_DATA_DIR.mkdir(parents=True, exist_ok=True)


class Settings:
    """애플리케이션 설정."""

    app_name: str = "똑장"
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    api_prefix: str = os.getenv("API_PREFIX", "/api/v1")

    # DB (MAIN_DB_PATH 우선, 기존 DB_PATH fallback)
    db_path: str = os.getenv("MAIN_DB_PATH") or os.getenv("DB_PATH", str(_DATA_DIR / "main.db"))
    cache_db_path: str = os.getenv("CACHE_DB_PATH", str(_DATA_DIR / "cache.db"))

    # Auth / Session
    jwt_secret: str = os.getenv("JWT_SECRET", "dev-insecure-secret-change-me")
    jwt_issuer: str = os.getenv("JWT_ISSUER", "ddokjang-api")
    jwt_access_ttl_seconds: int = int(os.getenv("JWT_ACCESS_TTL_SECONDS", "900"))
    jwt_refresh_ttl_seconds: int = int(os.getenv("JWT_REFRESH_TTL_SECONDS", "2592000"))
    session_max_age_days: int = int(os.getenv("SESSION_MAX_AGE_DAYS", "30"))
    reservation_scheduler_interval_seconds: int = int(
        os.getenv("RESERVATION_SCHEDULER_INTERVAL_SECONDS", "60")
    )
    online_plan_metrics_window_size: int = int(os.getenv("ONLINE_PLAN_METRICS_WINDOW_SIZE", "500"))

    # LLM
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-5-mini")

    # 네이버 API (쇼핑 + Local)
    naver_client_id: str = os.getenv("NAVER_CLIENT_ID", "")
    naver_client_secret: str = os.getenv("NAVER_CLIENT_SECRET", "")

    # 네이버 클라우드 (Directions)
    ncp_client_id: str = os.getenv("NCP_CLIENT_ID", "")
    ncp_client_secret: str = os.getenv("NCP_CLIENT_SECRET", "")

    # 기상청 (WEATHER_API_KEY fallback 허용)
    kma_service_key: str = os.getenv("KMA_SERVICE_KEY") or os.getenv("WEATHER_API_KEY", "")

    # KAMIS (농축산물 가격)
    kamis_cert_key: str = os.getenv("KAMIS_CERT_KEY", "")
    kamis_cert_id: str = os.getenv("KAMIS_CERT_ID", "")
    public_catalog_sync_on_startup: bool = os.getenv(
        "PUBLIC_CATALOG_SYNC_ON_STARTUP",
        "true",
    ).lower() == "true"
    public_catalog_timeout_seconds: float = float(
        os.getenv("PUBLIC_CATALOG_TIMEOUT_SECONDS", "12.0")
    )

    # 캐시 TTL (초)
    cache_ttl_place: int = int(os.getenv("CACHE_TTL_PLACE", "1800"))
    cache_ttl_route_car: int = int(os.getenv("CACHE_TTL_ROUTE_CAR", "600"))
    cache_ttl_weather: int = int(os.getenv("CACHE_TTL_WEATHER", "1800"))
    naver_shopping_cache_ttl_seconds: int = int(os.getenv("NAVER_SHOPPING_CACHE_TTL_SECONDS", "120"))

    # Provider timeout/retry/circuit-breaker
    naver_shopping_timeout_seconds: float = float(os.getenv("NAVER_SHOPPING_TIMEOUT_SECONDS", "4.5"))
    naver_shopping_max_retries: int = int(os.getenv("NAVER_SHOPPING_MAX_RETRIES", "2"))
    naver_shopping_retry_backoff_seconds: float = float(
        os.getenv("NAVER_SHOPPING_RETRY_BACKOFF_SECONDS", "0.25")
    )
    naver_shopping_circuit_failure_threshold: int = int(
        os.getenv("NAVER_SHOPPING_CIRCUIT_FAILURE_THRESHOLD", "5")
    )
    naver_shopping_circuit_cooldown_seconds: int = int(
        os.getenv("NAVER_SHOPPING_CIRCUIT_COOLDOWN_SECONDS", "30")
    )

    # PostgreSQL/Alembic migration 준비
    postgres_dsn: str = os.getenv("POSTGRES_DSN", "")

    # API 예산
    monthly_api_call_limit: int = int(os.getenv("MONTHLY_API_CALL_LIMIT", "300000"))
    budget_warning_ratio: float = float(os.getenv("BUDGET_WARNING_RATIO", "0.80"))
    budget_critical_ratio: float = float(os.getenv("BUDGET_CRITICAL_RATIO", "0.95"))

    # Langfuse (선택)
    langfuse_secret_key: str = os.getenv("LANGFUSE_SECRET_KEY", "")
    langfuse_public_key: str = os.getenv("LANGFUSE_PUBLIC_KEY", "")
    langfuse_base_url: str = os.getenv("LANGFUSE_BASE_URL", "https://cloud.langfuse.com")

    # CORS
    @property
    def cors_origins(self) -> list[str]:
        raw = os.getenv("CORS_ORIGINS", '["http://localhost:5173","http://localhost:3000"]')
        try:
            return json.loads(raw)
        except Exception:
            return [raw]

    @property
    def allowed_external_domains(self) -> list[str]:
        raw = os.getenv(
            "ALLOWED_EXTERNAL_DOMAINS",
            '["ssg.com","homeplus.co.kr","kurly.com","coupang.com","lotteon.com"]',
        )
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return [str(value).strip().lower() for value in parsed if str(value).strip()]
            return []
        except Exception:
            return [value.strip().lower() for value in raw.split(",") if value.strip()]

settings = Settings()
