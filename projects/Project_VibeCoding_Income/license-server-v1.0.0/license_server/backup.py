# Version: v1.0.0
from __future__ import annotations

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


def backup_database(database_path: Path, backup_dir: Path, retain: int = 7) -> Path:
    if retain < 1:
        raise ValueError("retain must be at least 1")
    if not database_path.is_file():
        raise FileNotFoundError(f"database not found: {database_path}")
    backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    destination = backup_dir / f"license-{timestamp}.db"
    source = sqlite3.connect(str(database_path))
    target = sqlite3.connect(str(destination))
    try:
        source.backup(target)
    finally:
        target.close()
        source.close()
    backups = sorted(backup_dir.glob("license-*.db"), reverse=True)
    for stale in backups[retain:]:
        stale.unlink()
    return destination


def main() -> int:
    database_path = Path(
        os.environ.get(
            "LICENSE_DATABASE_PATH",
            "/opt/license-server/shared/license.db",
        )
    )
    backup_dir = Path(
        os.environ.get(
            "LICENSE_BACKUP_DIR",
            "/opt/license-server/shared/backups",
        )
    )
    retain = int(os.environ.get("LICENSE_BACKUP_RETAIN", "7"))
    destination = backup_database(database_path, backup_dir, retain)
    print(f"Backup created: {destination}")
    return 0
