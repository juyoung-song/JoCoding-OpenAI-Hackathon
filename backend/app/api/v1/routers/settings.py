from fastapi import APIRouter, Depends
from app.domain.models.user_preferences import ShoppingContext
from app.infrastructure.persistence.repositories.shopping_settings_repository import ShoppingSettingsRepository

router = APIRouter(prefix="/settings", tags=["settings"])

def get_repo():
    return ShoppingSettingsRepository()

@router.get("/shopping-context", response_model=ShoppingContext)
async def get_shopping_context(repo: ShoppingSettingsRepository = Depends(get_repo)):
    return await repo.get_context()

@router.put("/shopping-context")
async def update_shopping_context(
    context: ShoppingContext,
    repo: ShoppingSettingsRepository = Depends(get_repo)
):
    await repo.save_context(context)
    return {"status": "ok", "updated_at": context.updated_at}

# --- Proxy / Mock Endpoints for MVP ---

@router.get("/geo/reverse")
async def reverse_geocode(lat: float, lng: float):
    # MVP: Mock Data (Real implementation would call Naver/Kakao Map API)
    return {"address": "서울특별시 강남구 테헤란로 427", "road_address": "테헤란로 427"}

@router.get("/geo/search")
async def search_address(q: str):
    # MVP: Mock Data
    return {
        "items": [
            {"title": "강남구 테헤란로 427", "point": {"x": 127.052, "y": 37.505}},
            {"title": "마포구 성미산로 29", "point": {"x": 126.92, "y": 37.55}},
        ]
    }

@router.get("/weather/current")
async def current_weather(lat: float, lng: float):
    # MVP: Mock Data (Real: KMA API)
    return {"summary": "맑음", "temp": 18.5, "icon": "☀️"}
