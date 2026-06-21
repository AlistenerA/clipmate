# Version: v1.0.0
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import jwt
from flask import current_app

from .errors import ApiError
from .repository import to_iso, utc_now


def issue_token(public_id: str, device_id: str, now: datetime | None = None) -> tuple[str, str]:
    issued_at = (now or utc_now()).astimezone(timezone.utc)
    expires_at = issued_at + timedelta(seconds=current_app.config["TOKEN_TTL_SECONDS"])
    payload = {
        "iss": current_app.config["JWT_ISSUER"],
        "aud": current_app.config["JWT_AUDIENCE"],
        "sub": public_id,
        "device_id": device_id,
        "iat": issued_at,
        "exp": expires_at,
        "jti": str(uuid.uuid4()),
        "ver": 1,
    }
    token = jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")
    return token, to_iso(expires_at)


def decode_token(token: str, allow_refresh_grace: bool = False) -> dict:
    if not token or len(token) > 4096:
        raise ApiError("INVALID_TOKEN", "invalid token", 401)
    try:
        payload = jwt.decode(
            token,
            current_app.config["JWT_SECRET"],
            algorithms=["HS256"],
            issuer=current_app.config["JWT_ISSUER"],
            audience=current_app.config["JWT_AUDIENCE"],
            options={
                "require": ["iss", "aud", "sub", "device_id", "iat", "exp", "jti", "ver"],
                "verify_exp": not allow_refresh_grace,
            },
        )
    except jwt.ExpiredSignatureError as error:
        raise ApiError("TOKEN_EXPIRED", "token has expired", 401) from error
    except jwt.InvalidTokenError as error:
        raise ApiError("INVALID_TOKEN", "invalid token", 401) from error

    if allow_refresh_grace:
        expires_at = datetime.fromtimestamp(int(payload["exp"]), timezone.utc)
        grace = timedelta(seconds=current_app.config["TOKEN_REFRESH_GRACE_SECONDS"])
        if utc_now() > expires_at + grace:
            raise ApiError("TOKEN_EXPIRED", "token refresh grace has expired", 401)
    if payload.get("ver") != 1:
        raise ApiError("INVALID_TOKEN", "unsupported token version", 401)
    return payload
