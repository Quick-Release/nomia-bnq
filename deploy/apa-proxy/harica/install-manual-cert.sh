#!/usr/bin/env bash
# DRAFT, not run. Installs a certificate APA issued by hand from csr.sh's CSR
# at the paths nginx reads, then reloads nginx.
#
#   sudo ./install-manual-cert.sh /etc/harica/manual/<date> <leaf.pem> <chain.pem>
#
# <leaf.pem>: HARICA's certificate for bioeconomia.apambiente.pt (PEM).
# <chain.pem>: HARICA's intermediate(s), leaf excluded, in order (PEM).
# Don't mix with certbot: this replaces certbot's symlinks in /etc/harica/live.
set -euo pipefail

DOMAIN="bioeconomia.apambiente.pt"
KEY_DIR="${1:?key directory from csr.sh}"
LEAF="${2:?leaf certificate}"
CHAIN="${3:?intermediate chain}"
LIVE="/etc/harica/live/$DOMAIN"

key_hash() { openssl pkey -in "$1" -pubout | openssl sha256; }
cert_hash() { openssl x509 -in "$1" -noout -pubkey | openssl sha256; }

[ "$(key_hash "$KEY_DIR/privkey.pem")" = "$(cert_hash "$LEAF")" ] \
  || { echo "The certificate doesn't match $KEY_DIR/privkey.pem." >&2; exit 1; }
openssl x509 -in "$LEAF" -noout -checkhost "$DOMAIN" | grep -q "does match" \
  || { echo "The certificate isn't for $DOMAIN." >&2; exit 1; }
openssl verify -untrusted "$CHAIN" "$LEAF" >/dev/null \
  || { echo "The chain doesn't verify against the system trust store." >&2; exit 1; }

umask 077
install -d -m 0755 "$LIVE"
cat "$LEAF" "$CHAIN" > "$LIVE/fullchain.pem.new"
cp "$CHAIN" "$LIVE/chain.pem.new"
cp "$KEY_DIR/privkey.pem" "$LIVE/privkey.pem.new"
for file in fullchain chain privkey; do mv -f "$LIVE/$file.pem.new" "$LIVE/$file.pem"; done

openssl x509 -in "$LEAF" -noout -subject -issuer -enddate
/usr/local/sbin/harica-reload-nginx

# Nothing renews a manual certificate. Root crontab, daily: warn 30 days ahead
# (Ploi mails cron output to the server owner).
#   0 8 * * * openssl x509 -in /etc/harica/live/bioeconomia.apambiente.pt/fullchain.pem -noout -checkend 2592000 >/dev/null || echo "bioeconomia.apambiente.pt HARICA certificate expires within 30 days: ask APA for a new one."
