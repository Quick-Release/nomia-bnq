# wpgraphql-blocks warning patch

This patch is now managed by `@getquick/site` 0.18.2 through `gq sync`.
Do not edit it by hand. `apps/cms/scripts/patch-dependencies.php` applies and
verifies it after Composer autoload generation and during both full and
Composer-only deployments. The plugin is pinned to 2.2.0 in composer.json.

The shared runner verifies the same patched hashes as the original Nomia
fix. The old `deploy/ploi/admin.d/20-wpgraphql-blocks-quiet.sh` stays for the
first adoption release as an idempotent fallback; retire it in a follow-up
release after verifying the shared production path.

Local adoption verification: two Composer installs succeeded; the frontend
homepage query and post 181/page 26 with postTemplate false/true retained
identical response hashes, with zero wpgraphql-blocks warnings. All nine
project verification checks passed.

Production log auditing remains in `scripts/ops/nomia-502-hotfix/`.
