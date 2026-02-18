"""쇼핑 환경 설정 관련 스키마."""

from pydantic import BaseModel, Field

from app.domain.models.user_preferences import (
    Location,
    OnlineMall,
    TransportMode,
)


class SetupRequest(BaseModel):
    """쇼핑 환경 설정 저장 요청."""
    location: Location
    transport: TransportMode = TransportMode.TRANSIT
    max_travel_minutes: int = Field(30, ge=5, le=60)
    online_malls: list[OnlineMall] = Field(default_factory=list)


class SetupResponse(BaseModel):
    """쇼핑 환경 설정 응답."""
    success: bool = True
    message: str = "설정이 저장되었습니다."
    location: Location
    transport: TransportMode
    max_travel_minutes: int
    online_malls: list[OnlineMall]
