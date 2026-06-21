# Version: v1.0.0
from __future__ import annotations

import argparse
import os
import sys

from . import create_app
from .repository import create_license, list_licenses, revoke_license

STATUS_LABELS = {0: "revoked", 1: "active", 2: "expired"}


def main(argv: list[str] | None = None) -> int:
    arguments = list(sys.argv[1:] if argv is None else argv)
    if not arguments or arguments[0].startswith("-"):
        arguments.insert(0, "create")
    parser = _parser()
    args = parser.parse_args(arguments)

    if not os.environ.get("LICENSE_JWT_SECRET"):
        # CLI operations do not issue tokens, but the app factory remains fail-closed.
        os.environ["LICENSE_JWT_SECRET"] = "cli-only-" + "x" * 64
    app = create_app()
    with app.app_context():
        try:
            if args.command == "create":
                created = create_license(args.plan, args.devices, args.days, args.remark)
                print("License created")
                print(f"Key: {created['license_key']}")
                print(f"Plan: {created['plan']}")
                print(f"Devices: {created['max_devices']}")
                print(f"Expires: {created['expires_at'] or 'never'}")
                return 0
            if args.command == "list":
                _print_list(list_licenses(), args.show_key)
                return 0
            if args.command == "revoke":
                if not revoke_license(args.license_key):
                    print("License not found", file=sys.stderr)
                    return 1
                print("License revoked")
                return 0
        except (ValueError, RuntimeError) as error:
            parser.error(str(error))
    return 1


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="ClipMate license administration")
    subparsers = parser.add_subparsers(dest="command", required=True)

    create = subparsers.add_parser("create", help="create a license")
    create.add_argument("--plan", choices=["pro", "lifetime"], required=True)
    create.add_argument("--devices", type=int, default=1)
    create.add_argument("--days", type=int)
    create.add_argument("--remark", default="")

    list_command = subparsers.add_parser("list", help="list licenses")
    list_command.add_argument("--show-key", action="store_true")

    revoke = subparsers.add_parser("revoke", help="revoke a license")
    revoke.add_argument("license_key")
    return parser


def _print_list(licenses: list[dict], show_key: bool) -> None:
    if not licenses:
        print("No licenses")
        return
    headings = ("KEY", "PLAN", "STATUS", "DEVICES", "ACTIVATIONS", "EXPIRES", "REMARK")
    rows = []
    for item in licenses:
        key = item["license_key"] if show_key else _mask_key(item["license_key"])
        rows.append(
            (
                key,
                item["plan"],
                STATUS_LABELS[item["status"]],
                f"{item['active_devices']}/{item['max_devices']}",
                str(item["total_activations"]),
                item["expires_at"] or "never",
                item["remark"],
            )
        )
    widths = [max(len(str(value)) for value in [heading, *(row[i] for row in rows)]) for i, heading in enumerate(headings)]
    print("  ".join(heading.ljust(widths[i]) for i, heading in enumerate(headings)))
    print("  ".join("-" * width for width in widths))
    for row in rows:
        print("  ".join(str(value).ljust(widths[i]) for i, value in enumerate(row)))


def _mask_key(key: str) -> str:
    return f"****-****-****-{key[-4:]}"
