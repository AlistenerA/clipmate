# License Server v1.0.0 Test Plan

## Automated

- Health response, version and no-store headers.
- Normal and repeated activation.
- Sequential and concurrent device-limit enforcement.
- Token refresh, invalid signature, refresh grace and grace expiry.
- Expired and revoked License behavior.
- Device deactivation and slot reuse.
- Strict JSON/key validation.
- CLI create/default/list/revoke and masked list output.
- SQLite backup validity and retention.

Run:

```bash
python -m pytest -q
```

## Deployment

- `systemctl is-active` and `is-enabled` for API, backup timer and Nginx.
- Gunicorn listens only on `127.0.0.1:8080`.
- Public 80 redirects to HTTPS; public 443 returns `/api/health`.
- Certificate renewal uses webroot and `certbot renew --dry-run` succeeds.
- `smoke_test.py` passes without printing a full key or Token.
- Restart API and Nginx, then repeat health and one activation.

## Release evidence

Record command, exit status, test count, manifest/version, artifact SHA-256,
remaining manual browser checks and any infrastructure-only failures.

The verified production deployment is recorded in `DEPLOYMENT_EVIDENCE.md`.
