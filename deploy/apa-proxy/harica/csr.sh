#!/usr/bin/env bash
# DRAFT, not run. Fallback when APA can't give us HARICA ACME (EAB)
# credentials: generate a key and CSR on the VPS, send APA the CSR only, and
# install the certificate HARICA issues with install-manual-cert.sh.
#
#   sudo ./csr.sh
#
# The private key never leaves the server. HARICA takes the organisation
# details from APA's validated account, not from the CSR, so the subject
# carries the hostname only.
set -euo pipefail

DOMAIN="bioeconomia.apambiente.pt"
DIR="/etc/harica/manual/$(date -u +%Y%m%d)"

umask 077
install -d -m 0700 "$DIR"
[ -e "$DIR/privkey.pem" ] && { echo "$DIR already has a key; not overwriting it." >&2; exit 1; }

openssl req -new -newkey rsa:2048 -nodes \
  -keyout "$DIR/privkey.pem" -out "$DIR/$DOMAIN.csr" \
  -subj "/CN=$DOMAIN" \
  -addext "subjectAltName=DNS:$DOMAIN"

openssl req -in "$DIR/$DOMAIN.csr" -noout -verify -text | grep -E "Subject:|DNS:"
echo
echo "Send APA this CSR (public; safe to email):"
echo "  $DIR/$DOMAIN.csr"
echo "Keep $DIR/privkey.pem where it is."
