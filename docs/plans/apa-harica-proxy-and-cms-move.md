# bioeconomia.apambiente.pt behind a HARICA proxy, and the CMS move

Status: **draft, nothing applied**. Investigated 2026-10-28.

APA requires a HARICA certificate on `bioeconomia.apambiente.pt`. Cloudflare
for SaaS on the `bnq.pt` Pro plan can't serve one, so the custom hostname
created on 2026-10-28 is abandoned (left in place, not deleted) and draft PR
#99 stays unmerged. The decided architecture:

```
visitor ──HTTPS (HARICA)──▶ nginx, APA VPS (Hetzner, Ploi 125218) ──HTTPS──▶ nomia.bnq.pt (Frontend Worker)
APA DNS: bioeconomia.apambiente.pt  A  <VPS IP>
```

APA won't provide HARICA ACME credentials (decided 2026-10-28), so every
certificate is issued by hand: we generate the key and CSR on the VPS, APA
issues it in HARICA, and we install it. HSTS is adopted for
`bioeconomia.apambiente.pt` only, staged from one day to one year.

The Site's WordPress (`nomia-cms.bnq.pt`) moves to the same VPS and keeps a
normal Let's Encrypt (or Cloudflare Origin CA) certificate.

Files:

- [`deploy/apa-proxy/nginx/bioeconomia.apambiente.pt.conf`](../../deploy/apa-proxy/nginx/bioeconomia.apambiente.pt.conf)
  and its snippet [`bioeconomia-proxy.conf`](../../deploy/apa-proxy/nginx/bioeconomia-proxy.conf)
- [`deploy/apa-proxy/harica/`](../../deploy/apa-proxy/harica/): the manual
  HARICA certificate cycle: `csr.sh` (key and CSR), `install-manual-cert.sh`
  (installs APA's certificate and full chain), `reload-nginx.sh` (its reload
  hook) and `check-expiry.sh` (warns at 30 and 14 days)

`VPS_IP` below is server 125218's IPv4 and `OLD_IP` server 102329's
(`gq ploi server show --server <id>`). Both stay out of this public
repository: the old one is a Cloudflare-proxied origin.

## Findings

### The new server (Ploi 125218, "aged-hill")

|                                     |                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| Provider                            | Hetzner, created 2026-10-28 17:16 UTC, status active                                 |
| IPv4                                | one public address; Ploi reports no internal IP and no IPv6                          |
| PHP                                 | 8.5.12 only (CLI 8.5). The CMS runs 8.4.27 on 102329; `composer.json` allows `>=8.3` |
| MySQL                               | 8.4 (same as 102329)                                                                 |
| Sites, databases, daemons, crontabs | none                                                                                 |
| State                               | **reboot required**, 6 package updates pending, OPcache **off**                      |

Since then (rechecked read-only on 2026-10-28, after the reboot):

- the server is rebooted and updated;
- nginx is 1.30.6 and MySQL 8.4.11, both active;
- OPcache is running in PHP-FPM 8.5, but Ploi's OPcache switch is still off;
- it has 4 vCPU, 8 GB RAM and 133 GB free disk.

The CMS **moves to PHP 8.5** (decided 2026-10-28): the latest PHP already on
the server. PHP 8.4 won't be installed, so the move also upgrades PHP from
8.4.27 to 8.5.12 (see "PHP 8.5" below). Everything else the CMS needs is
created by `gq ploi provision`.

### PHP 8.5

Checked read-only on 2026-10-28. **No blockers found.**

- **Constraints.**
  - `composer.json` `require.php` is `>=8.3`, with no `config.platform.php`;
    the lock records `>=8.3`.
  - The effective floor is **8.4.1**, set by the GETQUICK packages
    (getquick-theme, gq-config, gq-content, gq-design) and
    `symfony/filesystem` 8.1.
  - No locked package caps PHP below 8.5. Every constraint is open-ended
    (`>=`, `^8.0`) or unset (Gravity Forms and the wp-plugin/ packages
    declare none).
  - `gq-bioeconomia` declares `Requires PHP: 8.4`.
- **WordPress** is 7.1.3 (`roots/wordpress`). The core handbook's
  compatibility table lists PHP 8.5 as supported from 6.9 on, and it retired
  the "beta support" label in May 2026.
