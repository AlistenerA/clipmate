from __future__ import annotations

from pathlib import Path

import pytest

from scripts.clipmate_license_admin import (
    AdminError,
    LicenseRequest,
    RemoteResult,
    build_create_script,
    issue_license,
    validate_request,
)

TEST_KEY = "ABCD-EFGH-JKLM-NPQR"


def successful_remote_result() -> RemoteResult:
    return RemoteResult(
        0,
        (
            "License created",
            f"Key: {TEST_KEY}",
            "Plan: pro",
            "Devices: 2",
            "Expires: 2026-07-21T00:00:00+00:00",
        ),
    )


def test_request_validation_defaults_and_lifetime_guard(tmp_path: Path) -> None:
    request = validate_request(LicenseRequest(output_directory=tmp_path))
    assert request.days == 30

    with pytest.raises(AdminError, match="Lifetime"):
        validate_request(
            LicenseRequest(plan="lifetime", days=30, output_directory=tmp_path)
        )


def test_create_script_base64_encodes_remark(tmp_path: Path) -> None:
    request = LicenseRequest(
        plan="pro",
        devices=2,
        days=90,
        remark="customer order 42",
        output_directory=tmp_path,
    )
    script = build_create_script(request)
    assert "customer order 42" not in script
    assert "--plan pro --devices 2 --days 90" in script


def test_issue_license_writes_only_the_key_to_a_protected_file(tmp_path: Path) -> None:
    protected: list[Path] = []

    def remote_executor(_target: str, _script: str) -> RemoteResult:
        return successful_remote_result()

    result = issue_license(
        LicenseRequest(
            plan="pro",
            devices=2,
            days=30,
            output_directory=tmp_path,
        ),
        remote_executor=remote_executor,
        file_protector=protected.append,
    )

    assert result.masked_key == "****-****-****-NPQR"
    assert result.output_path.read_text(encoding="ascii") == TEST_KEY
    assert protected == [result.output_path]


def test_issue_license_revokes_when_local_delivery_fails(tmp_path: Path) -> None:
    scripts: list[str] = []

    def remote_executor(_target: str, script: str) -> RemoteResult:
        scripts.append(script)
        if " revoke " in script:
            return RemoteResult(0, ("License revoked",))
        return successful_remote_result()

    def fail_protection(_path: Path) -> None:
        raise OSError("ACL unavailable")

    with pytest.raises(AdminError, match="已自动吊销"):
        issue_license(
            LicenseRequest(
                plan="pro",
                devices=2,
                days=30,
                output_directory=tmp_path,
            ),
            remote_executor=remote_executor,
            file_protector=fail_protection,
        )

    assert len(scripts) == 2
    assert "revoke" in scripts[1]
    assert not list(tmp_path.glob("*.txt"))


def test_issue_license_reports_manual_action_when_rollback_cannot_run(tmp_path: Path) -> None:
    call_count = 0

    def remote_executor(_target: str, _script: str) -> RemoteResult:
        nonlocal call_count
        call_count += 1
        if call_count == 2:
            raise AdminError("SSH timeout")
        return successful_remote_result()

    with pytest.raises(AdminError, match="手动吊销"):
        issue_license(
            LicenseRequest(
                plan="pro",
                devices=2,
                days=30,
                output_directory=tmp_path,
            ),
            remote_executor=remote_executor,
            file_protector=lambda _path: (_ for _ in ()).throw(OSError("ACL unavailable")),
        )

    assert call_count == 2
