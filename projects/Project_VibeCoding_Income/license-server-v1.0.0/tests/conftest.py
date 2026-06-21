from __future__ import annotations

import pytest

from license_server import create_app


@pytest.fixture()
def app(tmp_path):
    return create_app(
        {
            "TESTING": True,
            "DATABASE_PATH": str(tmp_path / "license.db"),
            "JWT_SECRET": "test-secret-" + "x" * 64,
            "TRUSTED_HOSTS": ["localhost"],
            "TRUST_PROXY_HEADERS": False,
        }
    )


@pytest.fixture()
def client(app):
    return app.test_client()
