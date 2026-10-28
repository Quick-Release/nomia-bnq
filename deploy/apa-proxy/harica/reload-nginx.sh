#!/usr/bin/env bash
# DRAFT, not installed. /usr/local/sbin/harica-reload-nginx, run by
# install-manual-cert.sh after it installs a certificate. Reloads nginx only
# if its configuration, with the new certificate, is valid; otherwise the
# running nginx keeps serving the old one and this fails loudly.
set -euo pipefail

if ! nginx -t -q; then
  echo "nginx -t failed; not reloading. The previous certificate is still served." >&2
  exit 1
fi
systemctl reload nginx
echo "nginx reloaded with the new bioeconomia.apambiente.pt certificate."
