# Migration: nomia-admin content → nomia-bnq CMS

Plan for moving the old Nomia site's WordPress content
(`https://nomia-admin.getquick.io`, media host
`https://nomia-media.getquick.io`) into this site's CMS
(`https://nomia-cms.bnq.pt`, media on R2 `nomia-bnq-media`.

## Inventory (source, via public REST at migration time)

Post types: post 188, page 40, media 413 (~500–700 MB), eventos 5,
oportunidades 10, indicadores 7, infografias 6, biblioteca 4,
plataformas 3, recursos_educativos 3, glossario 2, nomia_gallery 1,
podcasts 1, videos 1, ferramentas 0, bases_de_dados 0.

Taxonomies: category 3, post_tag 3, categoria_biblioteca 4,
tematicas 2, setor_atividade 7, categoria_oportunidade 6,
tipo_evento 0.

The target registers the same post types and taxonomies through the
`nomia-cpt` plugin, so the data model matches; the target DB was empty
(two sample pages) when the migration started.

## Method

WordPress-native content migration, not SQL:

1. **Export.** The source's REST API does not expose the CPT plugin's
   registered meta, so the export is a WP-native **WXR file** generated
   by Tools → Export ("All content") in the old admin (runs on the
   source by a person; the file is dropped into this checkout).
   Menus are not in WXR exports; they are rebuilt manually.
   Post authors are mapped onto the CMS admin (`--authors=create`).

2. **Rehearse locally.** `pnpm db:sync` mirrors production into DDEV
   (one-way, production-DB stays authoritative). Import the WXR there
   with `wp import`, exercise the GraphQL schema and media handling,
   and correct tooling before anything touches production.

3. **Import into production** via a one-off Ploi script (`POST
/scripts/run` on the server — the same transport `gq db sync` uses
   for its export-only script; this is a deliberate, reviewed write).
   The WXR is uploaded to the R2 releases bucket and fetched by the
   server through a short-lived presigned URL. Media side-loads from
   `nomia-media.getquick.io` through s3-uploads into `nomia-media.bnq.pt`
   (R2). Afterwards `pnpm db:sync` mirrors production locally again.

`wp import` needs the WordPress importer plugin (`wordpress-importer`):
installed ad hoc for the migration, deactivated afterwards, so no
composer.json entry.

Before import, a WXR needs prep (`filter-wxr.py`, runs in the staging
step of the import scripts): items outside the run's post types are
stripped (the wp-cli importer has no type filter), and raw C0 control
characters are scrubbed — the source export ships a few (`\x07` inside
post content), which make both the XML parse and `wp import` fail with
"not well-formed (invalid token)".

### Rehearsal findings (2026-10-17, posts export)

Verified on the posts WXR (`nomia.WordPress.2026-10-17.xml`, posts only:
188 posts + 187 attachments) against a `pnpm db:sync` DDEV copy:

- Import 375/375 items; 188 published posts + 187 image attachments;
  the one source post without a featured image maps to 187/188 with
  thumbnails, 0 broken `_thumbnail_id` references.
- The importer itself rewrites content and GUID URLs for side-loaded
  attachments (the media-host search-replace then finds nothing in
  posts-only content — posts carry no media URLs of their own).
  Source GUIDs (187 × `nomia.getquick.io`, 1 × `nomia-admin`) still need
  the frontend/admin-host rewrites below.
- Terms: source had 1 category (`geral`, 188 references) and 889 tag
  references over 442 distinct tags — imported exactly (Geral count 188,
  442 tags, 889 tag links). The earlier "188 category terms" note was
  per-post references, not distinct terms.
- Attachment files land under the source's own uploads subpaths
  (`2026/05/…`, `2026/10/…`); 38 MB total on disk locally; subsizes
  generated. In production the same side-load goes to R2 via s3-uploads.
- Authors: the WXR author matched the existing CMS admin by email, so
  the import created no users and attributed all 188 posts to user 3.
- Prep quirks recorded: `wp eval-file` takes no custom flags (pass
  `wxr=<path>` positionally, as remap.php reads it), and snapshots must
  be named per-run (`pre-import-<timestamp>`).

### Post types beyond posts

The custom post types (biblioteca, eventos, oportunidades, …), their
terms, the media posts and pages didn't carry, and the menus come from a
full export (`nomia.WordPress.2026-10-18.xml`, Tools → Export → All
content). Nomia's blocks (events, library, opportunities grids) show
this content. The prepared WXR keeps every type except the old theme's
`wp_global_styles` (2) and `wp_navigation` (1), which would compete with
GQ Design; posts and pages stay in so menu items resolve to them (the
importer skips those that exist).

### Rehearsal findings (2026-10-18, full export)

Against a `pnpm db:sync` copy of production (188 posts, 42 pages, 248
attachments already imported):

- Result: 44 custom-type entries (43 published + 1 draft), every term
  (tematicas 2, setor_atividade 7, categoria_oportunidade 6), 5 menus with
  45 items, 412 attachments, 0 broken thumbnails, 0 old-domain strings.
- The importer keeps a source post's ID when it's free, so most IDs
  (the gallery's 87 images, the "Fake Content" reusable block 15) need no
  remap; `remap.php` and `block-refs.php` still run for the ones that moved.
- Attachment 844 (`CESAM_Calcado_21.01.2026-4.pdf`) is skipped: the source
  uploaded that PDF six times, with the same title and date, and nothing
  references this copy.
- **Run it once.** The importer skips posts and attachments that already
  exist, but adds every menu item again; three passes tripled the menus.
- **As an administrator.** Without a user, safe-svg refuses SVG (4 icons);
  it only allows SVG through the admin's upload screens even for admins, so
  the import allows SVG for its own run and `sanitize-svgs.php` cleans the
  files with safe-svg's sanitizer afterwards.
- The remap marker from the posts import has to be cleared: each import is
  another WXR.

## URL rewrites (after import, `wp search-replace`)

Post content and meta contain source-domain URLs. Attachment files are
re-hosted, so full URLs redirect to the new media host; links to the
old frontend point at the new frontend. Applied in this order:

- `https://nomia-media.getquick.io/uploads/` → `https://nomia-media.bnq.pt/`
  (s3-uploads maps bucket root to the uploads base, subpath preserved)
- `https://nomia-admin.getquick.io` → `https://nomia-cms.bnq.pt`
- `https://nomia.getquick.io` → `https://nomia.bnq.pt`
  (frontend links and imported GUIDs)

Recon of source content found ~80 internal media URLs (pages and CPTs;
posts carry none) and one internal frontend link.

## Attachment-ID remap

`nomia_cpt` stores attachment references by ID in meta
(`nomia_cpt_gallery_image_ids`, `nomia_cpt_footer_logo_ids`). The
import assigns new IDs, so a remap pass runs after import using the
old→new ID map recorded by the importer (option `wordpress_importer`):
see `scripts/migrate-nomia-admin/remap.php` (idempotent).

## Verification checklist

After local rehearsal and after the production import:

- [x] Counts per post type and taxonomy match the inventory above
      _(rehearsal, posts export: 188 publish + 187 attachments, Geral 188,
      442 tags / 889 links — see rehearsal findings above)_
- [x] Featured images resolve (187/188 posts, 0 broken refs; one source
      post has no thumbnail) — re-check in production
- [x] A sample attachment media URL answers on the media host (local:
      200 on the DDEV uploads path; production: R2 via nomia-media.bnq.pt)
- [ ] `gq site check` passes (schema, events, media independence —
      production after import)
- [x] Sample entries render through GraphQL (`wp/graphql`); frontend
      renders against the local DDEV copy by default
      (`nomia-bnq-admin.ddev.site/wp/graphql`)

## Decisions recorded

- Published and unpublished content both migrate (WXR from admin
  "All content"); if the target must start publish-only, import and
  then set statuses explicitly — not chosen.
- Menus are rebuilt manually, not scripted (WXR does not carry them).
- All migrated posts are attributed to the CMS administrator; source
  users are not recreated.
- Dev-tooling majors and DDEV build-state `.gitignore` follow-ups are
  out of scope here.
