from __future__ import annotations

from dataclasses import dataclass

from fastapi import Header, HTTPException, Request, status

from src.core.config import settings
from src.core.security import TokenValidationError, validate_session_token
from src.infrastructure.persistence.user_repository import UserRepository


@dataclass(frozen=True)
class AuthUser:
    user_id: str
    email: str
    name: str | None
    session_id: str


def _unauthorized(detail: str = "Unauthorized") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def require_auth(
    request: Request,
    authorization: str | None = Header(default=None),
) -> AuthUser:
    if not authorization:
        raise _unauthorized("Missing Authorization header")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise _unauthorized("Invalid authorization scheme")

    try:
        claims = validate_session_token(
            token.strip(),
            expected_type="access",
            secret=settings.jwt_secret,
            issuer=settings.jwt_issuer,
        )
    except TokenValidationError as exc:
        raise _unauthorized(str(exc)) from exc

    db = getattr(request.app.state, "db", None)
    if db is None:
        raise _unauthorized("Service unavailable")

    repo = UserRepository(db)
    session = await repo.get_session(claims.sid)
    if not session:
        raise _unauthorized("Session not found")

    if session.get("revoked_at"):
        raise _unauthorized("Session revoked")

    user = await repo.get_user_by_id(claims.sub)
    if not user or not int(user.get("is_active", 0)):
        raise _unauthorized("User not available")

    await repo.touch_session(claims.sid)

    return AuthUser(
        user_id=claims.sub,
        email=str(user.get("email") or ""),
        name=user.get("name"),
        session_id=claims.sid,
    )
