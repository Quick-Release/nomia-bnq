# Hotfix: production 502s on block-heavy /wp/graphql queries

## Root cause (2026-10-19)

`wpgraphql-blocks` 2.2.0 does unchecked array/property access in
`plugin.php` (lines 52, 56, 60, 372, 387) and `includes/utils.php`
(286, 289, 297), emitting a PHP warning for every block on every request.
Production PHP-FPM runs `display_errors=Off, log_errors=On`, so each warning
travels the FastCGI **stderr** channel (`PHP message: PHP Warning ...` in the
nginx site error log). On block-heavy entries that wave overflows nginx's
FastCGI header buffer:

    upstream sent too big header while reading response header from upstream

→ instant (~50 ms) HTTP 502, random per entry, worse under concurrency. The
frontend then retries the query without blocks, so reconciliation stores
entries "without their blocks".

Local DDEV never reproduces it because DDEV's PHP has `display_errors=On`
(warnings go to stdout, not stderr).

## Hotfix

`gq-silence-low-severity.php` — a mu-plugin that drops
`E_WARNING/E_NOTICE/E_DEPRECATED` (and friends) from the request's
`error_reporting`, so they never reach stderr. Errors and fatals are
unaffected.

- Apply: `pnpm exec gq sigillo run staging -- node scripts/ops/nomia-502-hotfix/apply.mjs`
- (installs it, smoke-tests 4 sequential + 4 concurrent full EntryByUri
  queries, then counts nginx error-log deltas as root)
- Remove diagnostics afterwards:
  `pnpm exec gq sigillo run staging -- node scripts/ops/nomia-502-hotfix/cleanup.mjs`
  (removes the temporary `nomia-debug-peak.php` mu-plugin; keeps this hotfix)

## Rollback

Delete `web/app/mu-plugins/gq-silence-low-severity.php` on the server.

## Durable fix (follow-up)

Patch the plugin's unchecked access (guard with `??`/`isset`) — 2.2.0 is the
latest upstream release, so a fix requires a composer patch. Because plugin
pins come from the `@getquick/site` blueprint, decide whether the patch
mechanism belongs in `@getquick/site` (Quick-Release/gq-site) or as a
site-local `composer.json` patches entry. The stderr pressure could also be
softened with a larger nginx `fastcgi_buffer_size`, but that only delays the
overflow; it is not a fix on its own.
