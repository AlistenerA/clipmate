# Version: v1.0.0
from __future__ import annotations

from flask import Blueprint, current_app, request

from .errors import ApiError, success
from .repository import deactivate_device, refresh_license, verify_license
from .tokens import decode_token, issue_token

api = Blueprint("api", __name__)


@api.get("/health")
def health():
    return success(
        {
            "status": "ok",
            "version": current_app.config["APP_VERSION"],
        }
    )


@api.post("/licenses/verify")
def verify():
    payload = _json_body({"license_key", "device_id", "device_info"})
    result = verify_license(
        _required_string(payload, "license_key", 64),
        _required_string(payload, "device_id", 128),
        _optional_string(payload, "device_info", 256),
        request.remote_addr or "",
    )
    token, token_expires_at = issue_token(result["public_id"], result["device_id"])
    return success(_public_payload(result, token, token_expires_at), "license verified")


@api.post("/licenses/refresh")
def refresh():
    payload = _json_body({"device_id"})
    token_payload = decode_token(_bearer_token(), allow_refresh_grace=True)
    device_id = _required_string(payload, "device_id", 128)
    if token_payload["device_id"] != device_id:
        raise ApiError("DEVICE_MISMATCH", "token does not belong to this device", 403)
    result = refresh_license(token_payload["sub"], device_id, request.remote_addr or "")
    token, token_expires_at = issue_token(result["public_id"], result["device_id"])
    return success(_public_payload(result, token, token_expires_at), "token refreshed")


@api.post("/licenses/deactivate")
def deactivate():
    payload = _json_body({"device_id"})
    token_payload = decode_token(_bearer_token(), allow_refresh_grace=True)
    device_id = _required_string(payload, "device_id", 128)
    if token_payload["device_id"] != device_id:
        raise ApiError("DEVICE_MISMATCH", "token does not belong to this device", 403)
    deactivate_device(token_payload["sub"], device_id)
    return success({"deactivated": True}, "device deactivated")


def _json_body(allowed_keys: set[str]) -> dict:
    if not request.is_json:
        raise ApiError("INVALID_REQUEST", "content type must be application/json", 415)
    payload = request.get_json(silent=False)
    if not isinstance(payload, dict):
        raise ApiError("INVALID_REQUEST", "request body must be a JSON object", 400)
    unknown = set(payload) - allowed_keys
    if unknown:
        raise ApiError("INVALID_REQUEST", "request contains unknown fields", 400)
    return payload


def _required_string(payload: dict, key: str, max_length: int) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip() or len(value) > max_length:
        raise ApiError("INVALID_REQUEST", f"{key} is required", 400)
    return value


def _optional_string(payload: dict, key: str, max_length: int) -> str:
    value = payload.get(key, "")
    if not isinstance(value, str) or len(value) > max_length:
        raise ApiError("INVALID_REQUEST", f"{key} is invalid", 400)
    return value


def _bearer_token() -> str:
    header = request.headers.get("Authorization", "")
    scheme, separator, token = header.partition(" ")
    if not separator or scheme.lower() != "bearer" or not token.strip():
        raise ApiError("INVALID_TOKEN", "bearer token is required", 401)
    return token.strip()


def _public_payload(result: dict, token: str, token_expires_at: str) -> dict:
    return {
        "activated": result.get("activated", True),
        "plan": result["plan"],
        "features": result["features"],
        "token": token,
        "token_expires_at": token_expires_at,
        "license_expires_at": result["license_expires_at"],
        "active_devices": result["active_devices"],
        "max_devices": result["max_devices"],
    }
