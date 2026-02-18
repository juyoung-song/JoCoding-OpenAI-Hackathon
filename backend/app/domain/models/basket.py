"""장바구니 도메인 모델."""

from enum import Enum

from pydantic import BaseModel, Field


class ItemMode(str, Enum):
    """브랜드 고정(🔒) vs 추천(⭐) 모드."""
    FIXED = "fixed"        # 고정모드 🔒
    RECOMMEND = "recommend"  # 추천모드 ⭐


class BasketItem(BaseModel):
    """장바구니 개별 품목."""
    item_name: str = Field(..., description="정규화된 품목명")
    brand: str | None = Field(None, description="브랜드 (없으면 추천모드에서 결정)")
    size: str | None = Field(None, description="용량/규격 (예: 30구, 1L)")
    quantity: int = Field(1, ge=1, description="수량")
    category: str | None = Field(None, description="카테고리 (예: 축산/계란)")
    mode: ItemMode = Field(ItemMode.RECOMMEND, description="고정모드/추천모드")
    canonical_id: str | None = Field(None, description="표준 품목 ID (예: EGG_30)")


class Basket(BaseModel):
    """사용자의 전체 장바구니."""
    items: list[BasketItem] = Field(default_factory=list)

    @property
    def total_items(self) -> int:
        return sum(item.quantity for item in self.items)

    @property
    def unique_items(self) -> int:
        """중복 없는 품목 수 (수량 무시)."""
        return len(self.items)

    def add_item(self, item: BasketItem) -> None:
        self.items.append(item)

    def remove_item(self, item_name: str) -> bool:
        before = len(self.items)
        self.items = [i for i in self.items if i.item_name != item_name]
        return len(self.items) < before

    def clear(self) -> None:
        self.items.clear()
