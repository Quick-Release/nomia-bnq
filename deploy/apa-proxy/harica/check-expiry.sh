#!/usr/bin/env bash
# Warns before the HARICA certificate for
# bioeconomia.apambiente.pt expires. Nothing renews it: APA issues each one by
# hand, so the warning is what starts a renewal.
#
#   /usr/local/sbin/harica-check-expiry          # the daily check
#   /usr/local/sbin/harica-check-expiry --test   # send a test alert, print the HTTP status
#
# Checks both the installed file and the certificate nginx actually serves
# (they differ if a reload failed). Prints nothing and exits 0 with more than
# 30 days left. Otherwise it prints one line and exits 1 (WARN, 30 days or
# fewer: renew now, with a CSR or a key and certificate from APA) or 2 (URGENT, 14 days or
# fewer: email them again, marked urgent, and tell our own team; there's no
# phone number and no second APA contact). Contacts: the plan's certificate
# runbook.
#
# Ploi crontab 352285 on server 125218, user root, daily:
#   0 8 * * * /usr/local/sbin/harica-check-expiry
# Ploi writes it to /etc/crontab with the output going to
# /root/scheduled-352285.log, so nothing is mailed. The alert goes to a Discord
# webhook instead: HARICA_NOTIFY_URL, read from NOTIFY_ENV (root-only, mode
# 0600; the same value as Sigillo prod's HARICA_NOTIFY_URL), so the URL is
# never on the crontab line or in argv.
set -uo pipefail

DOMAIN="bioeconomia.apambiente.pt"
FILE="/etc/harica/live/$DOMAIN/fullchain.pem"
WARN_DAYS=30
URGENT_DAYS=14
NOTIFY_ENV="/etc/harica/notify.env"

# HARICA_NOTIFY_URL from the environment, else from NOTIFY_ENV (one
# HARICA_NOTIFY_URL=... line; the file is read, never sourced).
notify_url() {
  if [ -n "${HARICA_NOTIFY_URL:-}" ]; then printf '%s' "$HARICA_NOTIFY_URL"; return; fi
  [ -r "$NOTIFY_ENV" ] && sed -n 's/^HARICA_NOTIFY_URL=//p' "$NOTIFY_ENV" | head -n1 | tr -d "\"'\r"
}

# POSTs one line to the webhook as Discord expects ({"content": ...}); prints
# the HTTP status (Discord answers 204).
notify() {
  local url text
  url="$(notify_url)"
  [ -n "$url" ] || { echo "No HARICA_NOTIFY_URL (environment or $NOTIFY_ENV)." >&2; return 1; }
  text="${1//\\/\\\\}"; text="${text//\"/\\\"}"
  # The URL goes to curl on stdin (-K -), not in argv.
  printf 'url = "%s"\n' "$url" | curl -sS -m 10 -o /dev/null -w '%{http_code}\n' -K - \
    -H 'Content-Type: application/json' -d "{\"content\":\"$text\"}"
}

days_left() { # PEM on stdin → whole days until notAfter
  local end
  end="$(openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)" || return 1
  [ -n "$end" ] || return 1
  echo $(( ($(date -d "$end" +%s) - $(date +%s)) / 86400 ))
}

if [ "${1:-}" = "--test" ]; then
  end="$(openssl x509 -in "$FILE" -noout -enddate | cut -d= -f2)"
  notify "bioeconomia HARICA expiry alert: test, cert expires $(date -u -d "$end" +%F)"
  exit $?
fi

file_days="$(days_left < "$FILE")" || file_days=-1
served_days="$(echo | openssl s_client -connect 127.0.0.1:443 -servername "$DOMAIN" 2>/dev/null | days_left)" || served_days=-1
days=$(( file_days < served_days ? file_days : served_days ))

if [ "$days" -gt "$WARN_DAYS" ]; then exit 0; fi
if [ "$days" -le "$URGENT_DAYS" ]; then level=URGENT; status=2; else level=WARN; status=1; fi
message="$level: the HARICA certificate for $DOMAIN expires in $days days (file: $file_days, served: $served_days). Renew: csr.sh and a CSR to APA (or a key and certificate from APA), then install-manual-cert.sh (docs/plans/apa-harica-proxy-and-cms-move.md)."
echo "$message"
status_code="$(notify "$message")"
case "$status_code" in 2??) ;; *) echo "Webhook failed (HTTP ${status_code:-none})." >&2 ;; esac
exit "$status"
