from datetime import datetime
from fastapi import APIRouter, Depends
from app.application.usecases.generate_plans import generate_plans
from app.domain.models.basket import Basket
from app.domain.models.user_preferences import ShoppingContext
from app.infrastructure.persistence.repositories.shopping_settings_repository import ShoppingSettingsRepository
from app.schemas.plan import PlanListResponse

router = APIRouter(prefix="/plans", tags=["추천 플랜"])

# 다른 라우터의 인메모리 데이터 참조 (MVP 임시)
from app.api.v1.routers.basket import _basket

# 캐시된 마지막 플랜
_last_result: PlanListResponse | None = None

def get_settings_repo():
    return ShoppingSettingsRepository()

@router.post("/generate", response_model=PlanListResponse)
async def generate(settings_repo: ShoppingSettingsRepository = Depends(get_settings_repo)):
    """장바구니 기반으로 Top3 추천 플랜을 생성한다."""
    global _last_result

    # Repository에서 최신 ShoppingContext 조회
    context = await settings_repo.get_context()

    # generate_plans는 (items, context)를 받음
    plans_result = await generate_plans(_basket.items, context)
    
    # generate_plans가 list[Plan]을 반환 (Top3 + Alternatives)
    top3 = plans_result[:3]
    alternatives = plans_result[3:]

    now = datetime.now().strftime("%H:%M")

    # 동적 헤드라인
    if top3:
        cheapest = top3[0]
        headline = f"{cheapest.mart_name}에서 {cheapest.estimated_total:,}원이 최저가에요"
    else:
        headline = "장바구니에 품목을 추가해주세요"

    _last_result = PlanListResponse(
        top3=top3,
        alternatives=alternatives,
        headline=headline,
        last_updated=f"오늘 {now} 기준",
    )
    return _last_result


@router.get("", response_model=PlanListResponse)
async def get_plans():
    """마지막으로 생성된 플랜을 조회한다 (캐시)."""
    if _last_result:
        return _last_result
    return PlanListResponse(
        headline="아직 분석이 시작되지 않았습니다.",
    )
