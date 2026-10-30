# Nomia WordPress and Nginx security quick wins

**Target correction:** A later check of freshly fetched `origin/main`
confirmed that production moved to Ploi server `125218`, site `426661`,
user `nomiacms` (Sigillo `prod`). This investigation and its subsequent
operations used this older checkout's server `102329`, site `419022`.
All server observations and applied changes below concern the former
server, not current production. The old-plugin deletion also occurred
only on that former server. Inspect the actual production target before
claiming these recommendations are still missing or already deployed.

Investigated 2026-10-30. Read-only inspection of the live CMS through SSH and WP-CLI, its Nginx virtual host and includes, repository configuration, and bounded HTTP GET/HEAD requests. No production configuration, accounts or files changed. This is a hardening review, not a vulnerability scan or compromise assessment.

## Verified baseline

The live CMS runs WordPress 7.1.3 under Bedrock, with document root `apps/cms/web`, PHP-FPM running as the site user, and media offloading through S3 Uploads. Live constants confirm production mode, disabled WordPress/GraphQL debug, disabled debug display, enforced HTTPS admin, and disabled dashboard code editing and file modifications. Automatic updates are disabled, so patch delivery depends on releases.

Origin checks returned 403 for XML-RPC, `.env` and `.git/config`, 200 for login and WordPress readme, and 404 for a nonexistent uploads PHP path. XML-RPC methods are empty, `xmlrpc_enabled` is false, and application passwords report unavailable in the CLI context. That last result does not establish availability for every interactive user.

The origin login response includes SAMEORIGIN framing, CSP `frame-ancestors 'self'`, a referrer policy and nosniff. Nginx hides its version and configures TLS 1.2/1.3. Do not spend the first hardening pass reimplementing these existing controls. Public requests from this execution environment all returned Cloudflare 403, including login and harmless paths; this does not establish the edge rules, MFA requirements or reachability for other clients.

## Recommended order

### 1. Block PHP execution in uploads and reject nonexistent PHP directly

The live generic `location ~ \.php$` passes existing PHP files anywhere beneath the web root to FPM. No uploads-specific denial exists in the inspected site includes. `try_files $uri /index.php =404` falls back to WordPress for nonexistent PHP. R2 offloading does not make local writable paths safe.

