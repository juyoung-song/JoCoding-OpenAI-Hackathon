from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from typing import Any


class TokenValidationError(ValueError):
    """JWT 토큰 검증 실패."""


@dataclass(frozen=True)
class JwtPayload:
    sub: str
    sid: str
    typ: str
    exp: int
    iat: int
    iss: str
    raw: dict[str, Any]


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _sign(message: bytes, secret: str) -> str:
    digest = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).digest()
    return _b64url_encode(digest)


def create_jwt(payload: dict[str, Any], secret: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = _sign(signing_input, secret)
    return f"{header_b64}.{payload_b64}.{signature}"


def decode_jwt(token: str, secret: str) -> dict[str, Any]:
    try:
        header_b64, payload_b64, signature = token.split(".")
    except ValueError as exc:
        raise TokenValidationError("invalid token format") from exc

    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    expected_sig = _sign(signing_input, secret)
    if not hmac.compare_digest(signature, expected_sig):
        raise TokenValidationError("invalid signature")

    try:
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    except Exception as exc:
        raise TokenValidationError("invalid payload") from exc

    if not isinstance(payload, dict):
        raise TokenValidationError("invalid payload type")

    return payload


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session_token(
    *,
    user_id: str,
    session_id: str,
    token_type: str,
    ttl_seconds: int,
    secret: str,
    issuer: str,
    extra: dict[str, Any] | None = None,
) -> str:
    now = int(time.time())
    payload: dict[str, Any] = {
        "sub": user_id,
        "sid": session_id,
        "typ": token_type,
        "iat": now,
        "exp": now + max(1, ttl_seconds),
        "iss": issuer,
    }
    if extra:
        payload.update(extra)
    return create_jwt(payload, secret)


def validate_session_token(
    token: str,
    *,
    expected_type: str,
    secret: str,
    issuer: str,
) -> JwtPayload:
    payload = decode_jwt(token, secret)

    required = ("sub", "sid", "typ", "exp", "iat", "iss")
    for key in required:
        if key not in payload:
            raise TokenValidationError(f"missing claim: {key}")

    if payload["typ"] != expected_type:
        raise TokenValidationError("invalid token type")

    if payload["iss"] != issuer:
        raise TokenValidationError("invalid issuer")

    now = int(time.time())
    if int(payload["exp"]) <= now:
        raise TokenValidationError("token expired")

    return JwtPayload(
        sub=str(payload["sub"]),
        sid=str(payload["sid"]),
        typ=str(payload["typ"]),
        exp=int(payload["exp"]),
        iat=int(payload["iat"]),
        iss=str(payload["iss"]),
        raw=payload,
    )