from __future__ import annotations

from datetime import datetime, timezone

import aiosqlite

from src.config import Settings


class BudgetExceededError(RuntimeError):
    """월간 API 호출 예산 초과."""


async def enforce_api_budget(db: aiosqlite.Connection, settings: Settings) -> tuple[int, bool]:
    """월간 호출량을 확인하고 임계치 상태를 반환.

    Returns:
        (used_calls, is_warning)
    Raises:
        BudgetExceededError: critical 임계치 이상일 때
    """
    limit = settings.monthly_api_call_limit
    if limit <= 0:
        return 0, False

    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    row = await db.execute(
        "SELECT COUNT(*) AS cnt FROM offline_provider_call_log WHERE created_at >= ?",
        (month_start,),
    )
    count_row = await row.fetchone()
    used = int(count_row["cnt"]) if count_row else 0

    warning_threshold = int(limit * settings.budget_warning_ratio)
    critical_threshold = int(limit * settings.budget_critical_ratio)
    if used >= critical_threshold:
        raise BudgetExceededError(
            f"API monthly budget exceeded: used={used}, critical_threshold={critical_threshold}, limit={limit}"
        )
    return used, used >= warning_threshold
