"""쇼핑 환경 설정 API 라우터."""

from fastapi import APIRouter

from app.domain.models.user_preferences import (
    Location,
    OnlineMall,
    TransportMode,
    ShoppingContext,
)
from app.schemas.setup import SetupRequest, SetupResponse

router = APIRouter(prefix="/setup", tags=["쇼핑 환경 설정"])

# 인메모리 임시 저장 (MVP — DB 연동 전)
_current_preferences = ShoppingContext()


@router.get("", response_model=SetupResponse)
async def get_setup():
    """현재 쇼핑 환경 설정을 조회한다."""
    prefs = _current_preferences
    
    # Map dict -> list for online_malls
    malls_list = [
        OnlineMall(name=k, enabled=v) 
        for k, v in prefs.online_malls.items()
    ]
    
    return SetupResponse(
        location=prefs.location,
        transport=TransportMode(prefs.mobility.get("mode", "transit")),
        max_travel_minutes=prefs.mobility.get("max_minutes", 30),
        online_malls=malls_list,
    )


@router.post("", response_model=SetupResponse)
async def save_setup(request: SetupRequest):
    """쇼핑 환경 설정을 저장한다."""
    global _current_preferences
    
    # Map list -> dict for online_malls
    malls_dict = {m.name: m.enabled for m in request.online_malls}
    if not malls_dict:
        malls_dict = _current_preferences.online_malls

    _current_preferences = ShoppingContext(
        location=request.location,
        mobility={"mode": request.transport.value, "max_minutes": request.max_travel_minutes},
        online_malls=malls_dict
    )
    
    return await get_setup()
