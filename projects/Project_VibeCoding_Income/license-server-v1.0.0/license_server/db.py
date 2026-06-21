# Version: v1.0.0
from __future__ import annotations

import sqlite3
from pathlib import Path

from flask import current_app, g

SCHEMA_VERSION = "1"

SCHEMA = """
CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT NOT NULL UNIQUE,
    license_key TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL CHECK (plan IN ('pro', 'lifetime')),
    status INTEGER NOT NULL DEFAULT 1 CHECK (status IN (0, 1, 2)),
    max_devices INTEGER NOT NULL CHECK (max_devices > 0),
    total_activations INTEGER NOT NULL DEFAULT 0 CHECK (total_activations >= 0),
    remark TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    expires_at TEXT
);

CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_id INTEGER NOT NULL,
    device_id TEXT NOT NULL,
    device_info TEXT NOT NULL DEFAULT '',
    ip_address TEXT NOT NULL DEFAULT '',
    last_verified_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE (license_id, device_id),
    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plan_features (
    plan TEXT NOT NULL,
    feature_key TEXT NOT NULL,
    PRIMARY KEY (plan, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_devices_license_id ON devices(license_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);

INSERT OR IGNORE INTO plan_features(plan, feature_key) VALUES
    ('pro', 'batch_save'),
    ('pro', 'ai_summary'),
    ('lifetime', 'batch_save'),
    ('lifetime', 'ai_summary');
"""


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        path = Path(current_app.config["DATABASE_PATH"])
        path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(str(path), timeout=5)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("PRAGMA busy_timeout = 5000")
        g.db = connection
    return g.db


def close_db(_error=None) -> None:
    connection = g.pop("db", None)
    if connection is not None:
        connection.close()


def init_db() -> None:
    connection = get_db()
    connection.execute("PRAGMA journal_mode = WAL")
    connection.executescript(SCHEMA)
    connection.execute(
        "INSERT OR REPLACE INTO schema_meta(key, value) VALUES (?, ?)",
        ("schema_version", SCHEMA_VERSION),
    )
    connection.commit()
