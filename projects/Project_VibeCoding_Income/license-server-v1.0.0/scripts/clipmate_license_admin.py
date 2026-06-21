#!/usr/bin/env python3
"""Create ClipMate licenses from Windows through the production SSH connection."""

from __future__ import annotations

import argparse
import base64
import csv
import io
import os
import re
import secrets
import shutil
import subprocess
import sys
import threading
from dataclasses import dataclass, replace
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Sequence

LICENSE_PATTERN_TEXT = r"[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}(?:-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}){3}"
LICENSE_PATTERN = re.compile(rf"^{LICENSE_PATTERN_TEXT}$")
SSH_TARGET_PATTERN = re.compile(r"^[A-Za-z0-9._-]+(?:@[A-Za-z0-9._-]+)?$")
DEFAULT_SSH_TARGET = "codexconnected"
DEFAULT_OUTPUT_DIRECTORY = Path.home() / "Documents" / "ClipMate-Licenses"
CREATE_TIMEOUT_SECONDS = 60


class AdminError(RuntimeError):
    """A safe, user-facing administration error."""


@dataclass(frozen=True)
class LicenseRequest:
    plan: str = "pro"
    devices: int = 1
    days: int | None = None
    remark: str = ""
    ssh_target: str = DEFAULT_SSH_TARGET
    output_directory: Path = DEFAULT_OUTPUT_DIRECTORY


@dataclass(frozen=True)
class RemoteResult:
    returncode: int
    lines: tuple[str, ...]


@dataclass(frozen=True)
class LicenseResult:
    masked_key: str
    output_path: Path
    plan: str
    devices: int
    expires: str


RemoteExecutor = Callable[[str, str], RemoteResult]
FileProtector = Callable[[Path], None]


def validate_request(request: LicenseRequest) -> LicenseRequest:
    plan = request.plan.strip().lower()
    if plan not in {"pro", "lifetime"}:
        raise AdminError("套餐必须是 pro 或 lifetime。")
    if not 1 <= request.devices <= 20:
        raise AdminError("设备数必须在 1 到 20 之间。")
    if len(request.remark) > 200:
        raise AdminError("备注不能超过 200 个字符。")
    if not SSH_TARGET_PATTERN.fullmatch(request.ssh_target):
        raise AdminError("SSH 目标格式无效。")

    days = request.days
    if plan == "pro":
        days = 30 if days is None else days
        if not 1 <= days <= 3650:
            raise AdminError("Pro 有效期必须在 1 到 3650 天之间。")
    elif days is not None:
        raise AdminError("Lifetime 套餐不能设置有效期天数。")

    return replace(
        request,
        plan=plan,
        days=days,
        output_directory=Path(request.output_directory).expanduser(),
    )


def build_create_script(request: LicenseRequest) -> str:
    request = validate_request(request)
    remark_base64 = base64.b64encode(request.remark.encode("utf-8")).decode("ascii")
    days_argument = f" --days {request.days}" if request.days is not None else ""
    return f"""set -eu
cd /opt/license-server/current
set -a
. /etc/license-server/license-server.env
set +a
remark=\"$(printf '%s' '{remark_base64}' | base64 --decode)\"
umask 077
exec /opt/license-server/venv/bin/python generate_key.py create --plan {request.plan} --devices {request.devices}{days_argument} --remark \"$remark\"
"""


def build_revoke_script(license_key: str) -> str:
    if not LICENSE_PATTERN.fullmatch(license_key):
        raise AdminError("无法自动吊销格式无效的 License Key。")
    return f"""set -eu
cd /opt/license-server/current
set -a
. /etc/license-server/license-server.env
set +a
exec /opt/license-server/venv/bin/python generate_key.py revoke '{license_key}'
"""


