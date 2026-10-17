# wpgraphql-blocks 2.2.0 — quiet unsafe-access patch

`wpgraphql-blocks` 2.2.0 does unchecked array/property access throughout
`plugin.php` and `includes/utils.php`. With `display_errors=Off,
log_errors=On`, every warning travels the FastCGI stderr channel and lands in
`/var/log/nginx/nomia-cms.bnq.pt-error.log`; on block-heavy entries the wave
overflows nginx's FastCGI header buffer → `upstream sent too big header` →
HTTP 502. Full write-up: `scripts/ops/nomia-502-hotfix/README.md`.

## What the patch does

Minimal, behaviour-preserving guards around every site the warning inventory
identified (`??`/`isset`/`property_exists` guards, declared class properties
on `WPGraphQLBlocks\Block` to stop the dynamic-property deprecations, a
libxml scope guard around the two `loadHTML` calls, and a `clean()` pass that
unsets declared-but-null optional fields so the JSON payload stays identical).
No structural or output changes:

- 2.2.0 plugin.php: sha256 `1f3f0190cde9c8b5172239b95411ed15c86b708cac284b89a6c8f1ab4a735e98`
- 2.2.0 includes/utils.php: sha256 `c5a2fda8bce3e540e893428a4df1da94762159dc0d9cf5616b11b73ce1ee68f7`

All edited lines carry a `// gq-patch-2.2.0` marker, which the deploy
extension uses to detect "already applied".

## Verification (local DDEV, 2026-10-17)

`wp eval-file` with an error handler scoped to wpgraphql-blocks on five
queries (post 181 and page 26, each `postTemplate:false|true`, plus a
whitespace-variant of the post-181 query):

- before: **4043 warnings, 62 distinct warning sites** per payload
- after: **0 warnings**
- response payload md5s: byte-identical across all five queries
  (verified both by md5 comparison and by deep JSON diff).

Note the local inventory found strictly more warning sites than the
production log audit (the log only shows sites for the queries production
actually served), and the patch covers all of them.

## Apply

Local: `patch -p1 < patches/wpgraphql-blocks/2.2.0-quiet-unsafe-access.patch`
from `apps/cms` (applies as `web/app/plugins/wpgraphql-blocks/...`).

Production: `deploy/ploi/admin.d/20-wpgraphql-blocks-quiet.sh` applies the
patch idempotently during each full release (skip on Composer-only deploys;
safe to re-run; fails the deploy when the patch no longer matches — e.g. the
plugin was updated upstream and the patch needs a rebase).

## Upgrading the plugin later

When `@getquick/site` or composer moves beyond 2.2.0, drop this patch: either
the checks were fixed upstream, or read the new sources, regenerate a patch
for the new version, and adjust the marker/paths in the deploy extension.
