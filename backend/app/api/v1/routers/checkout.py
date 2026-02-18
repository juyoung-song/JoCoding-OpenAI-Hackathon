"""구매 진행 안내 API 라우터."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/checkout", tags=["구매 진행"])


class CheckoutStartRequest(BaseModel):
    """구매 진행 시작 요청."""
    mart_name: str
    plan_index: int = 0


class CheckoutItem(BaseModel):
    """구매 안내 개별 상품."""
    name: str
    price: int
    link: str | None = None
    status: str = "pending"  # pending | done


class CheckoutStatusResponse(BaseModel):
    """구매 진행 상태 응답."""
    mart_name: str
    items: list[CheckoutItem]
    current_step: int = 0
    total_steps: int = 0
    completed: bool = False
    message: str = ""


@router.post("/start", response_model=CheckoutStatusResponse)
async def start_checkout(request: CheckoutStartRequest):
    """구매 진행을 시작한다.

    실제로는 상품 링크를 순차적으로 안내할 순서를 구성.
    자동 로그인/장바구니 조작/결제는 금지.
    """
    # MVP 스텁 응답
    return CheckoutStatusResponse(
        mart_name=request.mart_name,
        items=[],
        current_step=1,
        total_steps=0,
        completed=False,
        message=f"{request.mart_name}에서 구매를 시작합니다. 상품 링크를 안내해드릴게요.",
    )


@router.get("/status", response_model=CheckoutStatusResponse)
async def get_checkout_status():
    """현재 구매 진행 상태를 조회한다."""
    return CheckoutStatusResponse(
        mart_name="",
        items=[],
        completed=False,
        message="진행 중인 구매가 없습니다.",
    )
