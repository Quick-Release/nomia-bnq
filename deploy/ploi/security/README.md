# Nomia authentication logging and login limiter

**Target correction:** Subsequent verification against freshly fetched
`origin/main` established that production has moved to server `125218`,
site `426661`, user `nomiacms`, with the operations environment mapped to
Sigillo `prod`. This checkout's older configuration targets former server
`102329`, site `419022`. The changes and checks below apply only to that
former server. They must not be presented as deployed production protection.
Production must be inspected independently before proposing adoption of
these snippets, particularly its current PHP handler and proxy configuration.

Applied to Ploi server `102329`, site `419022`, on 2026-10-30. These are
site-owned records of the configuration, not automatic deployment hooks.
Do not run provisioning to install them or overwrite the live virtual host.

- `auth-http.conf` mirrors the site's `before/nomia-auth-http.conf` include.
  It defines a unique map, shared-memory zone and sanitized JSON log format
  at HTTP scope, through the existing Ploi site include mechanism.
- `auth-server.conf` mirrors the added server-scope client-IP directive and
  exact login handler. Preserve the site's current PHP socket, parameters
  and missing-script behavior when changing PHP versions or this handler.
- `auth-logrotate.conf` mirrors `/etc/logrotate.d/nomia-auth`.

Only POST requests to `/wp/wp-login.php` consume the limiter: six requests
per minute per source IP, with five excess burst requests admitted immediately.
The limiter is **dry-run only**. Excess requests are recorded as
`REJECTED_DRY_RUN` without delay or rejection. A future enforcement change
would set `limit_req_dry_run off` and reject excess requests with HTTP 429.
Review normal editor traffic and shared-office behavior before doing so.
This POST scope also includes login-related reset submissions; it does not
distinguish successful from unsuccessful authentication.

All methods on the exact login endpoint are recorded in
`/var/log/nginx/nomia-auth/access.log`. Records contain time, client IP,
transport peer IP, method, a fixed endpoint label, status, limiter result and
duration. They omit the raw request, query string, body, username, cookies,
referer and authorization headers. Limiter diagnostic messages use notice
severity, below the site's error-log threshold, to avoid Nginx's built-in
limiter messages copying raw query strings into its error log.

The dedicated log directory is `root:ploi` mode 0750 so Nginx workers can
reopen logs. Rotation creates logs as `ploi:adm` mode 0640. Rotation is daily,
keeps seven archives and compresses older ones. `maxsize 10M` is evaluated
when the existing logrotate timer runs; it is not a continuous disk-size cap.
The separate subdirectory avoids overlap with the existing Nginx
`/var/log/nginx/*.log` rotation rule. A forced rotation and subsequent
logging were verified after fixing directory traversal permissions.

Client-IP restoration is site-scoped to `CF-Connecting-IP`, using the global
Cloudflare trusted-network list. Its networks matched Cloudflare's published
IPv4/IPv6 lists at implementation time. Direct-origin spoofed headers were
ignored, and two loopback source IPs received independent buckets. The trust
list must remain current; arbitrary proxies must never be added to it.

## Former-server verification and resolved target mismatch

`nginx -t`, reload, logrotate parsing, actual rotation/log reopen, sanitized
logging, dry-run excess accounting, independent client buckets and exclusion
of login GETs passed. Origin login, admin redirect, GraphQL and CSS returned
expected statuses. Previous uploads PHP denial and missing-script 404 checks
also passed. No real credentials or accounts were used for burst testing;
test POST bodies were empty. Nginx and the logrotate timer are active.

Public traffic coverage is **not established by these changes**. The initial
Cloudflare DNS observation pointed to `2.31.143.228`, while the older
checkout's Ploi target reported `176.9.29.221`. The source of that mismatch
is now established: [the committed production configuration](https://github.com/Quick-Release/nomia-bnq/blob/6f8345b/gq.ops.json)
targets server `125218`, site `426661`, user `nomiacms`, rather than the
former server inspected here. The [CMS move runbook](../../../docs/plans/apa-harica-proxy-and-cms-move.md#runbook-moving-the-cms-to-server-125218)
documents the migration. No DNS fix or origin override is proposed by this PR.

The remaining work is a separate audit of the current production target,
not resolution of a suspected DNS fault. Former-server probe results below
are historical evidence only; they do not prove the presence or absence of
these protections on current production. No DNS or Cloudflare policy was changed.

## Rollback

The pre-change virtual host is saved on the server at
`/root/nomia-nginx-before-auth-20261030.conf`, mode 0600. Through an authorized
root/Ploi operation, restore that file to the existing site virtual host,
remove only `before/nomia-auth-http.conf` and `/etc/logrotate.d/nomia-auth`,
run `nginx -t`, and reload Nginx. Preserve the logs for investigation.
The backup includes the earlier uploads PHP protection.

References: [Nginx rate limiting](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html),
[Nginx trusted client IPs](https://nginx.org/en/docs/http/ngx_http_realip_module.html),
[Cloudflare client-IP header](https://developers.cloudflare.com/fundamentals/reference/http-headers/).
