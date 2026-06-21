#!/bin/sh
# Version: v1.0.0
set -eu

/usr/sbin/nginx -t
/bin/systemctl reload nginx
