#!/usr/bin/env bash
# DRAFT, not run. Installs the certificate APA issued in HARICA from csr.sh's
# CSR at the paths nginx reads, then reloads nginx.
#
#   sudo ./install-manual-cert.sh /etc/harica/manual/<date> <fullchain.pem>
#
# <fullchain.pem>: what APA returns, in PEM: the certificate for
# bioeconomia.apambiente.pt first, then HARICA's intermediate(s). A root at the
# end is tolerated and left out of what nginx serves.
#
# Nothing changes unless every check passes: the certificate matches the key
# from the same CSR, names the hostname, chains to a trusted HARICA root, and
# is valid now. The previous files are kept as *.pem.previous for rollback.
set -euo pipefail

DOMAIN="bioeconomia.apambiente.pt"
KEY_DIR="${1:?key directory from csr.sh}"
FULLCHAIN="${2:?full chain PEM from APA}"
LIVE="/etc/harica/live/$DOMAIN"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Split the bundle: cert-1.pem is the leaf, the rest its issuers in order.
awk -v dir="$WORK" '/-----BEGIN CERTIFICATE-----/ { n++ } n { print > (dir "/cert-" n ".pem") }' "$FULLCHAIN"
[ -f "$WORK/cert-2.pem" ] || { echo "$FULLCHAIN has no intermediate; ask APA for the full chain." >&2; exit 1; }
LEAF="$WORK/cert-1.pem"
: > "$WORK/chain.pem"
for cert in $(ls "$WORK"/cert-*.pem | sort -V | tail -n +2); do
  # A self-signed certificate is the root: browsers have it, nginx shouldn't send it.
  [ "$(openssl x509 -in "$cert" -noout -subject_hash)" = "$(openssl x509 -in "$cert" -noout -issuer_hash)" ] && continue
  cat "$cert" >> "$WORK/chain.pem"
done

key_hash() { openssl pkey -in "$1" -pubout | openssl sha256; }
cert_hash() { openssl x509 -in "$1" -noout -pubkey | openssl sha256; }

[ "$(key_hash "$KEY_DIR/privkey.pem")" = "$(cert_hash "$LEAF")" ] \
  || { echo "The certificate doesn't match $KEY_DIR/privkey.pem (wrong CSR?)." >&2; exit 1; }
openssl x509 -in "$LEAF" -noout -checkhost "$DOMAIN" | grep -q "does match" \
  || { echo "The certificate isn't for $DOMAIN." >&2; exit 1; }
openssl x509 -in "$LEAF" -noout -issuer | grep -qi harica \
  || { echo "The certificate isn't issued by HARICA." >&2; exit 1; }
openssl verify -untrusted "$WORK/chain.pem" "$LEAF" >/dev/null \
  || { echo "The chain doesn't verify against the system trust store." >&2; exit 1; }
openssl x509 -in "$LEAF" -noout -checkend 0 >/dev/null \
  || { echo "The certificate has already expired." >&2; exit 1; }

umask 077
install -d -m 0755 "$LIVE"
for file in fullchain chain privkey; do
  [ -f "$LIVE/$file.pem" ] && cp -p "$LIVE/$file.pem" "$LIVE/$file.pem.previous"
done
cat "$LEAF" "$WORK/chain.pem" > "$LIVE/fullchain.pem.new"
cp "$WORK/chain.pem" "$LIVE/chain.pem.new"
cp "$KEY_DIR/privkey.pem" "$LIVE/privkey.pem.new"
for file in fullchain chain privkey; do mv -f "$LIVE/$file.pem.new" "$LIVE/$file.pem"; done

openssl x509 -in "$LEAF" -noout -subject -issuer -enddate
if ! /usr/local/sbin/harica-reload-nginx; then
  echo "Restoring the previous certificate." >&2
  for file in fullchain chain privkey; do
    [ -f "$LIVE/$file.pem.previous" ] && mv -f "$LIVE/$file.pem.previous" "$LIVE/$file.pem"
  done
  exit 1
fi
