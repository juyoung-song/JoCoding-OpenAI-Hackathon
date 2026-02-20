from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional

class PlanType(str, Enum):
    CHEAPEST = "cheapest"   # A: 최저가
    NEAREST  = "nearest"    # B: 가까움
    BALANCED = "balanced"   # C: 균형

class PlanItem(BaseModel):
    """플랜에 포함된 구체적인 상품 정보 (가격 포함)"""
    item_name: str
    brand: Optional[str]
    size: Optional[str]
    quantity: int
    price: int
    store_name: str
    url: Optional[str] = None
    is_sold_out: bool = False


class PlanAlternative(BaseModel):
    item_name: str
    brand: Optional[str] = None
    size: Optional[str] = None
    unit_price: int
    reason: str = "유사 카테고리 대체품"


class MissingPlanItem(BaseModel):
    item_name: str
    requested_brand: Optional[str] = None
    requested_size: Optional[str] = None
    reason: str = "재고 없음"
    alternative: Optional[PlanAlternative] = None


class Plan(BaseModel):
    """최종 장보기 플랜"""
    plan_type: PlanType
    mart_name: str
    mart_icon: Optional[str] = None
    items: List[PlanItem]
    estimated_total: int
    coverage: int            # 커버된 품목 수
    total_basket_items: int
    coverage_ratio: float
    distance_km: Optional[float] = None
    travel_minutes: Optional[int] = None
    delivery_info: Optional[str] = None
    badges: List[str] = Field(default_factory=list)
    missing_items: List[MissingPlanItem] = Field(default_factory=list)
    explanation: str         # 추천 이유
    cart_url: Optional[str] = None
    price_source: str = "unknown"
    price_observed_at: Optional[str] = None
    price_notice: Optional[str] = None
    data_source: Optional[str] = None
    mall_product_links: List[str] = Field(default_factory=list)
    direct_cart_supported: bool = False
    expected_delivery_hours: Optional[int] = None

    def calculate_coverage(self):
        self.coverage = len(self.items)
        if self.total_basket_items > 0:
            self.coverage_ratio = self.coverage / self.total_basket_items
        else:
            self.coverage_ratio = 0.0
