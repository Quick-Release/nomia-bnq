# Nomia contact map

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `nomia-contact-map`
- WordPress block name: `getquick/nomia-contact-map`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/NomiaContactMapBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/nomia-contact-map/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Purpose

Contact-page map block. Editors paste a Google Maps link and Astro renders it as an embedded map on the frontend.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `mapUrl`
- `title`
- `align`

### Legacy compatibility reads

- `url`
<!-- END GENERATED: structured-block-contract -->

## Editing behavior

- Editors paste the Google Maps URL in the block fields.
- Title is optional and used as the iframe accessible title.
- The block toolbar's alignment button offers **left**, **right** and **full
  width**; clearing it returns to the default centred map. The choice is stored
  as `align` (`none`, `left`, `right`, `full`), owned by
  `apps/web/src/lib/nomia-contact-map.ts`.
- The canvas previews the embedded map at the chosen alignment.

## Frontend behavior

- Existing Google Maps embed links are rendered directly.
- Common Google Maps search, place, and coordinate URLs are converted to an embed URL.
- Empty or non-Google URLs render no frontend output.
- `none` keeps the map centred at up to 1180px; `left` / `right` pin it to that
  side at up to 720px without floating, so following bands never slide under
  it; `full` bleeds it to the viewport edges at a height of 420–720px.
