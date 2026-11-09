# WordPress and Nginx security reference notes

Researched 2026-10-30. These are primary-source implementation notes, not a claim that a control is missing from production. The site-specific investigation should establish deployment state before acting.

## Practical priorities

- Keep core, plugins and themes patched; remove unused components. WordPress identifies updates as its primary security recommendation. With Composer releases, make this a maintained release process rather than enabling conflicting dashboard updates. [WordPress security](https://developer.wordpress.org/advanced-administration/security/)
- Require a second factor for privileged interactive accounts. The WordPress Two-Factor plugin supports individual enrollment; installing it alone does not enroll every user. Verify enrollment, recovery and enforcement separately. [Plugin's setup instructions](https://wordpress.org/plugins/two-factor/)
- Prevent browser-based code changes with `DISALLOW_FILE_EDIT`; consider `DISALLOW_FILE_MODS` for an immutable release workflow. The latter also blocks plugin/theme installation and updates, so confirm deployment remains the supported patch route. [WordPress configuration](https://developer.wordpress.org/advanced-administration/wordpress/wp-config/)
- Minimize filesystem write access. Keep application code separate from directories WordPress must write. Confirm PHP-FPM ownership first: numeric permissions alone cannot prevent writes when PHP runs as the owning user. [WordPress permissions](https://developer.wordpress.org/advanced-administration/server/file-permissions/)

## Nginx controls to verify first

1. Deny PHP handling in writable media directories, adapting the URI to Bedrock's `/app/uploads/` or the actual storage path. Ensure the deny rule wins over the generic PHP regex. Exact matches terminate location selection; otherwise the longest prefix is retained and regex locations are evaluated in order unless `^~` suppresses that search. A later regex denial can therefore lose to an earlier PHP handler. [Location selection](https://nginx.org/en/docs/http/ngx_http_core_module.html#location)
2. Use `try_files $uri =404` in the actual PHP handler, before FastCGI dispatch, so nonexistent scripts are rejected. Inspect `root`, symlinks, `SCRIPT_FILENAME` and PATH_INFO behavior together. This prevents nonexistent-script routing, not execution of existing malicious uploads; it complements the media denial. [Nginx try_files](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)
3. Block direct access to configuration, hidden files and backup artifacts; retain any required ACME challenge exception. Ensure the document root is Bedrock's `web/`, with environment files and Composer metadata outside it. These are configuration recommendations derived from the same location-selection behavior, not proof of present exposure. [Nginx location](https://nginx.org/en/docs/http/ngx_http_core_module.html#location)
4. Rate-limit the real login route, including Bedrock's `/wp/wp-login.php`. Define `limit_req_zone` at `http` scope and attach it to a location that still executes the intended PHP handler. Consider dry-run observations before enforcement and a `429` rejection status. Keep the editor's REST/AJAX requests outside a blanket login throttle. [Rate limiting directives](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html)
5. Resolve client IPs only from trusted proxies before using IP-based limits. Restrict `set_real_ip_from` to the actual proxy addresses and choose its documented forwarded header; trusting arbitrary sources enables spoofing. Otherwise a proxy IP may pool unrelated users into one limit. [Real IP module](https://nginx.org/en/docs/http/ngx_http_realip_module.html)

## XML-RPC and headers

- If no integration needs XML-RPC, deny the actual endpoint at Nginx, including `/wp/xmlrpc.php` on Bedrock. Confirm mobile clients and external integrations first. The `xmlrpc_enabled` WordPress filter affects authenticated methods only; disabling it does not disable pingbacks or the complete endpoint. [WordPress filter documentation](https://developer.wordpress.org/reference/hooks/xmlrpc_enabled/)
- Audit headers on successful and error responses. Nginx `add_header ... always` covers response codes outside the directive's normal set. A child location defining its own headers may replace inherited headers; inspect the installed Nginx version before relying on the newer `add_header_inherit` directive. Avoid duplicate/conflicting upstream headers. [Nginx headers module](https://nginx.org/en/docs/http/ngx_http_headers_module.html)
- Treat CSP and frame restrictions as compatibility changes for WordPress editing, previews and plugin integrations. Start with measured requirements and report-only policy rather than copying a generic restrictive policy. Stage HSTS carefully; broad subdomain coverage and preload affect domains beyond this CMS. These are rollout recommendations, not verified production gaps.

## Checks after an eventual change

Validate the effective Nginx configuration with `nginx -t`, then verify blocked artifacts and media PHP paths return a deliberate denial without reaching PHP. Confirm login, second-factor recovery, password reset, editor saves, previews, media uploads, forms, REST and GraphQL still work. Confirm ordinary requests from separate clients remain separate in rate-limit logs. Configuration validation alone cannot demonstrate these behaviors.
