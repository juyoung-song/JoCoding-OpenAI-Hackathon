"""선호 브랜드 도메인 모델."""

from pydantic import BaseModel, Field
from datetime import datetime

class PreferredBrand(BaseModel):
    """사용자가 선호하는 브랜드 정보."""
    user_id: str = Field(..., description="사용자 ID (또는 세션 ID)")
    canonical_item_id: str = Field(..., description="표준 품목 ID (예: EGG_30)")
    preferred_brand: str = Field(..., description="선호하는 브랜드명 (예: 풀무원)")
    preferred_variant: str | None = Field(None, description="선호하는 용량/규격 (예: 30구)")
    created_at: datetime | None = None
    updated_at: datetime | None = None
