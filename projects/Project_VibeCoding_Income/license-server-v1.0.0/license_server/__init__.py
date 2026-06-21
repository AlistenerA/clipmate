# Version: v1.0.0
from __future__ import annotations

import os
from pathlib import Path

from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

from .db import close_db, init_db
from .errors import register_error_handlers
from .routes import api

VERSION = "v1.0.0"


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        APP_VERSION=VERSION,
        DATABASE_PATH=os.environ.get(
            "LICENSE_DATABASE_PATH",
            str(Path(__file__).resolve().parents[1] / "instance" / "license.db"),
        ),
        JWT_SECRET=os.environ.get("LICENSE_JWT_SECRET", ""),
        JWT_ISSUER="clipmate-license-server",
        JWT_AUDIENCE="clipmate-extension",
        TOKEN_TTL_SECONDS=24 * 60 * 60,
        TOKEN_REFRESH_GRACE_SECONDS=7 * 24 * 60 * 60,
        MAX_CONTENT_LENGTH=8 * 1024,
        TRUSTED_HOSTS=_trusted_hosts(),
        TRUST_PROXY_HEADERS=True,
        TESTING=False,
    )
    if test_config:
        app.config.update(test_config)

    _validate_config(app)
    if app.config["TRUST_PROXY_HEADERS"]:
        # Gunicorn is bound to loopback, so exactly one local reverse proxy is trusted.
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

    app.teardown_appcontext(close_db)
    app.register_blueprint(api, url_prefix="/api")
    register_error_handlers(app)

    @app.after_request
    def add_security_headers(response):
        response.headers["Cache-Control"] = "no-store"
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        return response

    with app.app_context():
        init_db()

    return app


def _trusted_hosts() -> list[str]:
    value = os.environ.get(
        "LICENSE_TRUSTED_HOSTS",
        "cydl.site,license.cydl.site,localhost,127.0.0.1",
    )
    return [host.strip() for host in value.split(",") if host.strip()]


def _validate_config(app: Flask) -> None:
    secret = str(app.config.get("JWT_SECRET", ""))
    if app.config.get("TESTING"):
        if not secret:
            raise RuntimeError("JWT_SECRET is required in tests")
        return
    if len(secret) < 64:
        raise RuntimeError("LICENSE_JWT_SECRET must contain at least 64 characters")
