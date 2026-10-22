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

| Before                                                                  | After                                                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `nomia-cpt/nomia-cpt.php`, `nomia-blocks/getquick-nomia-blocks.php`     | `gq-bioeconomia/gq-bioeconomia.php` ("GETQUICK Bio.Eco.Nomia")                   |
| text domains `nomia-cpt`, `getquick-nomia-blocks`                       | `gq-bioeconomia`                                                                 |
| `GetQuick\NomiaBlocks\`, `nomia_cpt_*()` functions                      | `GetQuick\Bioeconomia\`                                                          |
| options `nomia_cpt_*`                                                   | `gq_bioeconomia_*` (`nomia_cpt_plugin_version` → `gq_bioeconomia_version`)       |
| post meta `nomia_cpt_*`, `_nomia_cpt_*`, `_nomia_page_background_color` | `gq_bioeconomia_*`, `_gq_bioeconomia_*`, `_gq_bioeconomia_page_background_color` |
| term meta `_nomia_tematica_color`                                       | `_gq_bioeconomia_tematica_color`                                                 |
| capabilities `*_nomia_cpt_*`                                            | `*_gq_bioeconomia_*`                                                             |
| post type `nomia_gallery`                                               | `gq_bio_gallery`                                                                 |
| GraphQL `nomia*` fields                                                 | `gqBioeconomia*`                                                                 |
| REST `nomia-cpt/v1`                                                     | `gq-bioeconomia/v1`                                                              |
| editor globals `getquickNomia*`                                         | `gqBioeconomia*`                                                                 |

## Data migration

`Lifecycle\LegacyRename` runs inside the plugin's first upgrade (on
activation, and on `init` while `gq_bioeconomia_version` is behind), and only
while nomia-cpt's `nomia_cpt_plugin_version` exists. It:

- renames every `nomia_cpt_*` option to `gq_bioeconomia_*`, keeping a value
  already stored under the new name;
- renames the post meta keys `nomia_cpt_*`, `_nomia_cpt_*` and
  `_nomia_page_background_color`, and the term meta `_nomia_tematica_color`;
- moves `nomia_gallery` posts, and menu items pointing at them, to
  `gq_bio_gallery`;
- removes the old capabilities from administrators and editors (the upgrade
  then grants the new ones);
- drops `nomia-cpt` and `nomia-blocks` from `active_plugins`: the deploy only
  activates what `gq.ops.json` lists, and WordPress would otherwise keep the
  missing plugins listed until someone opened the Plugins screen;
- deletes `nomia_cpt_plugin_version` last, so an interrupted run repeats.

It leaves alone what neither plugin reads: the empty `nomia_blocks_*_items`
post meta the content import brought from the legacy admin.

## Release

1. `pnpm db:backup` before the release.
2. `pnpm push minor`. CI deploys the CMS, whose deploy activates
   `gq-bioeconomia` and so runs the rename, and then the Frontend.
3. `pnpm frontend:refresh`: published pages were stored with the old GraphQL
   fields (`nomiaPageBackgroundColor`, `nomiaThematicColors`), so until they
   are refreshed they render without their background and thematic colors.
4. Check the CMS: Posts, Galerias, Aparência → Footer and Contacto, and a
   document's details panel.

Rehearsed on 2026-10-22 against a copy of the local database (synced from
production): the rename, `tests/integration/gq-bioeconomia.php` and the admin
screens all passed.
