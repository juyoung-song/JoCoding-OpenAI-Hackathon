from pydantic import BaseModel, Field
from datetime import datetime

class SetBrandPreferenceRequest(BaseModel):
    user_id: str = Field(..., description="사용자 ID (또는 세션 ID)")
    canonical_item_id: str = Field(..., description="표준 품목 ID (예: EGG_30)")
    preferred_brand: str = Field(..., description="선호 브랜드명")
    preferred_variant: str | None = Field(None, description="선호 용량/규격")

class BrandPreferenceResponse(BaseModel):
    user_id: str
    canonical_item_id: str
    preferred_brand: str
    preferred_variant: str | None
    updated_at: datetime | None
