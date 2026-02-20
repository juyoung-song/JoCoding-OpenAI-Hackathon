from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.api.v1.dependencies import AuthUser, require_auth
from src.core.metrics import get_online_plan_kpi_tracker

router = APIRouter(prefix="/ops", tags=["ops"])


class OnlinePlanGateResponse(BaseModel):
    gate_name: str
    passed: bool
    reasons: list[str]
    metrics: dict
    thresholds: dict[str, float]


@router.get("/metrics/online-plans")
async def get_online_plan_metrics(
    _: AuthUser = Depends(require_auth),
):
    tracker = get_online_plan_kpi_tracker()
    return await tracker.snapshot()


@router.get("/gates/online-plan-latency", response_model=OnlinePlanGateResponse)
async def check_online_plan_latency_gate(
    _: AuthUser = Depends(require_auth),
):
    tracker = get_online_plan_kpi_tracker()
    metrics = await tracker.snapshot()

    thresholds = {
        "p99_ms_lte": 5000.0,
        "failure_ratio_lte": 0.05,
        "degraded_ratio_lte": 0.35,
        "min_samples": 10.0,
    }
    reasons: list[str] = []

    total_requests = int(metrics.get("total_requests") or 0)
    if total_requests < thresholds["min_samples"]:
        reasons.append(
            f"표본 부족: 최소 {int(thresholds['min_samples'])}건 필요 (현재 {total_requests}건)"
        )

    latency = metrics.get("latency", {})
    p99_ms = latency.get("p99_ms")
    if isinstance(p99_ms, (int, float)) and p99_ms > thresholds["p99_ms_lte"]:
        reasons.append(f"p99 초과: {p99_ms}ms > {thresholds['p99_ms_lte']}ms")

    failure_ratio = float(metrics.get("failure_ratio") or 0.0)
    if failure_ratio > thresholds["failure_ratio_lte"]:
        reasons.append(
            f"실패율 초과: {round(failure_ratio * 100, 2)}% > {thresholds['failure_ratio_lte'] * 100}%"
        )

    degraded_ratio = float(metrics.get("degraded_ratio") or 0.0)
    if degraded_ratio > thresholds["degraded_ratio_lte"]:
        reasons.append(
            f"degraded 비율 초과: {round(degraded_ratio * 100, 2)}% > {thresholds['degraded_ratio_lte'] * 100}%"
        )

    return OnlinePlanGateResponse(
        gate_name="online_plan_latency",
        passed=not reasons,
        reasons=reasons,
        metrics=metrics,
        thresholds=thresholds,
    )