- **Lint.** `php8.5 -l` over the 7,160 deployed PHP files (`web/`,
  `vendor/`, `config/` on 102329, which also has PHP 8.5.12) finds no
  errors. 8.5 reports the same compile-time deprecations as 8.4: 23
  "implicitly nullable parameter" notices in WordPress's
  `sodium_compat` (Core32), WPGraphQL's connection resolver and its bundled
  graphql-relay-php. These already appear on 8.4 today; deprecations aren't
  errors. Runtime deprecations (for example 8.5's null array offsets) only
  show when code runs, so the verification step below covers them. No
  PHPCompatibility scan was run: lint plus a real run on a copy of production
  is the stronger check.
- **CI and tooling build on 8.4 and deploy to 8.5.** None of these blocks
  the move; report only:
  - the CI Worker image (`infra/ci/Dockerfile`, managed by gq-site) installs
    `php8.4-cli`;
  - DDEV (`apps/cms/.ddev/config.yaml`, managed) runs `php_version: "8.4"`;
  - `design-nightly.yml` (site-owned) uses `setup-php` 8.4;
  - `phpcs.xml.dist` (site-owned) tests `8.4-`.

  Production runs `composer install` on the server itself (8.5), with no
  platform pin, so locked versions are installed as they are. Matching DDEV
  and CI to 8.5 would be a gq-site change (managed files) and a small
  site-owned one.

- **gq provisioning** sets no PHP version (the site gets the server default,
  8.5). `gq-site` has Ploi API entries for changing a site's PHP version, but
  provision doesn't use them.
- **Differences on the new server's PHP 8.5** from the old 8.4:
  - **`imagick` is missing.** WordPress falls back to GD, which is present,
    but image sizes and conversions may differ slightly.
  - **FPM limits are Ploi's defaults:** `memory_limit` 128M,
    `upload_max_filesize` and `post_max_size` 2M. The old server has 256M
    and 50M, so uploads over 2 MB would fail.
  - Everything else the CMS uses is present (curl, dom, exif, gd, intl,
    mbstring, mysqli, sodium, xml, zip). 8.5 adds `lexbor` and `uri`.

### The current WordPress

|                        |                                                                                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ploi                   | server 102329 ("getquick", shared with 32 other sites), site 419022                                                                                                                                                     |
| Hostname               | `nomia-cms.bnq.pt`, Cloudflare-proxied A record to the old server                                                                                                                                                       |
| Certificate            | Let's Encrypt, active, expires 2027-01-12                                                                                                                                                                               |
| Database               | `nomia_bnq_staging` (a legacy default name; it _is_ production), about 1.2 MB gzipped (latest `db/` backups on R2)                                                                                                      |
| Site disk              | 212 MB (code and vendor; releases come from R2)                                                                                                                                                                         |
| Media                  | S3 Uploads to R2 `nomia-bnq-media` (`nomia-media.bnq.pt`): 2,009 objects, 1.56 GB, under `uploads/`. Nothing to copy, but check the server's `web/app/uploads` is empty                                                 |
| Cron                   | Ploi crontab 343982, every minute as `nomiabnq`: `wp gq-events retry-due` (`gq ploi events` creates it). WP-Cron is disabled                                                                                            |
| Queue workers, daemons | none                                                                                                                                                                                                                    |
| Backups                | **no scheduled backup of this database.** Only `pnpm db:backup` by hand (R2 `nomia-bnq-releases/db/`, 12 dumps, latest 2026-10-26). The only Ploi backup for Nomia is paused and covers the old `nomiabdadmin` database |

`.env` keys (names only): `DB_NAME DB_USER DB_PASSWORD DB_HOST DB_PREFIX
WP_ENV WP_ENVIRONMENT_TYPE WP_HOME WP_SITEURL GRAPHQL_DEBUG
GRAPHQL_CORS_ORIGINS GETQUICK_FRONTEND_URL PUBLICATION_EVENT_SECRET
S3_UPLOADS_BUCKET S3_UPLOADS_KEY S3_UPLOADS_SECRET S3_UPLOADS_ENDPOINT
S3_UPLOADS_BUCKET_URL DISABLE_WP_CRON AUTH_KEY SECURE_AUTH_KEY LOGGED_IN_KEY
NONCE_KEY AUTH_SALT SECURE_AUTH_SALT LOGGED_IN_SALT NONCE_SALT
GETQUICK_CONSENT_READ_TOKEN GQ_EMAIL_CLOUDFLARE_API_TOKEN`.

- The **server move** changes only `DB_PASSWORD` (Ploi creates a new database
  user). It should keep every other value, salts included.
- **Go-live on `bioeconomia.apambiente.pt`** changes:
  - `GETQUICK_FRONTEND_URL='https://bioeconomia.apambiente.pt'` (permalinks,
    editor previews through `GQ_BIOECONOMIA_FRONTEND_URL`, publication events,
    and the consent read token's origin)
  - `GRAPHQL_CORS_ORIGINS='https://bioeconomia.apambiente.pt,https://nomia.bnq.pt'`
  - `WP_HOME` and `WP_SITEURL` stay on `nomia-cms.bnq.pt`.

### How the blueprint ties the CMS to its server

`gq.ops.json` `ploi.serverId` (102329) and `ploi.siteId` (419022) are the only
link. Every Ploi command scopes its API client to `serverId` and acts on
`siteId`:

- `gq ploi provision` looks up the system user, site and database by name _on
  `serverId`_ and creates whatever is missing.
- `gq ploi release` and CI releases (`gq ci deploy`, the CI Worker) deploy to
  `siteId`.
- `gq ploi events` and `gq ploi media` patch that site's `.env` and crontab.
- `gq db sync` and `gq db backup` export from it through a Ploi script.
- `gq site check` and `gq media check` read its `.env`.

Outside `gq.ops.json`, the move also touches `design-nightly.json`
(`ploiSiteId: "419022"`, which `scripts/design-nightly/run.mjs` checks against
`gq.ops.json`). The one-off `scripts/migrate-nomia-admin/*-remote.mjs`
hardcode `serverId: "102329"`; they're finished tooling, so leave them as a
historical record or point them at `ops.ploi.serverId`.

**What the blueprint (`@getquick/site` 0.24.1) lacks for a server move.** It
has no supported path:

1. **No move command.** Changing `ploi.serverId` makes `gq ploi provision`
   build a new site, and it never carries state across. Its `database` step
   renders `.env` from `apps/cms/.env.production.example` with a new
   password and **new salts**. It drops `PUBLICATION_EVENT_SECRET`, the
   S3 Uploads keys, `GETQUICK_CONSENT_READ_TOKEN` and
   `GQ_EMAIL_CLOUDFLARE_API_TOKEN`. `gq ploi events` and `gq ploi media`
   restore three of those four. `GQ_EMAIL_CLOUDFLARE_API_TOKEN` has no
   command and has to be copied by hand.
2. **No restore.** `gq db backup` dumps to R2, but nothing restores a dump
   into a Ploi database. The export-only guard is deliberate (this repository's
   AGENTS.md forbids pushing a local database to Ploi), and it doesn't
   distinguish a production-to-production restore. That decision is
   gq-site #31 ("The data-recovery gate").
3. **The certificate step can't succeed behind Cloudflare's proxy.**
   Provision only requests Let's Encrypt when the admin hostname _resolves to
   the server's IP_. A proxied record resolves to Cloudflare, so the plan stays
   at "warn" and the certificate is a manual step.
4. **No PHP version.** Provision creates the site at the server's default
   PHP, 8.5 on the new server.
5. **No database backups.** Nothing schedules them (Ploi backup or otherwise).

Owner: `Quick-Release/gq-site` (`/data/code/getquick/gq-site`). Raise these
there in a new session. This plan works around them by hand.

### The Frontend behind the proxy

The Worker keeps its Custom Domain `nomia.bnq.pt`. Every proxied request
reaches it with `Host: nomia.bnq.pt`, so `request.url` and `Astro.url` are
`https://nomia.bnq.pt/...`. The Alchemy Astro adapter for Workers ignores
`X-Forwarded-Host`; only Astro's Node adapter reads it, with
`security.allowedDomains`.

- **Canonicals and hreflang** come from `Astro.site`
  (`src/layouts/Layout.astro`), which is `https://${domains.frontend}` (from
  `infra/frontend.run.ts` and `astro.config.mjs`). With `domains.frontend` set
  to `bioeconomia.apambiente.pt` they're correct behind the proxy. Content
  links, menus and the CMS chrome are made relative against `Astro.site` and
  `Astro.url` (`internalOrigins`), so both hosts count as internal.
- **No sitemap and no OG/Twitter tags** exist today. `public/robots.txt` is
  static, with no `Sitemap:`.
- **Pagination and filter links** are relative (`listingPageHref`). The search
  form's action becomes absolute only when its target is on another origin.
  It still works.
- **Map tiles break.** `src/lib/map-tiles.ts` writes `url.origin`
  (`https://nomia.bnq.pt`) into the style and TileJSON it proxies, so the
  browser fetches tiles cross-origin, and the responses carry no CORS headers.
  This is a Site fix (use the Site's public origin). Until then the nginx draft
  rewrites the JSON (`sub_filter` on `/gq/map/`).
- **Forms and consent posts would get a 403.** `@getquick/content`'s
  `isSameOrigin` accepts the request's own origin, its `Host`, or
  `siteOrigins`. The managed routes `src/pages/gq/forms/[...rest].ts` and
  `src/pages/gq/consent.ts` don't pass `siteOrigins`. Astro's `checkOrigin`
  has the same issue for browsers without `Sec-Fetch-Site`. The nginx draft
  rewrites `Origin: https://bioeconomia.apambiente.pt` to
  `https://nomia.bnq.pt`. The real fix is for the gq-site templates to pass
  `siteOrigins: [site.origin]`, since the package already supports proxies.
- **Client IP.** The adapter's `clientAddress` and the forms and consent
  servers use `CF-Connecting-IP`. Behind the proxy that header is always the
  VPS IP, and Cloudflare overwrites whatever the proxy sends. So:
  - `FORMS_RATE_LIMITER` (10 per minute per form _per IP_) becomes 10 per
    minute per form for the whole site.
  - `CONSENT_RATE_LIMITER` (30 per minute per IP) becomes 30 consent decisions
    per minute for the whole site. A traffic spike would turn away decisions
    with 429.

  The nginx draft limits per visitor itself. The real fix is a trusted-proxy
  option in `@getquick/content`: use `X-Real-IP` only when `CF-Connecting-IP`
  is a configured proxy. That belongs to `Quick-Release/gq-content`, with the
  binding wired by gq-site.

- **CORS and preview hosts.** The Worker sets no CORS of its own. The CMS's
  GraphQL CORS list is `GRAPHQL_CORS_ORIGINS` (above). `gq.ops.json` has no
  `preview`. Production keeps workers.dev previews (`previewsEnabled`). The
  editor's block previews load `GQ_BIOECONOMIA_FRONTEND_URL` in an iframe, so
  the proxy must not add `X-Frame-Options` (the draft adds none).
- **PR #99 no longer fits.** With `domains.frontendTarget` set,
  `@getquick/site` 0.25.0 always adds a Worker route
  `bioeconomia.apambiente.pt/*` on zone `bnq.pt` for Cloudflare for SaaS.
  Behind a proxy, only `astro.site` should change. Rework #99 once gq-site has
  a "public hostname served by an external proxy" mode: `astro.site` set to
  the public host, Custom Domain on `frontendTarget`, and no route.
- **`nomia.bnq.pt` stays public**, which duplicates the site under a second
  host. Canonicals point to the public host. Optionally, once live, add a
  Cloudflare redirect from `nomia.bnq.pt` to `https://bioeconomia.apambiente.pt`
  for requests whose `ip.src` isn't `VPS_IP`.

### Cloudflare rules on `bnq.pt`

Plan Pro. Security level `medium`, Browser Integrity Check on, `always_use_https`
off, SSL mode `full` (not strict), minimum TLS 1.0. The Sigillo token can't
read rulesets, WAF, rate-limit rules or Bot Fight Mode settings
(authentication error), so they're unchecked. Every proxied visitor arrives
from `VPS_IP`, so IP-based features see one heavy client. Add one custom rule,
`http.host eq "nomia.bnq.pt" and ip.src eq VPS_IP`, with action _Skip_:

- Security Level
- rate-limiting rules
- Super Bot Fight Mode (if it's on)

Keep the managed WAF rules: they inspect payloads, not addresses. nginx
limits per visitor in their place.

### HSTS upstream

Checked read-only on 2026-10-28: the `bnq.pt` zone's HSTS setting
(`security_header`) is **disabled** and has never been modified (max-age 0,
no includeSubDomains, no preload), and `https://nomia.bnq.pt/` sends no
`Strict-Transport-Security`. Nothing upstream sends HSTS today. The proxy
drops any it might send later anyway (`proxy_hide_header`), so the only HSTS
APA's visitors get is the proxy's own.

### APA's DNS today

Queried APA's authoritative server (`apadns.apambiente.pt`) on 2026-10-28.
`bioeconomia.apambiente.pt` has no A, AAAA or CAA records yet. The records
our first email asked for for Cloudflare for SaaS aren't there either:
`_cf-custom-hostname.bioeconomia` (TXT) and `_acme-challenge.bioeconomia`
(CNAME). With no CAA on the hostname, it inherits `apambiente.pt`'s
`128 issue "harica.gr"`, which allows HARICA.

### Draft checked locally

On 2026-10-28 the nginx draft ran in `nginx:stable` (1.30.6), with a
throwaway self-signed certificate, against the live Worker. Results:

- `nginx -t` passes. The only warning is no stapling, which a self-signed
  certificate can't have.
- HTTPS responses carry `Strict-Transport-Security: max-age=86400`,
  including `/_astro/*` (which adds its own `X-Proxy-Cache`). The port-80
  redirect carries none.
- The manual certificate cycle ran against a throwaway CA named like HARICA,
  trusted in the container:
  - `csr.sh` wrote the key and CSR, and `install-manual-cert.sh` installed
    leaf, intermediate and root as APA would send them. nginx serves leaf and
    intermediate; the root is dropped.
  - A certificate that doesn't match the key is refused, and nothing changes.
  - `check-expiry.sh`: 60 days left prints nothing (exit 0), 19 days prints
    WARN (exit 1), 10 days prints URGENT (exit 2).
- `http://…/x` returns 301 to `https://bioeconomia.apambiente.pt/x`.
- `/` returns 200 through the proxy, with canonical still
  `https://nomia.bnq.pt/` (it changes once `domains.frontend` does).
- `/_astro/*.css` is a MISS, then a HIT (`immutable` upstream).
- `/gq/map/styles/liberty` carries `https://bioeconomia.apambiente.pt/gq/map/…`
  tile URLs.
- `POST /gq/consent` with `Origin: https://bioeconomia.apambiente.pt` gets a
  403 straight from the Worker ("Consent records are accepted from this Site
  only."). Through the proxy, the same post gets past the origin guard (400
  for the empty test body).

## Runbook: proxy and certificate

**APA certificate contact:** APA's named certificate contact. Their name and
address are in `AGENTS.local.md` in the main checkout; this repository is
public, so they aren't recorded here. Reach them by **email only** (there's
no phone number). They usually reply within an hour, and a CSR is expected to
be turned around **the same day**. They issue in HARICA from our CSR and
return the certificate and full chain in PEM.

**No escalation contact at APA.** The certificate contact is also our APA
project contact, so there's no second person to escalate to.

**Key type:** RSA 2048 (decided 2026-10-28), as `csr.sh` generates.

1. Ploi, server 125218: reboot, apply updates, `nginx -v` (if older than
   1.25.1, use `listen 443 ssl http2;`).
2. Ploi: create site `bioeconomia.apambiente.pt` (no repository). Copy
   `bioeconomia-proxy.conf` to `/etc/nginx/snippets/`. Install the scripts as
   root: `reload-nginx.sh` as `/usr/local/sbin/harica-reload-nginx` and
   `check-expiry.sh` as `/usr/local/sbin/harica-check-expiry`; keep `csr.sh`
   and `install-manual-cert.sh` in `/root/harica/`.
3. Until there's a certificate, serve only the port-80 block. Comment out the
   443 server, then `nginx -t && systemctl reload nginx`.
4. DNS, APA:
   - `bioeconomia.apambiente.pt A VPS_IP`, TTL 300.
   - **No AAAA**: the server has no IPv6.
   - **Remove what our first email asked for, if they created any of it:**
     TXT `_cf-custom-hostname.bioeconomia`, CNAME
     `_acme-challenge.bioeconomia`, and any CAA on `bioeconomia`. None
     resolved on 2026-10-28, but a CAA added since without `harica.gr` would
     block HARICA issuance. With no CAA on the hostname, `apambiente.pt`'s
     `issue "harica.gr"` applies.
   - The hostname has no record today, so nobody loses service while it's
     half set up.
5. Certificate (the same steps for every renewal):
   1. `sudo /root/harica/csr.sh` writes a new key and CSR to
      `/etc/harica/manual/<date>/`. The key never leaves the server.
   2. Email the CSR to APA's certificate contact and ask for the certificate
      and full chain in PEM.
   3. Copy what they return to the server, then
      `sudo /root/harica/install-manual-cert.sh /etc/harica/manual/<date> <fullchain.pem>`.
      It checks key, hostname, HARICA issuer, chain and validity before
      changing anything. It keeps the previous files as `*.pem.previous`,
      and restores them if nginx won't reload.
   4. Root crontab, daily: `0 8 * * * /usr/local/sbin/harica-check-expiry`.
6. Enable the 443 server, `nginx -t`, reload.
7. Check from outside, before announcing:
   - `curl -sI https://bioeconomia.apambiente.pt/`: 200, HARICA issuer
     (`openssl s_client -connect bioeconomia.apambiente.pt:443 -servername bioeconomia.apambiente.pt`),
     and `Strict-Transport-Security: max-age=86400` with no
     `includeSubDomains` or `preload`.
   - `curl -sI http://bioeconomia.apambiente.pt/x`: 301 to https, with no HSTS.
   - A page's `<link rel="canonical">` (correct only after the
     `domains.frontend` change below).
   - The map loads tiles from `bioeconomia.apambiente.pt/gq/map/`.
   - A Gravity Forms submission and a consent decision both succeed (not 403).
   - `/_astro/*` shows `X-Proxy-Cache: HIT` on a second request.
8. Go-live configuration, in order:
   1. The `domains.frontend` change (reworked #99) and a release. Canonicals
      and `Astro.site` move to `bioeconomia.apambiente.pt`.
   2. The CMS `.env`: `GETQUICK_FRONTEND_URL` and `GRAPHQL_CORS_ORIGINS`
      (above).
   3. A publish: the event reaches the Frontend (`pnpm frontend:events:check`)
      and `pnpm site:check` is Ready.

### Renewal cadence

There's no ACME, so nothing renews automatically. A HARICA TLS certificate
lasts at most **200 days** today and at most **100 days** for certificates
issued from **15 March 2027** (CA/Browser Forum ballot SC-081). Start each
renewal with a new CSR about **30 days before expiry**:

- `harica-check-expiry` prints nothing until then.
- At 30 days or fewer it prints `WARN` (exit 1): send APA the new CSR.
- At 14 days or fewer it prints `URGENT` (exit 2). Email the certificate
  contact again, marked urgent, and tell our own team. There's no phone
  number and no second APA contact.

The script checks both the installed file and the certificate nginx serves.
Cron mails its output only if the server can send mail. Set
`HARICA_NOTIFY_URL` (a webhook) in the crontab line as well, and put each
expiry date in the team calendar. From March 2027 this is a renewal about
every 2–3 months.

APA turns a CSR around the same day, so the 30-day lead time leaves a wide
margin. URGENT should only fire if a WARN was missed or APA's contact is away.

### Raising HSTS

The max-age lives in one place: the `map` at the top of
`bioeconomia.apambiente.pt.conf` (`$bioeconomia_hsts_max_age`). It is always
without `includeSubDomains` and without `preload`.

1. Go-live: `86400` (one day). A broken certificate or proxy then locks
   browsers out for a day at most.
2. After a week with no certificate or proxy incident, and with
   `harica-check-expiry` installed and tested, change it to `31536000`. Then
   `nginx -t && systemctl reload nginx`, and check with
   `curl -sI https://bioeconomia.apambiente.pt/ | grep -i strict`.
3. To back out, set `max-age=0`. Browsers drop the policy on their next
   HTTPS visit.

## Runbook: moving the CMS to server 125218

Downtime estimate: **visitors: none.** The Frontend serves from its D1
publication store and only reads the CMS on events and reconciliation.
**Editors: a 20–30 minute content freeze.** The CMS's own API is unreachable
for under a minute while the proxied A record switches (Cloudflare applies it
in seconds; TTL doesn't matter for proxied records).

Every step that writes to a server or database is a human step that the
owner approves. The import is a production restore, which the blueprint
doesn't support (above).

### Preparation (no freeze)

1. Ploi, server 125218 (PHP 8.5, already installed):
   - Turn on OPcache (Server → PHP).
   - Install `php8.5-imagick`.
   - Raise PHP 8.5's FPM limits to the old server's: `memory_limit` 256M,
     `upload_max_filesize` and `post_max_size` 50M.
2. A new-server config beside the real one. `gq.ops.new-server.json` is a
   copy of `gq.ops.json` with `ploi.serverId: "125218"` and no `ploi.siteId`.
   Don't commit it. Every `gq` command below gets
   `--config gq.ops.new-server.json`.
3. `pnpm exec gq sigillo run staging -- gq --config gq.ops.new-server.json ploi provision --dry-run`,
   then without `--dry-run`. It creates system user `nomiabnq`, site
   `nomia-cms.bnq.pt` (`/apps/cms/web`), custom deployments, database
   `nomia_bnq_staging` with a new user and password, `.env` and the deploy
   script. It records the new `siteId` in the new-server config. The
   certificate stays at "warn" (see the blueprint gaps).
4. `.env`. In the Ploi dashboard, replace the new site's `.env` with the old
   site's, keeping only the **new** `DB_PASSWORD` (and `DB_HOST` if it
   differs). This keeps salts, so sessions and nonces stay valid. It also
   keeps the event secret, S3 Uploads keys, consent read token and
   `GQ_EMAIL_CLOUDFLARE_API_TOKEN`. Never paste values into chat, issues or
   commits.
5. `gq --config gq.ops.new-server.json ploi events --dry-run`. It should
   plan only the retry crontab, because the copied `.env` already has the
   event secret. Don't apply it yet: a second scheduler on a copy of
   production would send events alongside the old server's. It's applied at
   cutover. Then `ploi media --dry-run`: it should report nothing to change.
6. Rehearsal import. This proves the path and leaves the new site running on
   yesterday's data:
   - Safety dump: `pnpm db:backup` (old server, to R2).
   - Server to server, from a machine with SSH to both as `nomiabnq` (Ploi →
     SSH keys):
     ```sh
     ssh nomiabnq@OLD_IP 'cd ~/nomia-cms.bnq.pt/apps/cms && wp db export - --single-transaction' \
       | ssh nomiabnq@VPS_IP 'mysql --defaults-extra-file=~/.my-nomia.cnf nomia_bnq_staging'
     ```
     `~/.my-nomia.cnf` on the new server (mode 0600) holds the new database
     user and password, so neither appears in argv.
   - Uploads: `ssh nomiabnq@OLD_IP 'du -sh ~/nomia-cms.bnq.pt/apps/cms/web/app/uploads'`.
     If it isn't empty, `rsync -a` it across the same way.
7. `gq --config gq.ops.new-server.json ploi release` for the current release
   tag. Composer install and the deploy script's plugin and locale activation
   run against the imported database.
8. **PHP 8.5 verification on a copy of production. Required before the DNS
   switch.** The new site now runs PHP 8.5 on yesterday's production
   database (step 6). Reach it without DNS through a hosts entry for
   `nomia-cms.bnq.pt` pointing at `VPS_IP`, or with `curl --resolve`; use
   `-k` until it has a certificate.
   1. Turn on logging. Production config fixes `WP_DEBUG_LOG` and
      `WP_DEBUG_DISPLAY` to `false` (`apps/cms/config/application.php`), so
      the log is PHP's own:
      - Set `WP_DEBUG=true` in the new site's `.env` for the test, which
        makes WordPress report `E_ALL`.
      - Find where PHP-FPM 8.5 writes errors:
        `php-fpm8.5 -i | grep -E '^(log_errors|error_log) '`, and any
        `php_admin_value[error_log]` in `/etc/php/8.5/fpm/pool.d/`.
      - If nothing is set, point `error_log` at a file for the test (Ploi →
        PHP settings), then reload FPM.
      - WP-CLI runs print to the terminal.
   2. **wp-admin.** Log in, then open:
      - the dashboard and Posts;
      - one of each gq-bioeconomia type;
      - Media: upload a file over 2 MB and check it lands in R2;
      - GQ Design;
      - GQ Config (Consent and Email tabs; use Email → Test);
      - Gravity Forms;
      - Simple History.

      Edit a page in the block editor and **preview** a block, which loads
      the Frontend iframe. Don't publish from the copy: a publish sends an
      event to the production Frontend.

   3. **GraphQL, as the Frontend calls it.** The Frontend's endpoint is
      `https://nomia-cms.bnq.pt/wp/graphql`, reached with the edge identity
      `GQ_AUTH_GRAPHQL_CLIENT_ID`/`_SECRET` from Sigillo staging. Query the
      same things on both servers and compare:
      - the page count;
      - a page by URI with its blocks;
      - a menu;
      - the GQ Design chrome (header and footer patterns);
      - one item of each collection the Listings use.

      Compare too with `wp post list --post_type=<type> --format=count` as
      `nomiabnq` on each server.

   4. **Forms.** A Gravity Forms submission straight to the new CMS's REST
      endpoint (what `/gq/forms/` relays). Check the entry, then delete the
      test entry on the new copy only.
   5. **Events.** As `nomiabnq`:
      - `wp gq-events delays` (read-only) first.
      - `wp gq-events retry-due` should report `Sent 0 due event(s)`. If
        anything is due, it would go to the production Frontend, so stop and
        look first.
      - `wp gq-events reconcile`: the Frontend compares against the CMS it
        reads, still the old server, so this is harmless.
      - Also `wp core is-installed` and `wp plugin list` (every plugin
        active, none "must-use" missing).
   6. **Logs.** No PHP `Fatal error` or `Warning` from this Site's code, and
      no new `Deprecated` beyond the known 8.4-era implicit-nullable notices
      (see "PHP 8.5"). Any 8.5-only deprecation from a GETQUICK package goes
      to its repository (gq-content, gq-design, …), and from a third-party
      plugin to a pinned update or patch. Either is a blocker only if it is
      a Fatal or Warning on a path editors use.
   7. Set `WP_DEBUG` back to `false`, and undo any test `error_log`
      setting.

   If something fails on 8.5, the move waits. Install PHP 8.4 on 125218 as a
   fallback (a Ploi step), set the site to it, and repeat this step.

9. Certificate for `nomia-cms.bnq.pt` on the new server. The record is
   proxied and SSL mode is `full`, so Cloudflare accepts any origin
   certificate during the switch. Preferred: a **Cloudflare Origin CA**
   certificate for `nomia-cms.bnq.pt`, installed in Ploi as a custom
   certificate. It needs no DNS and allows Full (strict) later. Or Let's
   Encrypt from Ploi after the switch: HTTP-01 reaches the origin through the
   proxy because Always Use HTTPS is off.

### Cutover (freeze)

1. Tell editors: no edits from T until T+30 min.
2. Pause automation:
   - no `v*` tags
   - disable the `design-nightly` workflow
   - disable crontab 343982 on 102329 (Ploi → Server → Cron)
3. Old CMS read-only: `wp maintenance-mode activate` on 102329. The public
   Frontend isn't affected.
4. Final dump and import: step 6 again, with `pnpm db:backup` first. The
   database is about 1.2 MB gzipped, so this takes seconds.
5. `gq --config gq.ops.new-server.json ploi events`. This adds the retry
   crontab on 125218, now that the old one is paused.
6. Cloudflare DNS, zone `bnq.pt`: change `nomia-cms.bnq.pt A OLD_IP`
   (proxied) to `VPS_IP` (proxied).
7. Check:
   - wp-admin login
   - edit and publish a test change; the event is delivered
     (`gq --config gq.ops.new-server.json frontend events check`)
   - a media upload lands in R2
   - GQ Email's Test sends
   - a Gravity Forms submission arrives
   - `gq --config gq.ops.new-server.json site check` is Ready
8. Commit the move. A PR changes `gq.ops.json` `ploi.serverId` to `125218`
   and `ploi.siteId` to the new site, and `design-nightly.json`'s
   `ploiSiteId`. Merge it, delete `gq.ops.new-server.json`, re-enable the
   nightly. Releases go to the new server from here.
9. Lift the freeze.
10. Backups. In Ploi, add a daily database backup of `nomia_bnq_staging` on
    125218 to R2 with the existing "Cloudflare backup-sites" Custom S3
    provider, keeping 30. Run one backup and check it restores locally.

### Rollback

- **Before cutover step 8:** switch the A record back to `OLD_IP`, delete
  the retry crontab on 125218, run
  `wp maintenance-mode deactivate` on 102329 and re-enable crontab 343982. The
  old database was frozen, so nothing is lost. Discard the new-server config.
- **After editors resume on the new server:** the same, but first dump the
  new database back to 102329 (preparation step 6 in reverse), or content written since
  the cutover is lost. Revert the `gq.ops.json` PR.
- Keep site 419022 and its database on 102329, untouched, for 14 days, then
  delete the site, database and crontab (Ploi, by hand).

Gravity Forms entries posted to the old CMS during the freeze aren't in the
final dump. Compare Forms → Entries on both CMSs after the cutover (the old one through
a hosts entry) and re-enter any by hand. The window is short, and the forms' honeypot keeps the
volume low.

## Open questions

- **Sizing.** Is the VPS sized for the CMS and the proxy together? (No
  Hetzner API token was available to check the server type.)
- **Production restore** (gq-site #31): may an operator import the
  production database into a new Ploi server by hand, as above, until the
  blueprint has a restore path?
- **Client IP for rate limits** (gq-content) and **`siteOrigins`** in the
  forms and consent routes (gq-site): fix before go-live, or rely on the nginx
  workarounds first?
- **Cloudflare rulesets** on `bnq.pt` were not readable with the Sigillo token.
  Which custom, rate-limit and bot rules exist?

## Appendix: if APA later provides HARICA ACME

Not the plan (APA declined on 2026-10-28). If that changes, ACME would make
renewals automatic. certbot with External Account Binding, using separate
directories so it never touches Ploi's Let's Encrypt certificates:

```sh
# EAB values in a root-only file, never in argv: server, eab-kid, eab-hmac-key, email
certbot --config-dir /etc/harica --work-dir /var/lib/harica --logs-dir /var/log/harica \
  register --config /root/harica-eab.ini --agree-tos --no-eff-email --non-interactive
certbot --config-dir /etc/harica --work-dir /var/lib/harica --logs-dir /var/log/harica \
  certonly --server "https://acme-v02.harica.gr/acme/<account id>/directory" \
  --webroot -w /var/www/harica-acme -d bioeconomia.apambiente.pt \
  --deploy-hook /usr/local/sbin/harica-reload-nginx
```

This also needs:

- the port-80 server to serve `/.well-known/acme-challenge/` from
  `/var/www/harica-acme` again;
- a daily `certbot renew` with the same directories;
- `check-expiry.sh` kept as a safety net.

The certbot script that was drafted for this is in commit ca03684
(`deploy/apa-proxy/harica/issue-certbot.sh`).
