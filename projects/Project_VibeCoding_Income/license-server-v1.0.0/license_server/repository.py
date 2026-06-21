# Version: v1.0.0
from __future__ import annotations

import re
import secrets
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone

from .db import get_db
from .errors import ApiError

KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
KEY_PATTERN = re.compile(r"^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}(?:-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}){3}$")
DEVICE_PATTERN = re.compile(r"^[A-Za-z0-9._:-]{8,128}$")
VALID_PLANS = {"pro", "lifetime"}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def to_iso(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)


def normalize_key(value: str) -> str:
    return value.strip().upper()


def validate_key(value: str) -> str:
    normalized = normalize_key(value)
    if not KEY_PATTERN.fullmatch(normalized):
        raise ApiError("INVALID_LICENSE_KEY", "invalid license key format", 400)
    return normalized


def validate_device_id(value: str) -> str:
    normalized = value.strip()
    if not DEVICE_PATTERN.fullmatch(normalized):
        raise ApiError("INVALID_DEVICE_ID", "invalid device id", 400)
    return normalized


def generate_license_key() -> str:
    return "-".join(
        "".join(secrets.choice(KEY_ALPHABET) for _ in range(4))
        for _ in range(4)
    )


def create_license(
    plan: str,
    max_devices: int,
    days: int | None,
    remark: str = "",
) -> dict:
    plan = plan.strip().lower()
    if plan not in VALID_PLANS:
        raise ValueError("plan must be pro or lifetime")
    if not 1 <= max_devices <= 20:
        raise ValueError("devices must be between 1 and 20")
    if len(remark) > 200:
        raise ValueError("remark must be 200 characters or fewer")
    if plan == "pro" and (days is None or not 1 <= days <= 3650):
        raise ValueError("pro licenses require days between 1 and 3650")
    if plan == "lifetime" and days is not None:
        raise ValueError("lifetime licenses must not set days")

    now = utc_now()
    expires_at = to_iso(now + timedelta(days=days)) if days is not None else None
    connection = get_db()
    for _attempt in range(5):
        key = generate_license_key()
        try:
            connection.execute(
                """
                INSERT INTO licenses(
                    public_id, license_key, plan, status, max_devices,
                    total_activations, remark, created_at, expires_at
                ) VALUES (?, ?, ?, 1, ?, 0, ?, ?, ?)
                """,
                (str(uuid.uuid4()), key, plan, max_devices, remark, to_iso(now), expires_at),
            )
            connection.commit()
            return {
                "license_key": key,
                "plan": plan,
                "max_devices": max_devices,
                "expires_at": expires_at,
                "remark": remark,
            }
        except sqlite3.IntegrityError:
            continue
    raise RuntimeError("failed to generate a unique license key")


def list_licenses() -> list[dict]:
    connection = get_db()
    rows = connection.execute(
        """
        SELECT l.*, COUNT(d.id) AS active_devices
        FROM licenses l
        LEFT JOIN devices d ON d.license_id = l.id
        GROUP BY l.id
        ORDER BY l.created_at DESC
        """
    ).fetchall()
    result = []
    for row in rows:
        status = _effective_status(row)
        if status != row["status"]:
            connection.execute("UPDATE licenses SET status = ? WHERE id = ?", (status, row["id"]))
        result.append(
            {
                "license_key": row["license_key"],
                "plan": row["plan"],
                "status": status,
                "active_devices": row["active_devices"],
                "max_devices": row["max_devices"],
                "total_activations": row["total_activations"],
                "expires_at": row["expires_at"],
                "remark": row["remark"],
            }
        )
    connection.commit()
    return result


def revoke_license(license_key: str) -> bool:
    key = validate_key(license_key)
    connection = get_db()
    cursor = connection.execute(
        "UPDATE licenses SET status = 0 WHERE license_key = ?",
        (key,),
    )
    connection.commit()
    return cursor.rowcount > 0


