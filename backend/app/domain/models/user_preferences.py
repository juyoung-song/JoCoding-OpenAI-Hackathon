"""사용자 설정 도메인 모델."""

from enum import Enum

from pydantic import BaseModel, Field


class TransportMode(str, Enum):
    """이동 수단."""
    WALK = "walk"          # 도보
    TRANSIT = "transit"    # 대중교통
    CAR = "car"            # 자차


class Location(BaseModel):
    """위치 정보 (주소 + 좌표)."""
    address: str = Field("", description="주소 문자열")
    lat: float = Field(0.0, description="위도")
    lng: float = Field(0.0, description="경도")
    source: str = Field("unknown", description="gps | search")


class OnlineMall(BaseModel):
    """온라인 쇼핑몰 선호 설정."""
    name: str
    description: str = ""
    enabled: bool = True


class ShoppingContext(BaseModel):
    """쇼핑 환경 설정 (단일 진실)."""
    location: Location = Field(default_factory=Location)
    mobility: dict = Field(default_factory=lambda: {"mode": "walk", "max_minutes": 30})
    online_malls: dict = Field(default_factory=lambda: {"naver": True, "coupang": True, "kurly": False})
    updated_at: str | None = None

    class Config:
        populate_by_name = True
