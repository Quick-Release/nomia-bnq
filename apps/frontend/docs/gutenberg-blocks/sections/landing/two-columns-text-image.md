# TwoColumnsTextImage

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `two-columns-text-image`
- WordPress block name: `getquick/two-columns-text-image`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/TwoColumnsTextImageBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/nomia-blocks/src/editors/TwoColumnsTextImage.jsx`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Create a native WordPress Gutenberg custom block that matches the Astro component visually as closely as possible in both the editor canvas and the frontend.

Two-column text and image section.

## Editor experience

- Render the real block preview in Gutenberg, not a placeholder-only form.
- The editor preview should use the same locked markup, class names/design tokens, spacing, responsive behavior, and interaction model as the Astro component.
- Put content fields in the block sidebar or inline rich text where appropriate.
- Start from the existing Astro component as the source of truth. Port the structure to the WordPress block implementation rather than redesigning it.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `eyebrowLabel`
- `eyebrow`
- `accent`
- `heading`
- `body`
- `ctaHref`
- `ctaLabel`
- `primaryId`
- `primarySrc`
- `primaryAlt`
- `mediaPosition`
- `hideCta`
- `hideTaxonomy`

### Legacy compatibility reads

- `ctaUrl`
- `primaryUrl`
- `headingId`
<!-- END GENERATED: structured-block-contract -->

## Customizable fields

Only expose content fields:

eyebrow/label if present, heading, body copy, CTA label/URL, image(s), alt text, whether the image stack sits on the left or right, and whether the eyebrow or CTA should be hidden. No grid, spacing, color, or typography controls.

## Locked controls

Do not expose controls for:

- colors
- typography
- spacing
- alignment
- borders/radius/shadows
- layout variants other than the explicitly listed left/right image position
- animation settings
- arbitrary CSS classes
- custom HTML

## Implementation notes for the coding agent

- Register the block with the exact block ID `two-columns-text-image` or the project namespace equivalent, preserving this ID as the stable reference.
- Use custom fields/attributes for the content listed above.
- Save structured content as block attributes, or use ACF/Meta fields only if that is the WordPress project's convention.
- Use server-side rendering if dynamic WordPress data is required; otherwise save static block markup generated from attributes.
- Enqueue editor and frontend CSS so Gutenberg matches Astro at editing time.
- Reuse existing design tokens when available. If the WordPress theme does not have them, define a compatibility layer that maps Nomia tokens to the same values.
- Add sensible empty states in the editor, but do not show empty-state UI on the frontend.
- Validate required content fields and keep fallback copy/images out of production output unless the original Astro component has intentional defaults.
