# Legacy Nomia details migration (#48)

The Site-owned `nomia-cpt` 0.3.7 replaces four legacy blocks with post meta,
REST/GraphQL fields and document-settings panels. This extends the biblioteca
migration in [#47](https://github.com/Quick-Release/nomia-bnq/pull/47).
The implementation contract is the [#48 agent brief](https://github.com/Quick-Release/nomia-bnq/issues/48#issuecomment-6349972370).

## Data and interfaces

The authoritative field mapping, legacy defaults, labels and REST schemas are
in [`details.php`](../../apps/cms/web/app/plugins/nomia-cpt/includes/details.php),
via `nomia_cpt_get_details_definitions()`. Each camelCase attribute maps to a
snake_case suffix under the family's `nomia_cpt_event_*`,
`nomia_cpt_platform_*`, `nomia_cpt_graphic_*` or `nomia_cpt_podcast_*` prefix.
GraphQL uses the attribute name after `nomiaEvent`, `nomiaPlatform`,
`nomiaGraphic` or `nomiaPodcast` on `Evento`, `Plataforma`, `Indicador` and
`Podcast`, respectively. For example, `dataPoints` becomes
`nomia_cpt_graphic_data_points` and `nomiaGraphicDataPoints { x y }`.
Empty scalars resolve to null; arrays remain typed lists. Graph point
coordinates remain strings, including blank cells and decimal precision.

Platform sector metadata is separate from taxonomy assignments. Imported IDs
17 and 18 identify post tags in the imported database, not current sectors.
The selector flags unresolved references and updates its ID/label pair only
when an editor deliberately selects a valid `setor_atividade` term. It never
changes the platform's assigned taxonomy terms. The imported label remains
visible and read-only until replaced by a selection.

## Upgrade and recovery

On a version transition, the upgrade migrates each block only on its matching
post type. It handles self-closing and paired blocks, including nested
placement. Paired blocks lose their own obsolete saved HTML; surrounding
content remains byte-for-byte intact. A metadata-only record may become empty.
Public rendering of these details is separate work.

Every destination value already present wins, even when empty or zero.
Before changing content, the migration verifies typed metadata, saves a revision
where supported, and retains an exact private `_nomia_cpt_details_source`
post-meta value. Multiple attempts with corrected source retain distinct
recovery copies. These editorial recovery values survive plugin uninstall.

Malformed, incomplete or conflicting source blocks remain in content and
produce an admin notice identifying the post. Failed writes leave the version
gate open. `_nomia_cpt_details_pending` tracks content writes until verified;
records with this marker remain in the retry queue even if their block has
disappeared. Unexpected save filtering restores raw source content without
repeating the offending filter. After resolving a failure, the next normal
WordPress initialization retries the upgrade.

For manual recovery, first export/snapshot the affected database. Inspect
`wp post meta list <id> --keys=_nomia_cpt_details_source` and the post's revisions;
choose the correct recovery copy before restoring. Restore through the editor's
revision interface, or use a targeted, reviewed WordPress operation. Restoring
a legacy block while the migration is still pending will cause it to be retried;
pause the upgrade code while investigating. Do not automatically roll back
metadata that an editor may already have changed. Never push a local database
to production.

## Local verification — 2026-10-22

DDEV project: `nomia-bnq-admin`, PHP 8.4, local WordPress. Production deployment
and migration were not performed.

Before editing, a database snapshot named `before-issue-48` and an untracked
raw-content baseline were saved. The baseline contained these 15 matching
published records (plus one unrelated record without a target block):

- `eventos`: 18, 100, 103, 106.
- `plataformas`: 43, 47, 51.
- `indicadores`: 23, 702, 704, 706, 708, 711, 717.
- `podcasts`: 27.

After migration, every source attribute/default matched its typed destination
and every record's surrounding content matched the source after removal of
only its metadata block. A second run returned
`{"migrated":0,"errors":[]}`. Indicator 708's incomplete rows survived.
Examples: event 18 retained dates `2026-05-26` / `2026-05-29` and venue
`Universidade de Aveiro`; platform 43 retained `Portugal` and its stale sector
reference; podcast 27 retained episode string `1` and its abstract while its
legacy `<article>` was removed. The `before-issue-48` snapshot was restored after checks. Read-only SQL then
confirmed stored version `0.3.6` and all original block counts (4/3/7/1).
The next normal WordPress request will apply the new upgrade again.

The real WordPress regression suite runs from `apps/cms`:

```sh
ddev snapshot --name before-details-check
ddev wp eval-file tests/integration/details.php
ddev snapshot restore before-details-check
```

Use a local/development database only. The suite creates/removes disposable
fixtures, exercises REST and GraphQL on all four types, checks typed array
schemas and unauthorized REST writes, and simulates metadata/content failures,
corrected-source retries, defaults, falsy destination values, duplicate blocks,
nested and paired blocks, malformed delimiters and the version gate. It can
also migrate existing legacy content, so the snapshot is required. The normal
Composer tests use stubs; this suite deliberately verifies real WordPress
storage, filtering, REST, GraphQL and revisions.

Browser checks passed for imported records 18, 43, 708 and 27, plus a new draft
of each type: open the matching details panel, check imported/default values,
edit a field, save and reload. No unsupported-block warning appeared. Graph
row insertion preserved `001.230` and a blank coordinate after reload. Platform
selection resolved the stale reference without changing assigned taxonomy
terms. Temporary drafts were removed; edits to imported records are discarded
with the snapshot restore. T3 preview snapshots timed out twice, so these
checks used local headless Chromium through Playwright. No browser page errors
occurred. Existing WordPress block-template warnings and WPGraphQL PHP 8.4
deprecations appeared outside the changed code.

Final automated checks: Composer tests passed (25 CMS tests / 178 assertions,
35 block-plugin tests / 3742 assertions); Composer lint and JavaScript syntax /
format checks passed. The real WordPress regression suite passed separately.
