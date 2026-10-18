# nomia-admin content migration — helpers

Scripts for migrating the old Nomia site's WordPress content into this
site's CMS. The plan and its context live in
[`docs/plans/migrate-nomia-admin-content.md`](../../docs/plans/migrate-nomia-admin-content.md).

## Files

- `filter-wxr.py` — preps a WXR for `wp import`: strips `<item>` blocks
  whose `wp:post_type` is outside the allowed list (the importer has no
  type filter) and scrubs raw C0 control characters the source export
  ships, which break the XML parse. Always writes a clean working copy.
- `remap.php` — WP-CLI script (`wp eval-file remap.php wxr=export.wxr`;
  the flag is positional because `wp eval-file` takes no custom options)
  that rewrites source attachment IDs in `nomia-cpt` stores
  (`nomia_cpt_gallery_image_ids` post meta and the
  `nomia_cpt_footer_logo_ids` option) to the IDs assigned by `wp import`.
  Idempotent via a marker option; run once per import.
- `block-refs.php` — WP-CLI script (`wp eval-file block-refs.php wxr=…`)
  that points `<!-- wp:block {"ref":N} -->` refs at the reusable blocks the
  import created, matched by title; `wp import` keeps the source's IDs.
- `sanitize-svgs.php` — runs every SVG attachment through safe-svg's
  sanitizer (`wp eval-file sanitize-svgs.php`). The import allows SVG for
  its own run, since safe-svg only allows it on the admin's upload screens.
- `production-import.mjs` — the same steps on the production CMS over a
  one-off Ploi script, as `--wp-user=<admin>`, with the WXR and helpers
  passed through R2. Plan first without `--yes`; run it once per WXR.
- `local-import.sh` — rehearses the migration in DDEV against a
  `pnpm db:sync` copy: prepare the WXR, snapshot, import, remap, URL
  rewrites. Everything runs locally; production is a separate reviewed
  step. Scope the run with `POST_TYPES` (`post,attachment` default; a
  pages export uses `POST_TYPES=page,attachment`).

## Quick start (local rehearsal)

```sh
pnpm db:sync                                          # production DB → local DDEV copy
POST_TYPES=post,attachment scripts/migrate-nomia-admin/local-import.sh \
  /path/to/nomia-admin-export.xml
```

The import snapshot is named `pre-import-<timestamp>`; roll back with
`cd apps/cms && ddev snapshot restore <name>`.

`ddev wp` shorthand for anything manual (run it from `apps/cms`, DDEV
resolves the project from the working directory):

```sh
cd apps/cms && ddev wp <command…>
```
