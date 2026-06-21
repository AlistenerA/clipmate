# ClipMate License Server v1.0.0

Flask + SQLite License API for ClipMate. Production runs behind Nginx and
Gunicorn; Gunicorn must bind only to `127.0.0.1:8080`.

## Local development

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.in
$env:LICENSE_JWT_SECRET = ('x' * 64)
.\.venv\Scripts\python.exe -m pytest -q
```

## CLI

```bash
python generate_key.py --plan pro --devices 2 --days 365 --remark "customer"
python generate_key.py create --plan lifetime --devices 3 --remark "lifetime"
python generate_key.py list
python generate_key.py revoke XXXX-XXXX-XXXX-XXXX
```

The full key is printed once when created. `list` masks keys unless
`--show-key` is supplied by an administrator.

## API

- `GET /api/health`
- `POST /api/licenses/verify`
- `POST /api/licenses/refresh`
- `POST /api/licenses/deactivate`

Refresh and deactivate use `Authorization: Bearer <token>`. See
`docs/API.md` for the complete contract.

After HTTPS deployment, run `python smoke_test.py --base-url <base>/api`. The
script never prints the full test key or Token and always revokes its test key.
