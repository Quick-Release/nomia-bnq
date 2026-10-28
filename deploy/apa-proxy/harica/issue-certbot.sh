#!/usr/bin/env bash
# DRAFT, not run. Issues and renews the HARICA certificate for
# bioeconomia.apambiente.pt with certbot, through APA's HARICA ACME account
# (External Account Binding). Run as root on the APA VPS (Ploi server 125218).
#
#   sudo ./issue-certbot.sh register   # once: bind the ACME account (EAB)
#   sudo ./issue-certbot.sh issue      # once: first certificate
#   sudo ./issue-certbot.sh renew      # what the root crontab runs daily
#   sudo ./issue-certbot.sh dry-run    # renewal rehearsal, changes nothing
#
# certbot keeps its own directories (/etc/harica, not /etc/letsencrypt), so it
# never mixes with the Let's Encrypt certificates Ploi issues on this server,
# and the distribution's certbot.timer never renews it: the crontab does.
#
# Inputs, from APA (never commit them, never pass them as arguments: argv is
# visible to every user on the server):
#   /root/harica-eab.ini, mode 0600, removed after `register`:
#     server = https://acme-v02.harica.gr/acme/<account id>/directory
#     eab-kid = <Key ID>
#     eab-hmac-key = <HMAC key>
#     email = <contact address APA wants on the account>
#   HARICA_ACME_SERVER: the same directory URL, for issue/renew (not secret).
set -euo pipefail

DOMAIN="bioeconomia.apambiente.pt"
WEBROOT="/var/www/harica-acme"
DEPLOY_HOOK="/usr/local/sbin/harica-reload-nginx"
EAB_FILE="/root/harica-eab.ini"
CERTBOT=(certbot --config-dir /etc/harica --work-dir /var/lib/harica --logs-dir /var/log/harica)

server() {
  : "${HARICA_ACME_SERVER:?Set HARICA_ACME_SERVER to APA's HARICA ACME directory URL.}"
  printf '%s' "$HARICA_ACME_SERVER"
}

case "${1:-}" in
  register)
    [ -f "$EAB_FILE" ] || { echo "Missing $EAB_FILE (see the header)." >&2; exit 1; }
    chmod 600 "$EAB_FILE"
    "${CERTBOT[@]}" register --config "$EAB_FILE" --agree-tos --no-eff-email --non-interactive
    shred -u "$EAB_FILE"
    echo "Account registered; $EAB_FILE removed."
    ;;
  issue)
    install -d -m 0755 "$WEBROOT"
    install -m 0755 "$(dirname "$0")/reload-nginx.sh" "$DEPLOY_HOOK"
    # RSA 2048 for the widest client support; HARICA also issues ECDSA
    # (--key-type ecdsa --elliptic-curve secp256r1) if APA prefers it.
    "${CERTBOT[@]}" certonly --server "$(server)" --non-interactive \
      --webroot -w "$WEBROOT" -d "$DOMAIN" --cert-name "$DOMAIN" \
      --key-type rsa --rsa-key-size 2048 \
      --deploy-hook "$DEPLOY_HOOK"
    ;;
  renew)
    # The deploy hook saved with the certificate reloads nginx after a renewal.
    "${CERTBOT[@]}" renew --server "$(server)" --non-interactive --quiet
    ;;
  dry-run)
    "${CERTBOT[@]}" renew --server "$(server)" --non-interactive --dry-run --cert-name "$DOMAIN"
    ;;
  *)
    echo "Usage: $0 register|issue|renew|dry-run" >&2
    exit 64
    ;;
esac

# Root crontab (Ploi → Server → Cron jobs, user root), daily at a random minute:
#   17 4 * * * HARICA_ACME_SERVER=https://acme-v02.harica.gr/acme/<account id>/directory /usr/local/sbin/harica-cert renew
# with this script installed as /usr/local/sbin/harica-cert.
#
# acme.sh instead of certbot (same account, same paths for nginx):
#   acme.sh --register-account --server "$HARICA_ACME_SERVER" --eab-kid <kid> --eab-hmac-key <hmac>
#   acme.sh --issue --server "$HARICA_ACME_SERVER" -d bioeconomia.apambiente.pt -w /var/www/harica-acme --keylength 2048
#   acme.sh --install-cert -d bioeconomia.apambiente.pt \
#     --key-file /etc/harica/live/bioeconomia.apambiente.pt/privkey.pem \
#     --fullchain-file /etc/harica/live/bioeconomia.apambiente.pt/fullchain.pem \
#     --ca-file /etc/harica/live/bioeconomia.apambiente.pt/chain.pem \
#     --reloadcmd /usr/local/sbin/harica-reload-nginx
# acme.sh installs its own daily cron. Its --register-account takes the EAB as
# arguments: run it from an interactive root shell with history off.
