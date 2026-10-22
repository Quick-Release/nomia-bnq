# NomiaMapListExplorerSection

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `map-list`
- WordPress block name: `getquick/map-list`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/MapListExplorerBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/map-list/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Create a native WordPress Gutenberg custom block that matches the Astro component visually as closely as possible in both the editor canvas and the frontend.

Map with region filters and a related content list.

## Editor experience

- Render a native editor preview in Gutenberg, not a placeholder-only form.
- Keep visual styling, spacing, layout, and map behavior locked to the Astro component.
- Put content fields in inline text, media controls, and sidebar controls where appropriate.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `regions`
- `audiences`
- `items`
<!-- END GENERATED: structured-block-contract -->

## Customizable fields

Only expose content fields:

regions labels, audience labels, item title, excerpt, date label, image, image alt, URL, region, and audience assignments.

## Locked controls

Do not expose controls for colors, typography, spacing, alignment, borders, map geometry, animation, arbitrary classes, or custom HTML.
