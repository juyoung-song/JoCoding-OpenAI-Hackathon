from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, Field

from src.api.v1.dependencies import AuthUser, require_auth
from src.core.config import settings
from src.infrastructure.persistence.user_repository import UserRepository

router = APIRouter(prefix="/payments", tags=["payments"])


class CreatePaymentIntentRequest(BaseModel):
    request_id: str | None = None
    amount_won: int = Field(..., gt=0)
    currency: str = "KRW"
    mall_name: str
    plan_type: str | None = None
    budget_cap_won: int | None = Field(default=None, gt=0)
    allowed_malls: list[str] | None = None


class PaymentIntentResponse(BaseModel):
    intent_id: str
    request_id: str | None = None
    amount_won: int
    currency: str
    mall_name: str
    plan_type: str | None = None
    status: str
    client_secret: str
    created_at: str
    updated_at: str
    confirmed_at: str | None = None


class ConfirmPaymentIntentRequest(BaseModel):
    payment_method_token: str | None = None
    simulate_result: Literal["success", "fail"] = "success"


def _serialize_intent(intent: dict) -> PaymentIntentResponse:
    return PaymentIntentResponse(
        intent_id=str(intent.get("intent_id")),
        request_id=intent.get("request_id"),
        amount_won=int(intent.get("amount_won") or 0),
        currency=str(intent.get("currency") or "KRW"),
        mall_name=str(intent.get("mall_name") or ""),
        plan_type=intent.get("plan_type"),
        status=str(intent.get("status") or "requires_confirmation"),
        client_secret=f"sandbox_secret_{intent.get('intent_id')}",
        created_at=str(intent.get("created_at") or ""),
        updated_at=str(intent.get("updated_at") or ""),
        confirmed_at=intent.get("confirmed_at"),
    )


def _validate_guardrails(payload: CreatePaymentIntentRequest) -> None:
    if payload.budget_cap_won is not None and payload.amount_won > payload.budget_cap_won:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "BUDGET_CAP_EXCEEDED",
                "message": "예산 상한을 초과한 결제는 승인할 수 없습니다.",
            },
        )

    if payload.allowed_malls:
        normalized_allowed = {value.strip().lower() for value in payload.allowed_malls if value.strip()}
        if normalized_allowed and payload.mall_name.strip().lower() not in normalized_allowed:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "MALL_NOT_ALLOWED",
                    "message": "허용되지 않은 판매처입니다.",
                },
            )


@router.post("/intents", response_model=PaymentIntentResponse)
async def create_payment_intent(
    payload: CreatePaymentIntentRequest,
    request: Request,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    current_user: AuthUser = Depends(require_auth),
):
    _validate_guardrails(payload)

    repo = UserRepository(request.app.state.db)
    if idempotency_key:
        existing = await repo.find_payment_intent_by_idempotency(
            user_id=current_user.user_id,
            idempotency_key=idempotency_key,
        )
        if existing:
            return _serialize_intent(existing)

    intent_id = f"pi_{uuid4().hex[:20]}"
    now = datetime.now(timezone.utc).isoformat()

    await repo.create_payment_intent(
        intent_id=intent_id,
        user_id=current_user.user_id,
        request_id=payload.request_id,
        amount_won=payload.amount_won,
        currency=payload.currency,
        mall_name=payload.mall_name,
        plan_type=payload.plan_type,
        status="requires_confirmation",
        idempotency_key=idempotency_key,
        payload={
            **payload.model_dump(mode="json"),
            "auth_user_id": current_user.user_id,
            "issuer": settings.jwt_issuer,
        },
    )

    created = await repo.get_payment_intent(intent_id=intent_id, user_id=current_user.user_id)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create payment intent")

    created.setdefault("created_at", now)
    created.setdefault("updated_at", now)
    return _serialize_intent(created)


@router.get("/intents/{intent_id}", response_model=PaymentIntentResponse)
async def get_payment_intent(
    intent_id: str,
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)
    intent = await repo.get_payment_intent(intent_id=intent_id, user_id=current_user.user_id)
    if not intent:
        raise HTTPException(status_code=404, detail="Payment intent not found")
    return _serialize_intent(intent)


@router.post("/intents/{intent_id}/confirm", response_model=PaymentIntentResponse)
async def confirm_payment_intent(
    intent_id: str,
    payload: ConfirmPaymentIntentRequest,
    request: Request,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)
    intent = await repo.get_payment_intent(intent_id=intent_id, user_id=current_user.user_id)
    if not intent:
        raise HTTPException(status_code=404, detail="Payment intent not found")

    current_status = str(intent.get("status") or "")
    if current_status in {"succeeded", "failed", "canceled"}:
        return _serialize_intent(intent)

    if payload.simulate_result == "fail":
        updated = await repo.update_payment_intent_status(
            intent_id=intent_id,
            user_id=current_user.user_id,
            status="failed",
            result={
                "reason": "sandbox_declined",
                "payment_method_token": bool(payload.payment_method_token),
            },
            confirmed=True,
        )
    else:
        updated = await repo.update_payment_intent_status(
            intent_id=intent_id,
            user_id=current_user.user_id,
            status="succeeded",
            result={
                "sandbox_transaction_id": f"txn_{uuid4().hex[:12]}",
                "payment_method_token": bool(payload.payment_method_token),
            },
            confirmed=True,
        )

    if not updated:
        raise HTTPException(status_code=500, detail="Failed to confirm payment intent")
    return _serialize_intent(updated)