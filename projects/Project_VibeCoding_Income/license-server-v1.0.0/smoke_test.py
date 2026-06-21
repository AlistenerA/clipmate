# Version: v1.0.0
from __future__ import annotations

import argparse
import json
import urllib.error
import urllib.request

from license_server import create_app
from license_server.repository import create_license, revoke_license


def request_json(
    url: str,
    payload: dict | None = None,
    token: str | None = None,
) -> tuple[int, dict]:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    headers = {"Accept": "application/json"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read().decode("utf-8"))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a sanitized live License API smoke test")
    parser.add_argument("--base-url", default="https://cydl.site/api")
    args = parser.parse_args()
    base_url = args.base_url.rstrip("/")
    app = create_app()
    key = ""
    try:
        with app.app_context():
            key = create_license("pro", 1, 30, "deployment-smoke")["license_key"]

        status, body = request_json(f"{base_url}/health")
        require(status == 200 and body.get("success") is True, "health check failed")
        print("health: ok")

        device_1 = "deployment-device-0001"
        device_2 = "deployment-device-0002"
        activation_payload = {
            "license_key": key,
            "device_id": device_1,
            "device_info": "deployment smoke test",
        }
        status, body = request_json(f"{base_url}/licenses/verify", activation_payload)
        require(status == 200 and body["data"]["activated"] is True, "activation failed")
        token = body["data"]["token"]
        print("activate: ok (key masked, token omitted)")

        status, body = request_json(f"{base_url}/licenses/verify", activation_payload)
        require(status == 200 and body["data"]["activated"] is False, "repeat activation failed")
        print("repeat activation: ok")

        status, body = request_json(
            f"{base_url}/licenses/verify",
            {
                "license_key": key,
                "device_id": device_2,
                "device_info": "deployment smoke test",
            },
        )
        require(status == 409 and body.get("error_code") == "DEVICE_LIMIT_REACHED", "device limit failed")
        print("device limit: ok")

        status, body = request_json(
            f"{base_url}/licenses/refresh",
            {"device_id": device_1},
            token,
        )
        require(status == 200 and body.get("success") is True, "refresh failed")
        refreshed_token = body["data"]["token"]
        print("refresh: ok (token omitted)")

        status, body = request_json(
            f"{base_url}/licenses/refresh",
            {"device_id": device_1},
            "invalid-token",
        )
        require(status == 401 and body.get("error_code") == "INVALID_TOKEN", "invalid token failed")
        print("invalid token: ok")

        status, body = request_json(
            f"{base_url}/licenses/deactivate",
            {"device_id": device_1},
            refreshed_token,
        )
        require(status == 200 and body["data"]["deactivated"] is True, "deactivate failed")
        print("deactivate: ok")

        with app.app_context():
            require(revoke_license(key), "failed to revoke smoke license")
        status, body = request_json(f"{base_url}/licenses/verify", activation_payload)
        require(status == 403 and body.get("error_code") == "LICENSE_REVOKED", "revocation failed")
        print("revoke: ok")
        return 0
    finally:
        if key:
            with app.app_context():
                revoke_license(key)


if __name__ == "__main__":
    raise SystemExit(main())
