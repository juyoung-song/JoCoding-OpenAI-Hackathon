"""장바구니 API 라우터."""

from fastapi import APIRouter

from app.domain.models.basket import Basket, BasketItem
from app.schemas.basket import BasketAddRequest, BasketResponse

router = APIRouter(prefix="/basket", tags=["장바구니"])

# 인메모리 임시 저장 (MVP)
_basket = Basket()


@router.get("", response_model=BasketResponse)
async def get_basket():
    """현재 장바구니를 조회한다."""
    print(f"[Basket] GET items: {len(_basket.items)}")
    return BasketResponse(
        items=_basket.items,
        total_items=_basket.total_items,
    )


@router.post("", response_model=BasketResponse)
async def add_item(request: BasketAddRequest):
    """장바구니에 품목을 추가한다."""
    item = BasketItem(
        item_name=request.item_name,
        brand=request.brand,
        size=request.size,
        quantity=request.quantity,
        category=request.category,
        mode=request.mode,
    )
    _basket.add_item(item)
    print(f"[Basket] ADD item: {item.item_name}, Total: {len(_basket.items)}")
    return BasketResponse(
        items=_basket.items,
        total_items=_basket.total_items,
    )


@router.delete("/{item_name}", response_model=BasketResponse)
async def remove_item(item_name: str):
    """장바구니에서 품목을 삭제한다."""
    _basket.remove_item(item_name)
    return BasketResponse(
        items=_basket.items,
        total_items=_basket.total_items,
    )


@router.delete("", response_model=BasketResponse)
async def clear_basket():
    """장바구니를 비운다."""
    _basket.clear()
    return BasketResponse(
        items=_basket.items,
        total_items=_basket.total_items,
    )
