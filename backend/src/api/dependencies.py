# FastAPI 의존성 주입 (기획서 섹션 4.4 의존 역전)
from __future__ import annotations

from fastapi import Request

from src.application.plan_service import PlanService


async def get_plan_service(request: Request) -> PlanService:
    """PlanService 인스턴스를 반환하는 DI 함수."""
    return request.app.state.plan_service
