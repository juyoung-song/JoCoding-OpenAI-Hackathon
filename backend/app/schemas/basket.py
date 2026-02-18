"""장바구니 관련 스키마."""

from pydantic import BaseModel, Field

from app.domain.models.basket import BasketItem, ItemMode


class BasketAddRequest(BaseModel):
    """장바구니 품목 추가 요청."""
    item_name: str
    brand: str | None = None
    size: str | None = None
    quantity: int = Field(1, ge=1)
    category: str | None = None
    mode: ItemMode = ItemMode.RECOMMEND


class BasketResponse(BaseModel):
    """장바구니 전체 응답."""
    items: list[BasketItem]
    total_items: int

    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "item_name": "계란",
                        "brand": None,
                        "size": "30구",
                        "quantity": 1,
                        "category": "축산/계란",
                        "mode": "recommend",
                    }
                ],
                "total_items": 1,
            }
        }
