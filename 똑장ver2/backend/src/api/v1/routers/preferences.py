"""선호 브랜드 관리 API 라우터."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from src.api.v1.dependencies import AuthUser, require_auth
from src.infrastructure.persistence.user_repository import UserRepository

router = APIRouter(prefix="/preferences", tags=["선호도"])

# 그래프/플랜 호환용 캐시 (SoR는 DB)
_user_preferences: dict[str, dict[str, list[str]]] = {}


class BrandPreference(BaseModel):
    brand: str
    type: str = "like"  # "like" or "dislike"


class BrandPreferenceResponse(BaseModel):
    user_id: str
    type: str
    brands: list[str]


async def sync_preferences_from_db(request: Request, user_id: str) -> dict[str, list[str]]:
    repo = UserRepository(request.app.state.db)
    preferences = await repo.get_preferences(user_id)
    _user_preferences[user_id] = preferences
    return preferences


async def save_preferences_to_db(request: Request, user_id: str) -> dict[str, list[str]]:
    repo = UserRepository(request.app.state.db)
    current = _user_preferences.get(user_id, {"like": [], "dislike": []})
    normalized = await repo.save_preferences(user_id, current)
    _user_preferences[user_id] = normalized
    return normalized


@router.get("/brands", response_model=BrandPreferenceResponse)
async def get_brands(
    request: Request,
    type: str = "like",
    current_user: AuthUser = Depends(require_auth),
):
    preferences = await sync_preferences_from_db(request, current_user.user_id)
    brands = preferences.get(type, [])
    return BrandPreferenceResponse(user_id=current_user.user_id, type=type, brands=brands)


@router.post("/brands", response_model=BrandPreferenceResponse)
async def add_brand(
    request: Request,
    pref: BrandPreference,
    current_user: AuthUser = Depends(require_auth),
):
    profile = await sync_preferences_from_db(request, current_user.user_id)
    pref_type = pref.type if pref.type in {"like", "dislike"} else "like"
    target = profile.setdefault(pref_type, [])
    brand = pref.brand.strip()
    if brand and brand not in target:
        target.append(brand)

    normalized = await save_preferences_to_db(request, current_user.user_id)
    return BrandPreferenceResponse(
        user_id=current_user.user_id,
        type=pref_type,
        brands=normalized.get(pref_type, []),
    )


@router.delete("/brands/{brand}", response_model=BrandPreferenceResponse)
async def remove_brand(
    request: Request,
    brand: str,
    type: str = "like",
    current_user: AuthUser = Depends(require_auth),
):
    profile = await sync_preferences_from_db(request, current_user.user_id)
    target = profile.get(type)
    if target is None:
        raise HTTPException(status_code=400, detail="Invalid preference type")

    if brand in target:
        target.remove(brand)

    normalized = await save_preferences_to_db(request, current_user.user_id)
    return BrandPreferenceResponse(
        user_id=current_user.user_id,
        type=type,
        brands=normalized.get(type, []),
    )


@router.delete("/brands", response_model=BrandPreferenceResponse)
async def clear_brands(
    request: Request,
    type: str = "like",
    current_user: AuthUser = Depends(require_auth),
):
    profile = await sync_preferences_from_db(request, current_user.user_id)
    if type not in {"like", "dislike"}:
        raise HTTPException(status_code=400, detail="Invalid preference type")

    profile[type] = []
    normalized = await save_preferences_to_db(request, current_user.user_id)
    return BrandPreferenceResponse(user_id=current_user.user_id, type=type, brands=normalized.get(type, []))