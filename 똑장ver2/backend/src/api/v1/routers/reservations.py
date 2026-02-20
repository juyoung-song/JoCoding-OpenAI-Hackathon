"""장보기 예약 API 라우터."""
from __future__ import annotations

from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from src.api.v1.dependencies import AuthUser, require_auth
from src.infrastructure.persistence.user_repository import UserRepository

router = APIRouter(prefix="/reservations", tags=["reservations"])


class ReservationEntry(BaseModel):
    id: str
    label: str = Field(..., min_length=1, max_length=100)
    weekday: Literal["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    enabled: bool = True
    status: str = "active"
    schedule_type: Literal["one_time", "weekly"] = "weekly"
    next_run_at: Optional[str] = None
    timezone: str = "Asia/Seoul"
    channel: Literal["push", "in_app"] = "in_app"
    source_order_id: Optional[str] = None
    source_mart_name: Optional[str] = None
    planned_items: list[str] = Field(default_factory=list)
    created_at: str
    last_run_at: Optional[str] = None
    last_result_status: Optional[str] = None
    retry_count: int = 0


class CreateReservationRequest(BaseModel):
    label: str = Field(..., min_length=1, max_length=100)
    weekday: Literal["mon", "tue", "wed", "thu", "fri", "sat", "sun"] = "fri"
    time: str = Field("18:30", pattern=r"^\d{2}:\d{2}$")
    enabled: bool = True
    schedule_type: Literal["one_time", "weekly"] = "weekly"
    next_run_at: Optional[str] = None
    timezone: str = "Asia/Seoul"
    channel: Literal["push", "in_app"] = "in_app"
    source_order_id: Optional[str] = None
    source_mart_name: Optional[str] = None
    planned_items: list[str] = Field(default_factory=list)


class UpdateReservationRequest(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=100)
    weekday: Optional[Literal["mon", "tue", "wed", "thu", "fri", "sat", "sun"]] = None
    time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    enabled: Optional[bool] = None
    status: Optional[str] = None
    schedule_type: Optional[Literal["one_time", "weekly"]] = None
    next_run_at: Optional[str] = None
    timezone: Optional[str] = None
    channel: Optional[Literal["push", "in_app"]] = None
    source_order_id: Optional[str] = None
    source_mart_name: Optional[str] = None
    planned_items: Optional[list[str]] = None
    last_run_at: Optional[str] = None
    last_result_status: Optional[str] = None
    retry_count: Optional[int] = Field(default=None, ge=0)


class ReservationListResponse(BaseModel):
    user_id: str
    reservations: list[ReservationEntry]


def _map_reservation_row(row: dict) -> ReservationEntry:
    return ReservationEntry(
        id=str(row.get("reservation_id")),
        label=str(row.get("label") or ""),
        weekday=row.get("weekday") or "mon",
        time=row.get("time") or "09:00",
        enabled=bool(row.get("enabled", True)),
        status=str(row.get("status") or "active"),
        schedule_type=row.get("schedule_type") or "weekly",
        next_run_at=row.get("next_run_at"),
        timezone=row.get("timezone") or "Asia/Seoul",
        channel=row.get("channel") or "in_app",
        source_order_id=row.get("source_order_id"),
        source_mart_name=row.get("source_mart_name"),
        planned_items=list(row.get("planned_items") or []),
        created_at=str(row.get("created_at") or ""),
        last_run_at=row.get("last_run_at"),
        last_result_status=row.get("last_result_status"),
        retry_count=int(row.get("retry_count") or 0),
    )


def _sanitize_planned_items(values: list[str] | None) -> list[str]:
    if not values:
        return []
    result: list[str] = []
    for value in values:
        normalized = str(value).strip()
        if normalized and normalized not in result:
            result.append(normalized)
    return result


@router.get("", response_model=ReservationListResponse)
async def list_reservations(
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)
    rows = await repo.list_reservations(current_user.user_id)
    return ReservationListResponse(
        user_id=current_user.user_id,
        reservations=[_map_reservation_row(row) for row in rows],
    )


@router.post("", response_model=ReservationEntry)
async def create_reservation(
    request: Request,
    payload: CreateReservationRequest,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)
    created = await repo.create_reservation(
        current_user.user_id,
        {
            **payload.model_dump(),
            "planned_items": _sanitize_planned_items(payload.planned_items),
        },
    )
    return _map_reservation_row(created)


@router.patch("/{reservation_id}", response_model=ReservationEntry)
async def update_reservation(
    request: Request,
    reservation_id: str,
    payload: UpdateReservationRequest,
    current_user: AuthUser = Depends(require_auth),
):
    patch = payload.model_dump(exclude_unset=True)
    if "planned_items" in patch:
        patch["planned_items"] = _sanitize_planned_items(patch.get("planned_items"))

    repo = UserRepository(request.app.state.db)
    updated = await repo.update_reservation(current_user.user_id, reservation_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return _map_reservation_row(updated)


@router.delete("/{reservation_id}", response_model=ReservationListResponse)
async def delete_reservation(
    request: Request,
    reservation_id: str,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)
    await repo.delete_reservation(current_user.user_id, reservation_id)
    rows = await repo.list_reservations(current_user.user_id)
    return ReservationListResponse(
        user_id=current_user.user_id,
        reservations=[_map_reservation_row(row) for row in rows],
    )