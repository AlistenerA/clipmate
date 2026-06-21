from __future__ import annotations

from datetime import timedelta
from concurrent.futures import ThreadPoolExecutor

from license_server.db import get_db
from license_server.repository import create_license, to_iso, utc_now
from license_server.tokens import issue_token

DEVICE_1 = "device-00000001"
DEVICE_2 = "device-00000002"


def create_key(app, *, devices=1, days=30):
    with app.app_context():
        return create_license("pro", devices, days, "test")["license_key"]


def activate(client, key, device_id=DEVICE_1):
    return client.post(
        "/api/licenses/verify",
        json={
            "license_key": key,
            "device_id": device_id,
            "device_info": "Chrome test",
        },
    )


def test_health_returns_version(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json == {
        "success": True,
        "data": {"status": "ok", "version": "v1.0.0"},
        "message": "ok",
    }
    assert response.headers["Cache-Control"] == "no-store"


def test_activation_and_repeat_do_not_consume_another_slot(app, client):
    key = create_key(app)
    first = activate(client, key)
    second = activate(client, key)
    assert first.status_code == 200
    assert first.json["data"]["activated"] is True
    assert second.status_code == 200
    assert second.json["data"]["activated"] is False
    assert second.json["data"]["active_devices"] == 1
    assert second.json["data"]["features"] == ["ai_summary", "batch_save"]
    with app.app_context():
        row = get_db().execute(
            "SELECT total_activations FROM licenses WHERE license_key = ?", (key,)
        ).fetchone()
        assert row[0] == 1


def test_device_limit_is_enforced(app, client):
    key = create_key(app, devices=1)
    assert activate(client, key, DEVICE_1).status_code == 200
    response = activate(client, key, DEVICE_2)
    assert response.status_code == 409
    assert response.json["error_code"] == "DEVICE_LIMIT_REACHED"


def test_concurrent_activation_cannot_over_allocate_device_slots(app):
    key = create_key(app, devices=1)

    def activate_device(device_id):
        with app.test_client() as thread_client:
            return activate(thread_client, key, device_id).status_code

    with ThreadPoolExecutor(max_workers=2) as executor:
        statuses = sorted(executor.map(activate_device, [DEVICE_1, DEVICE_2]))

    assert statuses == [200, 409]


def test_refresh_rotates_token(app, client):
    key = create_key(app)
    activated = activate(client, key).json["data"]
    response = client.post(
        "/api/licenses/refresh",
        json={"device_id": DEVICE_1},
        headers={"Authorization": f"Bearer {activated['token']}"},
    )
    assert response.status_code == 200
    assert response.json["data"]["token"] != activated["token"]


def test_invalid_token_is_rejected(client):
    response = client.post(
        "/api/licenses/refresh",
        json={"device_id": DEVICE_1},
        headers={"Authorization": "Bearer invalid"},
    )
    assert response.status_code == 401
    assert response.json["error_code"] == "INVALID_TOKEN"


def test_recently_expired_token_can_refresh_within_grace(app, client):
    key = create_key(app)
    activate(client, key)
    with app.app_context():
        public_id = get_db().execute(
            "SELECT public_id FROM licenses WHERE license_key = ?", (key,)
        ).fetchone()[0]
        token, _ = issue_token(public_id, DEVICE_1, utc_now() - timedelta(days=2))
    response = client.post(
        "/api/licenses/refresh",
        json={"device_id": DEVICE_1},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


def test_token_older_than_grace_is_rejected(app, client):
    key = create_key(app)
    activate(client, key)
    with app.app_context():
        public_id = get_db().execute(
            "SELECT public_id FROM licenses WHERE license_key = ?", (key,)
        ).fetchone()[0]
        token, _ = issue_token(public_id, DEVICE_1, utc_now() - timedelta(days=9))
    response = client.post(
        "/api/licenses/refresh",
        json={"device_id": DEVICE_1},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 401
    assert response.json["error_code"] == "TOKEN_EXPIRED"


def test_expired_and_revoked_license_are_rejected(app, client):
    expired_key = create_key(app)
    revoked_key = create_key(app)
    with app.app_context():
        connection = get_db()
        connection.execute(
            "UPDATE licenses SET expires_at = ? WHERE license_key = ?",
            (to_iso(utc_now() - timedelta(seconds=1)), expired_key),
        )
        connection.execute(
            "UPDATE licenses SET status = 0 WHERE license_key = ?", (revoked_key,)
        )
        connection.commit()
    expired = activate(client, expired_key)
    revoked = activate(client, revoked_key)
    assert expired.status_code == 403
    assert expired.json["error_code"] == "LICENSE_EXPIRED"
    assert revoked.status_code == 403
    assert revoked.json["error_code"] == "LICENSE_REVOKED"


def test_deactivate_frees_device_slot(app, client):
    key = create_key(app)
    data = activate(client, key, DEVICE_1).json["data"]
    response = client.post(
        "/api/licenses/deactivate",
        json={"device_id": DEVICE_1},
        headers={"Authorization": f"Bearer {data['token']}"},
    )
    assert response.status_code == 200
    assert response.json["data"]["deactivated"] is True
    assert activate(client, key, DEVICE_2).status_code == 200


def test_request_validation_is_strict(app, client):
    key = create_key(app)
    unknown = client.post(
        "/api/licenses/verify",
        json={
            "license_key": key,
            "device_id": DEVICE_1,
            "device_info": "test",
            "unexpected": True,
        },
    )
    invalid_key = activate(client, "OOOO-1111-BBBB-CCCC")
    assert unknown.status_code == 400
    assert unknown.json["error_code"] == "INVALID_REQUEST"
    assert invalid_key.status_code == 400
    assert invalid_key.json["error_code"] == "INVALID_LICENSE_KEY"
