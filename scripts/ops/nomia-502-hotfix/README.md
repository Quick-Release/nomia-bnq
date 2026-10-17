# Hotfix: production 502s on block-heavy /wp/graphql queries

## Root cause (2026-10-19)

`wpgraphql-blocks` 2.2.0 does unchecked array/property access in
`plugin.php` and `includes/utils.php` (production log showed
utils.php 286/289/297 among others; the local inventory found a strictly
larger set — see apps/cms/patches/wpgraphql-blocks/README.md),
emitting a PHP warning for every block on every request.
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

## Durable fix (done, 2026-10-17)

`apps/cms/patches/wpgraphql-blocks/2.2.0-quiet-unsafe-access.patch` guards
every unchecked access site the inventory found (see the patch README for the
full list and verification). Verified locally: 4043 warnings → 0 on the same
five-query gate, response payload md5s byte-identical.

On production it arrives via the deploy extension
`deploy/ploi/admin.d/20-wpgraphql-blocks-quiet.sh`, which applies the patch
idempotently from `apps/cms` on every full release and fails the deploy if
the plugin source drifts out of match. Ship it with a `v*` tag; afterwards
remove the `gq-silence-low-severity.php` hotfix mu-plugin (its whole job was
to keep the warnings from reaching stderr) and confirm the error-log delta
drops to zero with
`pnpm exec gq sigillo run staging -- node scripts/ops/nomia-502-hotfix/log-audit-remote.mjs`.
