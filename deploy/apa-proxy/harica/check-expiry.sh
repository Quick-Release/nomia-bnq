#!/usr/bin/env bash
# DRAFT, not installed. Warns before the HARICA certificate for
# bioeconomia.apambiente.pt expires. Nothing renews it: APA issues each one by
# hand from a fresh CSR (csr.sh), so the warning is what starts a renewal.
#
#   /usr/local/sbin/harica-check-expiry
#
# Checks both the installed file and the certificate nginx actually serves
# (they differ if a reload failed). Prints nothing and exits 0 with more than
# 30 days left. Otherwise it prints one line and exits 1 (WARN, 30 days or
# fewer: send APA's certificate contact a CSR now) or 2 (URGENT, 14 days or
# fewer: email them again, marked urgent, and tell our own team; there's no
# phone number and no second APA contact). Contacts: the plan's certificate
# runbook.
#
# Root crontab (Ploi → Server 125218 → Cron jobs, user root), daily:
#   0 8 * * * /usr/local/sbin/harica-check-expiry
# Cron mails output to MAILTO only if the server can send mail. Set
# HARICA_NOTIFY_URL to also POST the line to a webhook (e.g. a chat channel).
set -uo pipefail

DOMAIN="bioeconomia.apambiente.pt"
FILE="/etc/harica/live/$DOMAIN/fullchain.pem"
WARN_DAYS=30
URGENT_DAYS=14

days_left() { # PEM on stdin → whole days until notAfter
  local end
  end="$(openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)" || return 1
  [ -n "$end" ] || return 1
  echo $(( ($(date -d "$end" +%s) - $(date +%s)) / 86400 ))
}

file_days="$(days_left < "$FILE")" || file_days=-1
served_days="$(echo | openssl s_client -connect 127.0.0.1:443 -servername "$DOMAIN" 2>/dev/null | days_left)" || served_days=-1
days=$(( file_days < served_days ? file_days : served_days ))

if [ "$days" -gt "$WARN_DAYS" ]; then exit 0; fi
if [ "$days" -le "$URGENT_DAYS" ]; then level=URGENT; status=2; else level=WARN; status=1; fi
message="$level: the HARICA certificate for $DOMAIN expires in $days days (file: $file_days, served: $served_days). Renew: csr.sh, send the CSR to APA, install-manual-cert.sh (docs/plans/apa-harica-proxy-and-cms-move.md)."
echo "$message"
if [ -n "${HARICA_NOTIFY_URL:-}" ]; then
  curl -fsS -m 10 -H 'Content-Type: application/json' \
    -d "{\"text\":\"$message\"}" "$HARICA_NOTIFY_URL" >/dev/null || echo "Webhook failed." >&2
fi
exit "$status"
