"""추천 플랜 도메인 모델."""

from enum import Enum

from pydantic import BaseModel, Field


class PlanType(str, Enum):
    """플랜 유형."""
    CHEAPEST = "cheapest"    # A: 최저가
    NEAREST = "nearest"      # B: 가까움
    BALANCED = "balanced"    # C: 균형


class PlanItem(BaseModel):
    """플랜 내 개별 상품 후보."""
    item_name: str
    product_name: str = Field(..., description="실제 상품명")
    brand: str | None = None
    price: int = Field(..., description="가격 (원)")
    link: str | None = Field(None, description="구매 링크")
    source: str = Field(..., description="출처 (네이버쇼핑, 쿠팡 등)")
    available: bool = True


class Plan(BaseModel):
    """마트/몰별 추천 플랜."""
    plan_type: PlanType
    mart_name: str = Field(..., description="마트/몰 이름")
    mart_icon: str | None = None
    items: list[PlanItem] = Field(default_factory=list)
    estimated_total: int = Field(0, description="추정 총액 (원)")
    coverage: int = Field(0, description="커버된 품목 수")
    total_basket_items: int = Field(0, description="전체 장바구니 품목 수")
    delivery_info: str | None = Field(None, description="배송 정보")
    badges: list[str] = Field(default_factory=list, description="배지 (선호 쇼핑몰, 로켓배송 등)")
    explanation: str = Field("", description="추천 이유 설명")
    cart_url: str | None = Field(None, description="마트 장바구니/메인 링크")

    @property
    def coverage_ratio(self) -> float:
        if self.total_basket_items == 0:
            return 0.0
        return self.coverage / self.total_basket_items
