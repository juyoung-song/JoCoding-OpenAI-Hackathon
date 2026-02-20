from __future__ import annotations

import asyncio
from collections import deque
from dataclasses import dataclass
from math import ceil

from src.core.config import settings


@dataclass
class _OnlinePlanMetric:
    duration_ms: float
    degraded: bool
    success: bool


class OnlinePlanKpiTracker:
    def __init__(self, window_size: int = 500):
        self._records: deque[_OnlinePlanMetric] = deque(maxlen=max(20, window_size))
        self._lock = asyncio.Lock()

    async def record(self, *, duration_ms: float, degraded: bool, success: bool) -> None:
        metric = _OnlinePlanMetric(
            duration_ms=max(0.0, float(duration_ms)),
            degraded=bool(degraded),
            success=bool(success),
        )
        async with self._lock:
            self._records.append(metric)

    async def snapshot(self) -> dict:
        async with self._lock:
            records = list(self._records)

        total = len(records)
        degraded_count = sum(1 for row in records if row.degraded)
        failure_count = sum(1 for row in records if not row.success)
        latencies = sorted(row.duration_ms for row in records if row.success)

        return {
            "window_size": self._records.maxlen,
            "total_requests": total,
            "successful_requests": len(latencies),
            "failed_requests": failure_count,
            "degraded_requests": degraded_count,
            "failure_ratio": (failure_count / total) if total else 0.0,
            "degraded_ratio": (degraded_count / total) if total else 0.0,
            "latency": {
                "p50_ms": _percentile(latencies, 0.50),
                "p95_ms": _percentile(latencies, 0.95),
                "p99_ms": _percentile(latencies, 0.99),
                "max_ms": max(latencies) if latencies else None,
            },
            "kpi_target": {"p99_ms_lte": 5000},
        }


def _percentile(values: list[float], ratio: float) -> float | None:
    if not values:
        return None
    if len(values) == 1:
        return round(values[0], 2)
    clamped = min(max(ratio, 0.0), 1.0)
    rank = max(1, ceil(clamped * len(values)))
    index = min(len(values) - 1, rank - 1)
    return round(values[index], 2)


_online_plan_kpi = OnlinePlanKpiTracker(window_size=settings.online_plan_metrics_window_size)


def get_online_plan_kpi_tracker() -> OnlinePlanKpiTracker:
    return _online_plan_kpi

