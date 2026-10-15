# Section

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `section`
- WordPress block name: `getquick/section`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/SectionBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/nomia-blocks/src/editors/Section.jsx`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Purpose

Generic full-width band that groups other Gutenberg blocks. It is the editorial
escape hatch for pages that need a coloured or differently spaced stripe without
a bespoke block: editors insert a section, drop any allowed block inside it, and
choose the surface colour and vertical rhythm.

It is the only Nomia block that stores a raw colour. A section exists to define
the surface its children sit on, so the colour is its content; everything else it
stores is a named step that `apps/web/src/lib/section-block.ts` resolves into the
site's responsive spacing scale.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `backgroundColor`
- `backgroundImageId`
- `backgroundImageSrc`
- `backgroundImagePosition`
- `backgroundImageSize`
- `paddingTop`
- `paddingBottom`
- `paddingX`
<!-- END GENERATED: structured-block-contract -->

## Editing behavior

- Nested blocks are edited in place through `InnerBlocks`, limited to the same
  allow list as the rest of the editor (`allowed_block_types_all`).
- The inspector offers the Nomia swatches plus a free colour picker and a reset
  button, matching the existing **Fundo da página** document panel.
- Padding top and bottom accept `none`, `small`, `medium` or `large`; horizontal
  padding accepts `none` (full bleed), `small` or `default`.
- The editor canvas previews the chosen background and contrast so the colour is
  judged against the real content.

## Frontend behavior

- Renders a `<section>` whose background is the stored colour; unset means the
  section stays transparent and inherits the page surface.
- Body copy, links and `<strong>` flip between black and white from the
  background's WCAG relative luminance, so a section is never white-on-white.
- A light background also marks the band `data-nomia-header-surface="light"`, so
  the fixed header darkens its links while the section scrolls underneath it.
- Padding steps resolve to the site's responsive rhythm, e.g. `medium` is
  `pt-16 md:pt-24`; inner content is centred at `max-w-[1792px]`.
