from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request

from src.api.v1.dependencies import AuthUser, require_auth
from src.domain.models.basket import Basket, BasketItem
from src.infrastructure.persistence.user_repository import UserRepository

router = APIRouter(prefix="/basket", tags=["basket"])

# 그래프 노드 호환용 인메모리 캐시 (SoR는 DB)
_basket_store_by_user: dict[str, Basket] = {}


def get_basket_store(user_id: str) -> Basket:
    return _basket_store_by_user.setdefault(user_id, Basket(items=[]))


async def sync_basket_store_from_db(request: Request, user_id: str) -> Basket:
    repo = UserRepository(request.app.state.db)
    basket = await repo.get_basket(user_id)
    _basket_store_by_user[user_id] = basket
    return basket


async def save_basket_store_to_db(request: Request, user_id: str) -> None:
    repo = UserRepository(request.app.state.db)
    await repo.save_basket(user_id, get_basket_store(user_id))


@router.get("", response_model=Basket)
async def get_basket(
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    return await sync_basket_store_from_db(request, current_user.user_id)


@router.post("/items", response_model=Basket)
async def add_item(
    request: Request,
    item: BasketItem,
    current_user: AuthUser = Depends(require_auth),
):
    basket = await sync_basket_store_from_db(request, current_user.user_id)

    for existing in basket.items:
        if existing.item_name == item.item_name and existing.size == item.size and existing.brand == item.brand:
            existing.quantity += item.quantity
            await save_basket_store_to_db(request, current_user.user_id)
            return basket

    basket.items.append(item)
    await save_basket_store_to_db(request, current_user.user_id)
    return basket


@router.patch("/items/{item_name}", response_model=Basket)
async def update_item_quantity(
    request: Request,
    item_name: str,
    item: BasketItem,
    current_user: AuthUser = Depends(require_auth),
):
    basket = await sync_basket_store_from_db(request, current_user.user_id)
    for existing in basket.items:
        if existing.item_name == item_name:
            existing.quantity = item.quantity
            await save_basket_store_to_db(request, current_user.user_id)
            return basket

    raise HTTPException(status_code=404, detail="Item not found")


@router.delete("/items/{item_name}", response_model=Basket)
async def remove_item(
    request: Request,
    item_name: str,
    current_user: AuthUser = Depends(require_auth),
):
    basket = await sync_basket_store_from_db(request, current_user.user_id)
    basket.items = [i for i in basket.items if i.item_name != item_name]
    await save_basket_store_to_db(request, current_user.user_id)
    return basket


@router.delete("", response_model=Basket)
async def clear_basket(
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    basket = await sync_basket_store_from_db(request, current_user.user_id)
    basket.items = []
    await save_basket_store_to_db(request, current_user.user_id)
    return basket