def verify_license(
    license_key: str,
    device_id: str,
    device_info: str,
    ip_address: str,
) -> dict:
    key = validate_key(license_key)
    device_id = validate_device_id(device_id)
    device_info = device_info.strip()
    if len(device_info) > 256:
        raise ApiError("INVALID_DEVICE_INFO", "device info is too long", 400)

    connection = get_db()
    try:
        connection.execute("BEGIN IMMEDIATE")
        license_row = connection.execute(
            "SELECT * FROM licenses WHERE license_key = ?",
            (key,),
        ).fetchone()
        license_row = _require_active_license(connection, license_row)
        now = to_iso(utc_now())
        device = connection.execute(
            "SELECT id FROM devices WHERE license_id = ? AND device_id = ?",
            (license_row["id"], device_id),
        ).fetchone()
        activated = device is None
        if device is None:
            count = connection.execute(
                "SELECT COUNT(*) FROM devices WHERE license_id = ?",
                (license_row["id"],),
            ).fetchone()[0]
            if count >= license_row["max_devices"]:
                raise ApiError("DEVICE_LIMIT_REACHED", "device limit reached", 409)
            connection.execute(
                """
                INSERT INTO devices(
                    license_id, device_id, device_info, ip_address,
                    last_verified_at, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (license_row["id"], device_id, device_info, ip_address, now, now),
            )
            connection.execute(
                "UPDATE licenses SET total_activations = total_activations + 1 WHERE id = ?",
                (license_row["id"],),
            )
        else:
            connection.execute(
                """
                UPDATE devices
                SET device_info = ?, ip_address = ?, last_verified_at = ?
                WHERE id = ?
                """,
                (device_info, ip_address, now, device["id"]),
            )
        result = _license_payload(connection, license_row, device_id)
        result["activated"] = activated
        connection.commit()
        return result
    except Exception:
        connection.rollback()
        raise


def refresh_license(public_id: str, device_id: str, ip_address: str) -> dict:
    device_id = validate_device_id(device_id)
    connection = get_db()
    try:
        connection.execute("BEGIN IMMEDIATE")
        license_row = connection.execute(
            "SELECT * FROM licenses WHERE public_id = ?",
            (public_id,),
        ).fetchone()
        license_row = _require_active_license(connection, license_row)
        cursor = connection.execute(
            """
            UPDATE devices SET ip_address = ?, last_verified_at = ?
            WHERE license_id = ? AND device_id = ?
            """,
            (ip_address, to_iso(utc_now()), license_row["id"], device_id),
        )
        if cursor.rowcount == 0:
            raise ApiError("DEVICE_NOT_FOUND", "device is not activated", 403)
        result = _license_payload(connection, license_row, device_id)
        connection.commit()
        return result
    except Exception:
        connection.rollback()
        raise


def deactivate_device(public_id: str, device_id: str) -> None:
    device_id = validate_device_id(device_id)
    connection = get_db()
    try:
        connection.execute("BEGIN IMMEDIATE")
        license_row = connection.execute(
            "SELECT * FROM licenses WHERE public_id = ?",
            (public_id,),
        ).fetchone()
        if license_row is None:
            raise ApiError("INVALID_TOKEN", "license no longer exists", 401)
        cursor = connection.execute(
            "DELETE FROM devices WHERE license_id = ? AND device_id = ?",
            (license_row["id"], device_id),
        )
        if cursor.rowcount == 0:
            raise ApiError("DEVICE_NOT_FOUND", "device is not activated", 404)
        connection.commit()
    except Exception:
        connection.rollback()
        raise


def _require_active_license(connection, row):
    if row is None:
        raise ApiError("LICENSE_NOT_FOUND", "license not found", 404)
    status = _effective_status(row)
    if status != row["status"]:
        connection.execute("UPDATE licenses SET status = ? WHERE id = ?", (status, row["id"]))
    if status == 0:
        raise ApiError("LICENSE_REVOKED", "license has been revoked", 403)
    if status == 2:
        raise ApiError("LICENSE_EXPIRED", "license has expired", 403)
    return row


def _effective_status(row) -> int:
    if row["status"] == 0:
        return 0
    expires_at = parse_iso(row["expires_at"])
    if expires_at is not None and expires_at <= utc_now():
        return 2
    return 1


def _license_payload(connection, license_row, device_id: str) -> dict:
    features = [
        row[0]
        for row in connection.execute(
            "SELECT feature_key FROM plan_features WHERE plan = ? ORDER BY feature_key",
            (license_row["plan"],),
        ).fetchall()
    ]
    active_devices = connection.execute(
        "SELECT COUNT(*) FROM devices WHERE license_id = ?",
        (license_row["id"],),
    ).fetchone()[0]
    return {
        "public_id": license_row["public_id"],
        "device_id": device_id,
        "plan": license_row["plan"],
        "features": features,
        "license_expires_at": license_row["expires_at"],
        "active_devices": active_devices,
        "max_devices": license_row["max_devices"],
    }
