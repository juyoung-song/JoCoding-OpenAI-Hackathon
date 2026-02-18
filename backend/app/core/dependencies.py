"""FastAPI 의존성 주입(DI) 팩토리."""

from app.core.config import settings


def get_settings():
    """설정 객체를 반환하는 의존성."""
    return settings
