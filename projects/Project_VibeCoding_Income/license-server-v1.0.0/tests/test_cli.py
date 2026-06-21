from __future__ import annotations

from license_server.cli import main


def configure(monkeypatch, tmp_path):
    monkeypatch.setenv("LICENSE_DATABASE_PATH", str(tmp_path / "license.db"))
    monkeypatch.setenv("LICENSE_JWT_SECRET", "test-secret-" + "x" * 64)


def test_cli_create_list_and_revoke(monkeypatch, tmp_path, capsys):
    configure(monkeypatch, tmp_path)
    assert main(["create", "--plan", "pro", "--devices", "2", "--days", "30", "--remark", "qa"]) == 0
    created_output = capsys.readouterr().out
    key = next(line.split(": ", 1)[1] for line in created_output.splitlines() if line.startswith("Key:"))

    assert main(["list"]) == 0
    masked_output = capsys.readouterr().out
    assert key not in masked_output
    assert key[-4:] in masked_output

    assert main(["revoke", key]) == 0
    assert "revoked" in capsys.readouterr().out.lower()
    assert main(["list", "--show-key"]) == 0
    full_output = capsys.readouterr().out
    assert key in full_output
    assert "revoked" in full_output


def test_cli_supports_default_create_command(monkeypatch, tmp_path, capsys):
    configure(monkeypatch, tmp_path)
    assert main(["--plan", "lifetime", "--devices", "1", "--remark", "forever"]) == 0
    output = capsys.readouterr().out
    assert "Expires: never" in output