Add an uploads PHP denial before the generic PHP regex, covering `/app/uploads/` and any actual writable media paths, including PHP PATH_INFO variants. Keep normal media serving. Change the generic handler to `try_files $uri =404` after confirming supported routes. Existing uploaded PHP must be denied independently of existence checks. Do not test this by uploading executable code to production. [Nginx location and try_files semantics](https://nginx.org/en/docs/http/ngx_http_core_module.html#location)

This is a small configuration change with a valuable containment benefit; it does not establish that malicious files or an upload vulnerability exist.

### 2. Add authentication visibility, then targeted throttling

The virtual host has `access_log off`; no `limit_req` appeared in the inspected global/site configuration. Simple History is active, but it does not replace HTTP-level request visibility.

Enable a bounded, rotated authentication/security access log, omitting query strings, cookies and authorization headers. Observe ordinary traffic and then throttle the actual `/wp/wp-login.php` handler, preferably authentication POSTs, with a burst allowance and 429 responses. Keep editor REST, AJAX, GraphQL and publication delivery outside a blanket throttle. Start with dry-run observation rather than choosing an arbitrary production threshold. [Nginx rate limiting](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html)

Cloudflare trusted address ranges are configured globally, but `real_ip_header` is `X-Forwarded-For`. Verify the deployed proxy topology, trusted ranges and forwarded chain before using client IP as a limiter key. Do not assume forwarding headers from a direct origin request are authentic. [Nginx real IP](https://nginx.org/en/docs/http/ngx_http_realip_module.html)

### 3. Verify MFA and reduce privileged accounts

WP-CLI lists five administrators. The active plugin inventory contains no standalone MFA plugin, and the inspected Two-Factor provider hook was absent. This is not proof that MFA is absent at an external identity layer.

Establish who still needs administrator privileges, downgrade routine editorial users where appropriate, and verify enforced MFA for every privileged interactive account, including recovery and emergency access. If identity-layer protection exists, verify that direct origin login cannot bypass it. Never disable an account before checking ownership and integrations. [WordPress hardening guidance](https://developer.wordpress.org/advanced-administration/security/hardening/)

### 4. Remove obsolete deployed plugins and maintain patch delivery

`nomia-blocks` 0.64.0 and `nomia-cpt` 0.3.7 are present but inactive. Confirm they are not rollback requirements, then retire them through the release process. Inactive code still enlarges the files exposed to the generic PHP handler. Inventory installed themes too before deleting unused ones.

Audit the production lock file and installed versions against current advisories through the existing dependency process, and establish a regular security patch/redeploy cadence. This investigation did not query a complete vulnerability database and makes no claim that the listed versions are vulnerable or current. Keep dashboard modifications disabled. [WordPress security guidance](https://developer.wordpress.org/advanced-administration/security/)

### 5. Tighten permissions; separate runtime writes from release ownership

The deployed environment file is mode 0664, owned by the site user/group; PHP-FPM runs as that same user. Reduce its permissions to the minimum needed by the application and deployment process (typically 0600 when only that user needs it), after checking backup/deployment access. Do not print or copy its contents.

Code directories are also owned by the FPM user. Changing a directory from 0775 to 0755 does not stop its owner writing code. Separating deployment ownership from runtime ownership would provide stronger containment but requires a tested deployment design, so it is a follow-up rather than a blind chmod quick fix. [WordPress file permissions](https://developer.wordpress.org/advanced-administration/server/file-permissions/)

## Lower-priority refinements and compatibility constraints

- XML-RPC already returns 403 in WordPress. A matching Nginx denial for `/wp/xmlrpc.php` can avoid PHP work; it is an optimization/defense layer, not a missing application block.
- `/wp/readme.html` is public at origin. Denying readmes and backup/config artifacts reduces incidental disclosure, but hiding a version is much less valuable than patching and containing execution.
- The CMS currently allows a 544 MiB request body to support documented 512 MiB uploads. Do not globally lower it and break uploads. Investigate smaller limits for non-upload routes after mapping actual editor, forms and GraphQL needs.
- Login headers contain duplicate SAMEORIGIN and legacy `X-XSS-Protection`. Consolidate ownership, verify headers on denial responses, and consider short initial HSTS for this hostname only after checking TLS/redirect behavior. Do not add broad CSP, HSTS subdomain coverage or preload without compatibility review. [Nginx header behavior](https://nginx.org/en/docs/http/ngx_http_headers_module.html)
- Do not block the whole CMS, REST API or GraphQL to protect login: the frontend, editor, previews, forms and publication flow depend on supported access paths. Direct-origin firewall restrictions need a complete caller inventory first.

## Implementation ownership and validation

Site enablement, account review, supported configuration and obsolete site-plugin retirement belong in `Quick-Release/nomia-bnq`. Shared Nginx provisioning and managed Bedrock configuration belong in `Quick-Release/gq-site` (`/data/code/getquick/gq-site`); root `application.php` is blueprint-managed. Changes to shared authentication behavior need the providing runtime owner, or `Quick-Release/gq-platform` (`/data/code/getquick/gq-platform`) if ownership is unclear. Begin a separate session in a dedicated worktree of the owning repository for shared implementation. This report proposes site adoption, not a new shared policy.

Before rollout, capture the current effective site config, validate the candidate with `nginx -t`, and establish a rollback. After a reload, verify actual denials, login/MFA/reset, editor save, media upload, preview, forms, REST, GraphQL and publication refresh. Confirm logs omit secrets and rate limits distinguish clients. Do not apply these changes by editing managed output or bypassing the release process.

Additional primary-source implementation notes: [WordPress/Nginx references](wordpress-nginx-security-sources.md).

## Topic 1 applied to the live site — 2026-10-30

At the user's request, a site-specific change was applied through Ploi's root script API to the live Nginx virtual host. An uploads denial precedes the generic PHP handler and returns 403 for PHP (including numbered variants), PHTML and PHAR paths, case-insensitively and with PATH_INFO suffixes. The general PHP handler now uses `try_files $uri =404` and a named 404 handler to avoid the existing server-level WordPress error-page fallback.

The original configuration is retained on the server at `/root/nomia-nginx-before-uploads-hardening-20261030.conf` with mode 0600. The operation included automatic restoration on validation/reload failure. `nginx -t` passed and Nginx reloaded successfully. Origin checks confirmed 403 for uploads PHP, uppercase PHP, PHP PATH_INFO and PHTML requests; 404 for a nonexistent PHP path outside uploads; 200 for login, GraphQL and a core CSS asset; and an admin redirect. No executable test files were uploaded. These checks do not constitute a full authenticated editor or upload workflow test.

This is live site configuration, not a change to the shared provisioning template. Preserve the site-specific rules when regenerating or replacing this Ploi virtual host.

## Topic 2 applied to the configured Ploi site — 2026-10-30

Authentication access logging, dedicated rotation, site-scoped Cloudflare client-IP restoration and a login-POST limiter were installed through Ploi. The limiter remains dry-run only pending normal-traffic review. Burst accounting, independent source-IP buckets, spoofed-header rejection, query omission, rotation/reopen and unaffected origin endpoints were verified. See the [configuration and operating notes](../../deploy/ploi/security/README.md).

The same investigation found that Cloudflare's proxied DNS record names a different address from this repository's configured Ploi server. Public probes were not observed in this server's authentication log. This limits the public-route claims for both applied topics: origin behavior on Ploi is verified, but coverage of the public hostname requires resolving the routing discrepancy. DNS and Cloudflare policy were not changed.
