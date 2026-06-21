# Manual deployment: License Server v1.0.0

This procedure is the fallback when automated SSH deployment cannot complete.
Run every command as root and stop if an expected check fails.

## Inputs

- Release: `/tmp/license-server-v1.0.0.tar.gz`
- Python runtime: `/tmp/cpython-3.11.15+20260610-x86_64-unknown-linux-gnu-install_only_stripped.tar.gz`
- Python runtime SHA-256: `67a5b22f796e96f4d7fa628f95866d5fd1d524d0588f74e4601facd82b66792b`
- Linux wheels: `/tmp/license-wheelhouse/`
- Staging domain: `cydl.site`
- Production domain: `license.cydl.site`

## Install release

1. Verify both release and runtime SHA-256 values before extraction.
2. Create the `license-server` system user with no login shell.
3. Create `/opt/license-server/{releases,shared,shared/backups}` and
   `/etc/license-server`; grant only the service user access to shared data.
4. Extract the runtime to `/opt/license-server/runtime`.
5. Create `/opt/license-server/venv` from that runtime and install with
   `pip --no-index --require-hashes --find-links /tmp/license-wheelhouse -r requirements.lock`.
6. Extract the release to `/opt/license-server/releases/v1.0.0` and point
   `/opt/license-server/current` to that directory.
7. Generate the JWT secret with `openssl rand -hex 32`; write it only to
   `/etc/license-server/license-server.env` with mode `0640`.
8. Run `python generate_key.py list` as the `license-server` user to initialize
   SQLite, then verify the database and WAL files are owned by that user.
9. Install the three systemd unit files, run `systemctl daemon-reload`, then
   enable and start `license-server` and `license-server-backup.timer`.
10. Verify `systemctl status`, `journalctl`, and
    `curl http://127.0.0.1:8080/api/health` before configuring Nginx.

## HTTPS staging

1. Confirm `cydl.site` resolves to `101.34.240.247` from a public resolver.
2. Install the ACME bootstrap Nginx configuration and verify `nginx -t`.
3. Issue the certificate using the webroot `/var/www/acme`.
4. Replace bootstrap with `cydl.site-staging.conf`, run `nginx -t`, and reload.
5. Verify `https://cydl.site/api/health` from outside the server.

## Production switch

1. Wait until `license.cydl.site` resolves publicly to `101.34.240.247`.
2. Install `license.cydl.site-acme.conf`, run `nginx -t`, reload, and verify
   the webroot challenge path over HTTP.
3. Issue a separate certificate using `/var/www/acme`.
4. Replace the bootstrap file with `license.cydl.site.conf`, run `nginx -t`,
   then reload.
5. Install `deployment/certbot-deploy-hook.sh` as executable
   `/etc/letsencrypt/renewal-hooks/deploy/reload-nginx`; run it once manually.
6. Run `certbot renew --dry-run --no-random-sleep-on-renew` and require both
   certificate lineages to succeed.
7. Verify production API and the production extension build.
8. Remove the staging server block only after no staging clients remain.

## Rollback

1. Stop the service only if a failed release is currently active.
2. Point `/opt/license-server/current` back to the previous release.
3. Restore the pre-deployment SQLite backup only when a migration requires it.
4. Run `systemctl restart license-server`, then repeat health and API checks.
5. Restore the timestamped Nginx configuration and reload only after `nginx -t`.

Never expose port 8080 publicly and never paste the JWT secret or a full test
License Key into tickets, logs, or documentation.
