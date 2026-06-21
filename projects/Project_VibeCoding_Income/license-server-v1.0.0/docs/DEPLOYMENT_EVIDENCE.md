# License Server v1.0.0 Deployment Evidence

Verified: 2026-06-21 (Asia/Shanghai)

## Target

- SSH alias: `codexconnected`
- Server: CentOS 7.6, `101.34.240.247`
- Runtime: isolated CPython 3.11.15 under `/opt/license-server/runtime`
- Release: `/opt/license-server/releases/v1.0.0`
- Rollback release: `/opt/license-server/releases/v1.0.0-pre-final-20260621`
- Shared database: `/opt/license-server/shared/license.db`

## Runtime Evidence

- `license-server.service`: active and enabled.
- Gunicorn listens only on `127.0.0.1:8080`.
- `license-server-backup.timer`: active and enabled.
- Pre-release backup: `license-20260621T001409Z.db`, 53,248 bytes.
- Nginx 1.20.1 fronts public TCP 80/443.
- `https://license.cydl.site/api/health` returns version `v1.0.0`.

## TLS Evidence

- Certificate CN and hostname: `license.cydl.site`.
- Issuer: Let's Encrypt YR2.
- Validity: 2026-06-20 23:13:12 UTC through 2026-09-18 23:13:11 UTC.
- HTTP redirects to the matching HTTPS URL.
- `certbot renew --dry-run --no-random-sleep-on-renew` succeeded for both
  `cydl.site` and `license.cydl.site`.
- Deploy hook `/etc/letsencrypt/renewal-hooks/deploy/reload-nginx` validates
  Nginx configuration before reloading it.

## Live API Evidence

The sanitized production smoke test passed health, first and repeated
activation, device-limit rejection, Token refresh, invalid Token rejection,
device deactivation, and revoked License rejection. Its temporary Key was
revoked by the script.

A separate 30-day, one-device Pro acceptance Key exists only in
`/root/clipmate-v1.0.1-test-license.txt` with mode `0600`; its value is not
recorded in this repository.

## Rollback

If a later runtime regression appears, stop the service, move the current
`v1.0.0` directory aside, restore `v1.0.0-pre-final-20260621` to the canonical
name, restart the service, then repeat loopback and HTTPS health checks.
