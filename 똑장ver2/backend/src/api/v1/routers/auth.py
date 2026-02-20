from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

from src.api.v1.dependencies import AuthUser, require_auth
from src.core.config import settings
from src.core.security import (
    TokenValidationError,
    create_session_token,
    hash_token,
    validate_session_token,
)
from src.infrastructure.persistence.user_repository import UserRepository

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    name: str | None = Field(default=None, max_length=50)


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str | None = None


class AuthMeResponse(BaseModel):
    user_id: str
    email: str
    name: str | None = None


class AuthTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: AuthMeResponse


def _refresh_expires_at() -> str:
    return (datetime.now(timezone.utc) + timedelta(seconds=settings.jwt_refresh_ttl_seconds)).isoformat()


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


async def _issue_token_pair(
    *,
    repo: UserRepository,
    user_id: str,
    user_email: str,
    user_name: str | None,
    session_id: str,
    user_agent: str | None,
    ip_address: str | None,
    rotate_existing_session: bool,
) -> AuthTokenResponse:
    access_token = create_session_token(
        user_id=user_id,
        session_id=session_id,
        token_type="access",
        ttl_seconds=settings.jwt_access_ttl_seconds,
        secret=settings.jwt_secret,
        issuer=settings.jwt_issuer,
    )
    refresh_token = create_session_token(
        user_id=user_id,
        session_id=session_id,
        token_type="refresh",
        ttl_seconds=settings.jwt_refresh_ttl_seconds,
        secret=settings.jwt_secret,
        issuer=settings.jwt_issuer,
    )

    refresh_hash = hash_token(refresh_token)
    expires_at = _refresh_expires_at()

    if rotate_existing_session:
        await repo.rotate_refresh_token(
            session_id=session_id,
            refresh_token_hash=refresh_hash,
            refresh_expires_at=expires_at,
        )
    else:
        await repo.create_session(
            session_id=session_id,
            user_id=user_id,
            refresh_token_hash=refresh_hash,
            refresh_expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address,
        )

    return AuthTokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.jwt_access_ttl_seconds,
        user=AuthMeResponse(user_id=user_id, email=user_email, name=user_name),
    )


@router.post("/login", response_model=AuthTokenResponse)
async def login(payload: LoginRequest, request: Request):
    normalized_email = payload.email.strip().lower()
    if "@" not in normalized_email or normalized_email.startswith("@") or normalized_email.endswith("@"):
        raise HTTPException(status_code=400, detail="Invalid email")

    db = request.app.state.db
    repo = UserRepository(db)

    user = await repo.ensure_user(email=normalized_email, name=payload.name)
    if not user:
        raise HTTPException(status_code=500, detail="Failed to create user")

    session_id = f"sess-{uuid4().hex}"
    return await _issue_token_pair(
        repo=repo,
        user_id=str(user["user_id"]),
        user_email=str(user.get("email") or normalized_email),
        user_name=user.get("name"),
        session_id=session_id,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
        rotate_existing_session=False,
    )


@router.post("/refresh", response_model=AuthTokenResponse)
async def refresh(payload: RefreshRequest, request: Request):
    try:
        claims = validate_session_token(
            payload.refresh_token,
            expected_type="refresh",
            secret=settings.jwt_secret,
            issuer=settings.jwt_issuer,
        )
    except TokenValidationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    repo = UserRepository(request.app.state.db)
    session = await repo.get_session(claims.sid)
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session not found")

    if session.get("revoked_at"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session revoked")

    expires_at = _parse_datetime(session.get("refresh_expires_at"))
    if not expires_at or expires_at <= datetime.now(timezone.utc):
        await repo.revoke_session(claims.sid)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

    if hash_token(payload.refresh_token) != session.get("refresh_token_hash"):
        await repo.revoke_session(claims.sid)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = await repo.get_user_by_id(claims.sub)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return await _issue_token_pair(
        repo=repo,
        user_id=str(user["user_id"]),
        user_email=str(user.get("email") or ""),
        user_name=user.get("name"),
        session_id=claims.sid,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
        rotate_existing_session=True,
    )


@router.post("/logout")
async def logout(
    request: Request,
    payload: LogoutRequest,
    current_user: AuthUser = Depends(require_auth),
):
    repo = UserRepository(request.app.state.db)

    target_session_id = current_user.session_id
    if payload.refresh_token:
        try:
            refresh_claims = validate_session_token(
                payload.refresh_token,
                expected_type="refresh",
                secret=settings.jwt_secret,
                issuer=settings.jwt_issuer,
            )
            if refresh_claims.sub == current_user.user_id:
                target_session_id = refresh_claims.sid
        except TokenValidationError:
            pass

    await repo.revoke_session(target_session_id)
    return {"status": "ok"}


@router.get("/me", response_model=AuthMeResponse)
async def me(current_user: AuthUser = Depends(require_auth)):
    return AuthMeResponse(
        user_id=current_user.user_id,
        email=current_user.email,
        name=current_user.name,
    )
