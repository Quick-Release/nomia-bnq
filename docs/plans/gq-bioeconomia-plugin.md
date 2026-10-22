# One gq-bioeconomia plugin

The Site's two CMS plugins become one: `nomia-cpt` (content types, taxonomies,
details, admin pages) and `nomia-blocks` (GETQUICK Nomia Blocks) merge into
`gq-bioeconomia`, at `apps/cms/web/app/plugins/gq-bioeconomia`. It is still a
Site-owned plugin: the `gq-` prefix is its name, not a move into a shared
GETQUICK repository.

## Decisions

- **Structure follows GQ Design.** The merged plugin is built the way
  `nomia-blocks` already is: PSR-4 `final` classes under `src/`
  (`GetQuick\Bioeconomia\`), short arrays, plain `window.wp` editor scripts
  with no build step, `Requires Plugins: gq-design`. `nomia-cpt`'s
  procedural `includes/` are rewritten as classes.
- **Every stored name is renamed**, not only the code. One prefix, matching the
  slug: `gq_bioeconomia_` for options, post meta and capabilities,
  `gq-bioeconomia` for the text domain, handles and REST namespace, and
  `gqBioeconomia` for GraphQL fields and editor globals.
- **The gallery post type becomes `gq_bio_gallery`.** WordPress caps post type
  keys at 20 characters, so `gq_bioeconomia_gallery` doesn't fit. Its GraphQL
  names (`Galeria`, `Galerias`) don't change.
- **What keeps its name:** block names (already `getquick/*`), the other post
  types and taxonomies (`biblioteca`, `eventos`, `tematicas`, …), their
  GraphQL types, and the Frontend's own Nomia renderer (`NomiaBlocks.astro`,
  `nomia-content.ts`, `nomia-*.css`), which belongs to the Site, not the plugin.
- **Finished upgrade routines are dropped.** On production (checked
  2026-10-22) the legacy details and library-details block migrations have
  completed (no `_nomia_cpt_details_pending` meta), so their code doesn't move
  over. Seeding default terms and syncing capabilities stay.

## Renames

| Before                                                        | After                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `nomia-cpt/nomia-cpt.php`, `nomia-blocks/getquick-nomia-blocks.php` | `gq-bioeconomia/gq-bioeconomia.php` ("GETQUICK Bioeconomia")        |
| text domains `nomia-cpt`, `getquick-nomia-blocks`             | `gq-bioeconomia`                                                          |
| `GetQuick\NomiaBlocks\`, `nomia_cpt_*()` functions            | `GetQuick\Bioeconomia\`                                                   |
| options `nomia_cpt_*`                                         | `gq_bioeconomia_*` (`nomia_cpt_plugin_version` → `gq_bioeconomia_version`) |
| post meta `nomia_cpt_*`, `_nomia_cpt_*`, `_nomia_page_background_color` | `gq_bioeconomia_*`, `_gq_bioeconomia_*`, `_gq_bioeconomia_page_background_color` |
| term meta `_nomia_tematica_color`                             | `_gq_bioeconomia_tematica_color`                                          |
| capabilities `*_nomia_cpt_*`                                  | `*_gq_bioeconomia_*`                                                      |
| post type `nomia_gallery`                                     | `gq_bio_gallery`                                                          |
| GraphQL `nomia*` fields                                       | `gqBioeconomia*`                                                          |
| REST `nomia-cpt/v1`                                           | `gq-bioeconomia/v1`                                                       |
| editor globals `getquickNomia*`                               | `gqBioeconomia*`                                                          |

## Data migration

An idempotent upgrade routine runs once when the stored
`gq_bioeconomia_version` is missing and the legacy `nomia_cpt_plugin_version`
exists. It renames option keys, post and term meta keys, and
`nomia_gallery` posts to `gq_bio_gallery`. It removes the old capabilities
from administrator and editor and adds the new ones. Only then does it store
`gq_bioeconomia_version` and delete `nomia_cpt_plugin_version`.

The deploy activates `gq-bioeconomia` (from `gq.ops.json`); WordPress drops
the missing `nomia-cpt` and `nomia-blocks` from `active_plugins` on its own.
Back up the database before the release. After it, refresh the published
content so the publication store reads the renamed GraphQL fields.
