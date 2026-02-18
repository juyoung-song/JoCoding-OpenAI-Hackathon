"""앱 설정 관리 — 환경변수 기반 (pydantic-settings)."""

from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """전역 설정. .env 파일 또는 환경변수에서 로드."""

    # ── 앱 기본 ──
    app_name: str = "똑장"
    debug: bool = True
    api_prefix: str = "/api/v1"

    # ── DB 경로 (SQLite) ──
    db_path: str = "app.db"
    cache_db_path: str = "cache.db"

    # ── LLM / OpenAI ──
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # ── 네이버 API ──
    naver_client_id: str = ""
    naver_client_secret: str = ""

    # ── 기상청 API ──
    weather_api_key: str = ""

    # ── HuggingFace ──
    hf_token: str = ""

    # ── Langfuse 관측 ──
    langfuse_secret_key: str = ""
    langfuse_public_key: str = ""
    langfuse_base_url: str = "https://cloud.langfuse.com"

    # ── CORS ──
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
