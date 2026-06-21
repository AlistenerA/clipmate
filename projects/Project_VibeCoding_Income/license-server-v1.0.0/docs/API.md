# License API v1.0.0

Base URLs:

- Staging: `https://cydl.site/api`
- Production: `https://license.cydl.site/api`

All responses use either:

```json
{"success":true,"data":{},"message":"ok"}
```

or:

```json
{"success":false,"error_code":"CODE","message":"safe message"}
```

## Verify

`POST /licenses/verify`

```json
{
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "device_id": "persistent-device-id",
  "device_info": "Chrome 126 / Windows"
}
```

The success payload includes `activated`, `plan`, `features`, `token`,
`token_expires_at`, `license_expires_at`, `active_devices`, and `max_devices`.

## Refresh

`POST /licenses/refresh` with `Authorization: Bearer <token>`:

```json
{"device_id":"persistent-device-id"}
```

A correctly signed token may refresh for seven days after its 24-hour expiry.
The License and device are checked again before a new token is issued.

## Deactivate

`POST /licenses/deactivate` with the same Authorization header and device body.
The device row is deleted, freeing one active device slot. Cumulative activation
count is not reduced.

## Error codes

`INVALID_REQUEST`, `INVALID_LICENSE_KEY`, `INVALID_DEVICE_ID`,
`LICENSE_NOT_FOUND`, `LICENSE_REVOKED`, `LICENSE_EXPIRED`,
`DEVICE_LIMIT_REACHED`, `DEVICE_NOT_FOUND`, `DEVICE_MISMATCH`,
`INVALID_TOKEN`, `TOKEN_EXPIRED`, `REQUEST_TOO_LARGE`, and `INTERNAL_ERROR`.
