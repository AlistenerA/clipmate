from pathlib import Path
import sqlite3

from license_server.backup import backup_database


def test_backup_is_valid_and_retention_is_enforced(tmp_path):
    source = tmp_path / "source.db"
    connection = sqlite3.connect(source)
    connection.execute("CREATE TABLE sample(value TEXT)")
    connection.execute("INSERT INTO sample(value) VALUES ('ok')")
    connection.commit()
    connection.close()

    backup_dir = tmp_path / "backups"
    first = backup_database(source, backup_dir, retain=1)
    assert first.is_file()
    copied = sqlite3.connect(first)
    assert copied.execute("SELECT value FROM sample").fetchone()[0] == "ok"
    copied.close()

    old = backup_dir / "license-20000101T000000Z.db"
    old.write_bytes(b"old")
    backup_database(source, backup_dir, retain=1)
    assert not old.exists()
    assert len(list(backup_dir.glob("license-*.db"))) == 1
