from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List

class ItemMode(str, Enum):
    FIXED = "fixed"        # 🔒 브랜드 고정 — 자동 변경 금지
    RECOMMEND = "recommend"  # ⭐ 추천모드 — AI가 최적 브랜드 선택

class BasketItem(BaseModel):
    item_name: str = Field(..., description="정규화된 품목명")
    brand: Optional[str] = Field(None, description="브랜드 (없으면 추천모드에서 결정)")
    size: Optional[str] = Field(None, description="용량/규격 (예: 30구, 1L)")
    quantity: int = Field(1, ge=1, description="수량")
    category: Optional[str] = Field(None, description="카테고리")
    mode: ItemMode = Field(ItemMode.RECOMMEND, description="추천 모드 여부")
    canonical_id: Optional[str] = Field(None, description="표준 품목 ID")

class Basket(BaseModel):
    items: List[BasketItem] = []
