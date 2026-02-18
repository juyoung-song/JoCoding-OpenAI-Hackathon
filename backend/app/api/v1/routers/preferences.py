from fastapi import APIRouter, Depends, HTTPException
from app.schemas.preference import SetBrandPreferenceRequest, BrandPreferenceResponse
from app.infrastructure.persistence.repositories.preference_repository import PreferredBrandRepository
from app.domain.models.preferences import PreferredBrand

router = APIRouter(prefix="/preferences", tags=["preferences"])

def get_repository():
    return PreferredBrandRepository()

@router.get("/brands/{canonical_item_id}", response_model=BrandPreferenceResponse)
async def get_brand_preference(
    user_id: str, 
    canonical_item_id: str,
    repo: PreferredBrandRepository = Depends(get_repository)
):
    """특정 품목(Canonical ID)에 대한 선호 브랜드를 조회한다."""
    pref = await repo.get(user_id, canonical_item_id)
    if not pref:
        raise HTTPException(status_code=404, detail="Preference not found")
    
    return BrandPreferenceResponse(
        user_id=pref.user_id,
        canonical_item_id=pref.canonical_item_id,
        preferred_brand=pref.preferred_brand,
        preferred_variant=pref.preferred_variant,
        updated_at=pref.updated_at
    )

@router.post("/brands", response_model=BrandPreferenceResponse)
async def set_brand_preference(
    req: SetBrandPreferenceRequest,
    repo: PreferredBrandRepository = Depends(get_repository)
):
    """선호 브랜드를 설정(저장/업데이트)한다."""
    pref = PreferredBrand(
        user_id=req.user_id,
        canonical_item_id=req.canonical_item_id,
        preferred_brand=req.preferred_brand,
        preferred_variant=req.preferred_variant
    )
    await repo.set(pref)
    
    # 저장된 값 확인을 위해 다시 조회 (또는 입력값 반환)
    saved = await repo.get(req.user_id, req.canonical_item_id)
    return BrandPreferenceResponse(
        user_id=saved.user_id,
        canonical_item_id=saved.canonical_item_id,
        preferred_brand=saved.preferred_brand,
        preferred_variant=saved.preferred_variant,
        updated_at=saved.updated_at
    )

router.add_api_route("/brands/{canonical_item_id}", get_brand_preference, methods=["GET"])
router.add_api_route("/brands", set_brand_preference, methods=["POST"])
