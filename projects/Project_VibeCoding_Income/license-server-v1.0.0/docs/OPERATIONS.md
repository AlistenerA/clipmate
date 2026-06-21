# Operations: License Server v1.0.0

```bash
systemctl status license-server
systemctl restart license-server
journalctl -u license-server --since "30 minutes ago"
systemctl list-timers license-server-backup.timer
curl -fsS http://127.0.0.1:8080/api/health
curl -fsS https://license.cydl.site/api/health
cd /opt/license-server/current
/opt/license-server/venv/bin/python generate_key.py list
/opt/license-server/venv/bin/python generate_key.py --plan pro --devices 1 --days 30 --remark "test"
/opt/license-server/venv/bin/python generate_key.py revoke XXXX-XXXX-XXXX-XXXX
nginx -t
certbot renew --dry-run --no-random-sleep-on-renew
```

Backups live under `/opt/license-server/shared/backups`. Restore only while the
service is stopped, retain a copy of the replaced database, and check ownership
before restarting.

Certbot runs `/etc/letsencrypt/renewal-hooks/deploy/reload-nginx` after a
successful renewal. The hook validates Nginx configuration before reloading.
