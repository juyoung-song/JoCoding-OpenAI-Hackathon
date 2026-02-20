from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from src.api.v1.dependencies import AuthUser, require_auth
from src.infrastructure.persistence.user_repository import UserRepository

router = APIRouter(prefix="/users/me", tags=["users"])


class AddressEntry(BaseModel):
    id: str
    label: str
    roadAddress: str
    detailAddress: str
    isDefault: bool = False


class UserProfileResponse(BaseModel):
    name: str
    email: str
    phone: str = ""
    addresses: list[AddressEntry] = Field(default_factory=list)


class OrdersResponse(BaseModel):
    orders: list[dict[str, Any]] = Field(default_factory=list)


@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)
    profile = await repo.get_profile(current_user.user_id)
    return UserProfileResponse.model_validate(profile)


@router.put("/profile", response_model=UserProfileResponse)
async def upsert_profile(
    payload: UserProfileResponse,
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)
    saved = await repo.save_profile(current_user.user_id, payload.model_dump(mode="json"))
    return UserProfileResponse.model_validate(saved)


@router.get("/orders", response_model=OrdersResponse)
async def list_orders(
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)
    orders = await repo.list_orders(current_user.user_id)
    return OrdersResponse(orders=orders)


@router.post("/orders")
async def create_order(
    payload: dict[str, Any],
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)
    stored = await repo.upsert_order(current_user.user_id, payload)
    return {"order": stored}