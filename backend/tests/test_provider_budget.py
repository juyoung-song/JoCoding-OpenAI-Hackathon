from __future__ import annotations

from datetime import datetime, timezone

import pytest

from src.config import Settings
from src.infrastructure.providers.provider_budget import BudgetExceededError, enforce_api_budget
from tests.test_support import create_test_db


def _settings(limit: int, warn: float, critical: float) -> Settings:
    return Settings(
        database_url="sqlite+aiosqlite:///./app.db",
        cache_database_url="sqlite+aiosqlite:///./cache.db",
        naver_client_id="",
        naver_client_secret="",
        ncp_client_id="",
        ncp_client_secret="",
        kma_service_key="",
        kamis_api_key="",
        cache_ttl_place=1800,
        cache_ttl_route_car=600,
        cache_ttl_weather=1800,
        monthly_api_call_limit=limit,
        budget_warning_ratio=warn,
        budget_critical_ratio=critical,
    )


@pytest.mark.asyncio
async def test_budget_warning_threshold() -> None:
    db = await create_test_db()
    try:
        now = datetime.now(timezone.utc).isoformat()
        for i in range(8):
            await db.execute(
                """INSERT INTO offline_provider_call_log
                   (call_id, provider_name, endpoint_key, status_code, latency_ms, cache_hit, error_class, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (f"c{i}", "test_provider", "ep", 200, 10, 0, None, now),
            )
        await db.commit()

        used, warning = await enforce_api_budget(db, _settings(limit=10, warn=0.8, critical=0.95))
        assert used == 8
        assert warning is True
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_budget_critical_threshold_blocks() -> None:
    db = await create_test_db()
    try:
        now = datetime.now(timezone.utc).isoformat()
        for i in range(10):
            await db.execute(
                """INSERT INTO offline_provider_call_log
                   (call_id, provider_name, endpoint_key, status_code, latency_ms, cache_hit, error_class, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (f"k{i}", "test_provider", "ep", 200, 10, 0, None, now),
            )
        await db.commit()

        with pytest.raises(BudgetExceededError):
            await enforce_api_budget(db, _settings(limit=10, warn=0.8, critical=0.95))
    finally:
        await db.close()