def invoke_remote_bash(target: str, script: str) -> RemoteResult:
    ssh_path = shutil.which("ssh.exe") or shutil.which("ssh")
    if not ssh_path:
        raise AdminError("未找到 Windows OpenSSH Client（ssh.exe）。")

    payload = base64.b64encode(script.encode("utf-8")).decode("ascii")
    remote_command = f"printf '%s' '{payload}' | base64 --decode | /bin/bash"
    creation_flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    try:
        completed = subprocess.run(
            [
                ssh_path,
                "-o",
                "BatchMode=yes",
                "-o",
                "ConnectTimeout=15",
                "-o",
                "StrictHostKeyChecking=accept-new",
                target,
                remote_command,
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=CREATE_TIMEOUT_SECONDS,
            check=False,
            creationflags=creation_flags,
        )
    except subprocess.TimeoutExpired as error:
        raise AdminError("SSH 操作超时，请检查网络和服务器状态。") from error
    except OSError as error:
        raise AdminError(f"无法启动 SSH：{error}") from error

    lines = tuple((*completed.stdout.splitlines(), *completed.stderr.splitlines()))
    return RemoteResult(completed.returncode, lines)


def issue_license(
    request: LicenseRequest,
    *,
    remote_executor: RemoteExecutor = invoke_remote_bash,
    file_protector: FileProtector | None = None,
) -> LicenseResult:
    request = validate_request(request)
    remote_result = remote_executor(request.ssh_target, build_create_script(request))
    if remote_result.returncode != 0:
        detail = _sanitize_output(remote_result.lines)
        raise AdminError(
            f"远程生成失败（SSH 退出码 {remote_result.returncode}）。{detail}".rstrip()
        )

    license_key = _extract_license_key(remote_result.lines)
    try:
        remote_plan = _extract_field(remote_result.lines, "Plan")
        remote_devices = _extract_field(remote_result.lines, "Devices")
        remote_expires = _extract_field(remote_result.lines, "Expires")
        if remote_plan != request.plan or remote_devices != str(request.devices):
            raise AdminError("服务器返回的套餐或设备数与请求不一致。")
        output_path = _write_protected_key(
            request.output_directory,
            request.plan,
            license_key,
            file_protector or protect_license_file,
        )
    except Exception as error:
        _revoke_after_delivery_failure(
            request.ssh_target,
            license_key,
            error,
            remote_executor,
        )
        raise AssertionError("unreachable")

    return LicenseResult(
        masked_key=_mask_key(license_key),
        output_path=output_path,
        plan=remote_plan,
        devices=int(remote_devices),
        expires=remote_expires,
    )


def protect_license_file(path: Path) -> None:
    if os.name != "nt":
        raise AdminError("安全落盘仅支持 Windows。")
    whoami_path = shutil.which("whoami.exe") or shutil.which("whoami")
    icacls_path = shutil.which("icacls.exe") or shutil.which("icacls")
    if not whoami_path or not icacls_path:
        raise AdminError("未找到 whoami.exe 或 icacls.exe，无法限制文件 ACL。")

    creation_flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    identity = subprocess.run(
        [whoami_path, "/user", "/fo", "csv", "/nh"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
        creationflags=creation_flags,
    )
    if identity.returncode != 0:
        raise AdminError("无法读取当前 Windows 用户 SID。")
    rows = list(csv.reader(io.StringIO(identity.stdout)))
    if len(rows) != 1 or len(rows[0]) < 2 or not rows[0][1].startswith("S-"):
        raise AdminError("Windows 用户 SID 返回格式异常。")

    current_sid = rows[0][1]
    acl = subprocess.run(
        [
            icacls_path,
            str(path),
            "/inheritance:r",
            "/grant:r",
            f"*{current_sid}:(F)",
            "*S-1-5-18:(F)",
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
        creationflags=creation_flags,
    )
    if acl.returncode != 0:
        raise AdminError(f"限制输出文件 ACL 失败（icacls 退出码 {acl.returncode}）。")


def _write_protected_key(
    output_directory: Path,
    plan: str,
    license_key: str,
    protector: FileProtector,
) -> Path:
    output_directory.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    output_path: Path | None = None
    for _ in range(10):
        candidate = output_directory / f"clipmate-{plan}-{timestamp}-{secrets.token_hex(4)}.txt"
        try:
            descriptor = os.open(candidate, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        except FileExistsError:
            continue
        os.close(descriptor)
        output_path = candidate
        break
    if output_path is None:
        raise AdminError("无法创建唯一的 License 输出文件。")

    try:
        protector(output_path)
        output_path.write_text(license_key, encoding="ascii")
    except Exception:
        output_path.unlink(missing_ok=True)
        raise
    return output_path


def _extract_license_key(lines: Sequence[str]) -> str:
    matches = []
    pattern = re.compile(rf"^Key:\s*({LICENSE_PATTERN_TEXT})\s*$")
    for line in lines:
        match = pattern.fullmatch(line.strip())
        if match:
            matches.append(match.group(1))
    if len(matches) != 1:
        raise AdminError("服务器返回中没有且仅有一个合法 License Key。")
    return matches[0]


def _extract_field(lines: Sequence[str], name: str) -> str:
    pattern = re.compile(rf"^{re.escape(name)}:\s*(.+?)\s*$")
    values = [match.group(1) for line in lines if (match := pattern.fullmatch(line.strip()))]
    if len(values) != 1:
        raise AdminError(f"服务器返回中没有且仅有一个 {name} 字段。")
    return values[0]


def _revoke_after_delivery_failure(
    target: str,
    license_key: str,
    original_error: Exception,
    remote_executor: RemoteExecutor,
) -> None:
    try:
        revoke_result = remote_executor(target, build_revoke_script(license_key))
    except Exception as revoke_error:
        raise AdminError(
            "Windows Key 交付失败，自动远程吊销未能完成。请按备注定位最新 Key 并手动吊销。"
            f"原始错误：{original_error}；吊销错误：{revoke_error}"
        ) from original_error
    if revoke_result.returncode != 0 or "License revoked" not in revoke_result.lines:
        raise AdminError(
            "Windows Key 交付失败，自动远程吊销也失败。请按备注定位最新 Key 并手动吊销。"
            f"原始错误：{original_error}"
        ) from original_error
    raise AdminError(
        "Windows Key 交付失败；新生成的远程 Key 已自动吊销。"
        f"原始错误：{original_error}"
    ) from original_error


def _sanitize_output(lines: Sequence[str]) -> str:
    text = "\n".join(lines)
    sanitized = re.sub(LICENSE_PATTERN_TEXT, "****-****-****-****", text)
    return f" {sanitized}" if sanitized else ""


def _mask_key(license_key: str) -> str:
    return f"****-****-****-{license_key[-4:]}"


def launch_gui(
    *,
    default_ssh_target: str = DEFAULT_SSH_TARGET,
    default_output_directory: Path = DEFAULT_OUTPUT_DIRECTORY,
) -> None:
    try:
        import tkinter as tk
        from tkinter import filedialog, messagebox, ttk
    except ImportError as error:
        raise AdminError("当前 Python 未包含 Tkinter，无法启动 GUI。") from error

    root = tk.Tk()
    root.title("ClipMate License 管理工具")
    root.geometry("680x620")
    root.minsize(620, 560)

    style = ttk.Style(root)
    if "vista" in style.theme_names():
        style.theme_use("vista")
    style.configure("Title.TLabel", font=("Microsoft YaHei UI", 18, "bold"))
    style.configure("Subtitle.TLabel", font=("Microsoft YaHei UI", 9), foreground="#5B6472")
    style.configure("Section.TLabelframe.Label", font=("Microsoft YaHei UI", 10, "bold"))
    style.configure("Primary.TButton", font=("Microsoft YaHei UI", 10, "bold"), padding=(16, 9))
    style.configure("Status.TLabel", font=("Microsoft YaHei UI", 9), foreground="#1F4B7A")

    content = ttk.Frame(root, padding=24)
    content.grid(row=0, column=0, sticky="nsew")
    root.rowconfigure(0, weight=1)
    root.columnconfigure(0, weight=1)
    content.columnconfigure(0, weight=1)

    ttk.Label(content, text="ClipMate License 管理工具", style="Title.TLabel").grid(
        row=0, column=0, sticky="w"
    )
    ttk.Label(
        content,
        text="通过现有 SSH 安全生成 License，完整 Key 仅保存到受限文件。",
        style="Subtitle.TLabel",
    ).grid(row=1, column=0, sticky="w", pady=(4, 18))

    connection = ttk.LabelFrame(content, text="连接与输出", style="Section.TLabelframe", padding=14)
    connection.grid(row=2, column=0, sticky="ew")
    connection.columnconfigure(1, weight=1)

    ssh_var = tk.StringVar(value=default_ssh_target)
    output_var = tk.StringVar(value=str(default_output_directory))
    ttk.Label(connection, text="SSH 目标").grid(row=0, column=0, sticky="w", padx=(0, 12), pady=5)
    ttk.Entry(connection, textvariable=ssh_var).grid(row=0, column=1, columnspan=2, sticky="ew", pady=5)
    ttk.Label(connection, text="输出目录").grid(row=1, column=0, sticky="w", padx=(0, 12), pady=5)
    ttk.Entry(connection, textvariable=output_var).grid(row=1, column=1, sticky="ew", pady=5)

    def browse_output() -> None:
        selected = filedialog.askdirectory(initialdir=output_var.get() or str(Path.home()))
        if selected:
            output_var.set(selected)

    ttk.Button(connection, text="浏览...", command=browse_output).grid(
        row=1, column=2, sticky="e", padx=(8, 0), pady=5
    )

    license_frame = ttk.LabelFrame(content, text="License 配置", style="Section.TLabelframe", padding=14)
    license_frame.grid(row=3, column=0, sticky="ew", pady=(14, 0))
    license_frame.columnconfigure(1, weight=1)
    license_frame.columnconfigure(3, weight=1)

    plan_var = tk.StringVar(value="Pro")
    devices_var = tk.StringVar(value="1")
    days_var = tk.StringVar(value="30")
    remark_var = tk.StringVar()

    ttk.Label(license_frame, text="套餐").grid(row=0, column=0, sticky="w", padx=(0, 10), pady=5)
    plan_box = ttk.Combobox(
        license_frame, textvariable=plan_var, values=("Pro", "Lifetime"), state="readonly", width=16
    )
    plan_box.grid(row=0, column=1, sticky="ew", padx=(0, 18), pady=5)
    ttk.Label(license_frame, text="设备数").grid(row=0, column=2, sticky="w", padx=(0, 10), pady=5)
    ttk.Spinbox(license_frame, from_=1, to=20, textvariable=devices_var, width=12).grid(
        row=0, column=3, sticky="ew", pady=5
    )
    ttk.Label(license_frame, text="有效期（天）").grid(
        row=1, column=0, sticky="w", padx=(0, 10), pady=5
    )
    days_box = ttk.Spinbox(license_frame, from_=1, to=3650, textvariable=days_var, width=16)
    days_box.grid(row=1, column=1, sticky="ew", padx=(0, 18), pady=5)
    ttk.Label(license_frame, text="备注").grid(row=1, column=2, sticky="w", padx=(0, 10), pady=5)
    ttk.Entry(license_frame, textvariable=remark_var).grid(row=1, column=3, sticky="ew", pady=5)

    def sync_plan_fields(*_args: object) -> None:
        if plan_var.get() == "Lifetime":
            days_box.configure(state="disabled")
        else:
            days_box.configure(state="normal")

    plan_var.trace_add("write", sync_plan_fields)

    ttk.Label(
        content,
        text="安全提示：不会在窗口或终端显示完整 Key；本地保存失败时会自动远程吊销。",
        style="Subtitle.TLabel",
        wraplength=610,
    ).grid(row=4, column=0, sticky="w", pady=(14, 0))

    action_row = ttk.Frame(content)
    action_row.grid(row=5, column=0, sticky="ew", pady=(14, 0))
    action_row.columnconfigure(0, weight=1)
    status_var = tk.StringVar(value="准备就绪")
    ttk.Label(action_row, textvariable=status_var, style="Status.TLabel").grid(
        row=0, column=0, sticky="w"
    )

    result_frame = ttk.LabelFrame(content, text="最近结果", style="Section.TLabelframe", padding=14)
    result_frame.grid(row=6, column=0, sticky="nsew", pady=(14, 0))
    content.rowconfigure(6, weight=1)
    result_frame.columnconfigure(0, weight=1)
    result_var = tk.StringVar(value="生成成功后，这里会显示掩码 Key、有效期和安全文件路径。")
    ttk.Label(result_frame, textvariable=result_var, wraplength=600, justify="left").grid(
        row=0, column=0, sticky="nw"
    )
    open_button = ttk.Button(result_frame, text="打开输出目录", state="disabled")
    open_button.grid(row=1, column=0, sticky="w", pady=(12, 0))
    latest_output: list[Path] = []

    def open_output_directory() -> None:
        if latest_output:
            os.startfile(str(latest_output[0].parent))  # type: ignore[attr-defined]

    open_button.configure(command=open_output_directory)

    generate_button = ttk.Button(action_row, text="安全生成 License", style="Primary.TButton")
    generate_button.grid(row=0, column=1, sticky="e")

    def finish_success(result: LicenseResult) -> None:
        latest_output[:] = [result.output_path]
        status_var.set("生成成功")
        result_var.set(
            f"{result.masked_key}\n套餐：{result.plan}    设备：{result.devices}    "
            f"有效期：{result.expires}\n保存位置：{result.output_path}"
        )
        open_button.configure(state="normal")
        generate_button.configure(state="normal")

    def finish_error(error: Exception) -> None:
        status_var.set("生成失败")
        generate_button.configure(state="normal")
        messagebox.showerror("ClipMate License", str(error), parent=root)

    def generate() -> None:
        try:
            plan = plan_var.get().lower()
            output_directory = output_var.get().strip()
            if not output_directory:
                raise AdminError("请选择 License 输出目录。")
            request = LicenseRequest(
                plan=plan,
                devices=int(devices_var.get()),
                days=None if plan == "lifetime" else int(days_var.get()),
                remark=remark_var.get(),
                ssh_target=ssh_var.get().strip(),
                output_directory=Path(output_directory),
            )
            request = validate_request(request)
        except (ValueError, AdminError) as error:
            messagebox.showerror("配置无效", str(error), parent=root)
            return

        generate_button.configure(state="disabled")
        open_button.configure(state="disabled")
        status_var.set("正在通过 SSH 生成，请稍候...")

        def worker() -> None:
            try:
                result = issue_license(request)
            except Exception as error:
                root.after(0, finish_error, error)
                return
            root.after(0, finish_success, result)

        threading.Thread(target=worker, daemon=True).start()

    generate_button.configure(command=generate)
    root.mainloop()


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="ClipMate Windows License 管理工具")
    subparsers = parser.add_subparsers(dest="command")

    create = subparsers.add_parser("create", help="通过 SSH 创建并安全保存 License")
    create.add_argument("--plan", choices=("pro", "lifetime"), default="pro")
    create.add_argument("--devices", type=int, default=1)
    create.add_argument("--days", type=int)
    create.add_argument("--remark", default="")
    create.add_argument("--ssh-target", default=DEFAULT_SSH_TARGET)
    create.add_argument("--output-directory", type=Path, default=DEFAULT_OUTPUT_DIRECTORY)

    gui = subparsers.add_parser("gui", help="打开图形配置界面")
    gui.add_argument("--ssh-target", default=DEFAULT_SSH_TARGET)
    gui.add_argument("--output-directory", type=Path, default=DEFAULT_OUTPUT_DIRECTORY)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    arguments = list(sys.argv[1:] if argv is None else argv)
    if not arguments:
        arguments = ["gui"]
    args = _parser().parse_args(arguments)
    try:
        if args.command == "gui":
            launch_gui(
                default_ssh_target=args.ssh_target,
                default_output_directory=args.output_directory,
            )
            return 0
        if args.command == "create":
            result = issue_license(
                LicenseRequest(
                    plan=args.plan,
                    devices=args.devices,
                    days=args.days,
                    remark=args.remark,
                    ssh_target=args.ssh_target,
                    output_directory=args.output_directory,
                )
            )
            print(f"License created: {result.masked_key}")
            print(f"Saved to: {result.output_path}")
            return 0
    except AdminError as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
