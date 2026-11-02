# Grelha de destaques

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `selected-content-grid`
- WordPress block name: `getquick/selected-content-grid`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/SelectedContentGridBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/selected-content-grid/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

Select five published items: slot 1 is column A; slots 2–5 form a 2×2 grid in column B. On small screens cards stack in selection order. Each card uses the current published title, featured image and excerpt; a missing excerpt falls back to the first 30 words of content. Missing images retain a neutral image area.

The searchable editor supports posts, videos, podcasts, infographics, galleries, events, opportunities and all tools (including platforms and databases). Selection stores references, never copies of content. The frontend resolves these through the existing publication runtime, so withdrawn items disappear and published edits are reflected without resaving the homepage. Empty or missing slots are omitted; the principal slot remains distinct.

The block is available on any page. Add it to the homepage and choose its five items in the block settings. No automatic latest-post selection is made.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `items`
<!-- END GENERATED: structured-block-contract -->

## Initial homepage setup

The deploy extension `30-home-content-grid.sh` appends this block to the static homepage once. It selects the latest published post from each of the five groups above, with the normal post as the principal card. Later deploys preserve editorial choices and removals. Missing groups leave an empty slot. The editor’s “Preencher com os mais recentes” action replaces all five selections with current latest items; publication alone does not change which items are selected.
