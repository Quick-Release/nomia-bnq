# Deprecated Circular Economy Overview Alias

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `circular-economy-overview`
- WordPress block name: `getquick/circular-economy-overview`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/HorizontalScrollWithContentBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/nomia-blocks/assets/editor.js`
- Lifecycle: `legacy`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Legacy alias for `horizontal-scroll-with-content`, kept so existing saved WordPress content continues to render while new content uses the content-independent block name.

## Editor experience

- Prefer the `horizontal-scroll-with-content` block for new content.
- Render existing saved content through the same Astro component as the new block.
- Keep visual controls locked to the Astro reference.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `eyebrow`
- `headingLine1`
- `headingLine2`
- `pills`
- `verTodosHref`
- `verTodosLabel`
- `slides`

### Legacy compatibility reads

- `verTodosUrl`
- `items`
<!-- END GENERATED: structured-block-contract -->

## Customizable fields

Only expose content fields:

eyebrow, heading line 1, heading line 2, pills repeater label/URL, view-all label/URL, slides repeater title/body/image/alt/URL. No visual controls.

## Locked controls

Do not expose controls for:

- colors
- typography
- spacing
- alignment
- borders/radius/shadows
- layout variants unless explicitly listed as content above
- animation settings
- arbitrary CSS classes
- custom HTML

## Implementation notes for the coding agent

- Do not use this block ID for new content; use `horizontal-scroll-with-content`.
- Keep this alias registered until saved WordPress content has been migrated.
- Use the same renderer, attributes, and normalization as `horizontal-scroll-with-content`.
