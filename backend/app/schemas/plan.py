"""추천 플랜 관련 스키마."""

from pydantic import BaseModel, Field

from app.domain.models.plan import Plan


class PlanGenerateRequest(BaseModel):
    """플랜 생성 요청."""
    pass  # 현재 세션의 장바구니 + 설정을 사용


class PlanListResponse(BaseModel):
    """Top3 추천 플랜 + 비선호 대안 응답."""
    top3: list[Plan] = Field(default_factory=list)
    alternatives: list[Plan] = Field(
        default_factory=list,
        description="비선호 브랜드/몰이지만 더 저렴한 대안",
    )
    headline: str = "선호 브랜드 기준으로 가장 저렴한 선택이에요"
    last_updated: str = ""
