# NomiaEconomiaCircularMacroMesoMicroSection

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `macro-meso-micro`
- WordPress block name: `getquick/macro-meso-micro`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/EconomiaCircularMacroMesoMicroBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/assets/editor.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Create a native WordPress Gutenberg custom block that matches the Astro component visually as closely as possible in both the editor canvas and the frontend.

Macro, meso, micro interactive/content section.

## Editor experience

- Render the real block preview in Gutenberg, not a placeholder-only form.
- The editor preview should use the same locked markup, class names/design tokens, spacing, responsive behavior, and interaction model as the Astro component.
- Put content fields in the block sidebar or inline rich text where appropriate.
- Start from the existing Astro component as the source of truth. Port the structure to the WordPress block implementation rather than redesigning it.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `leftImageId`
- `leftImageSrc`
- `leftImageAlt`
- `tiers`

### Legacy compatibility reads

- `leftImageUrl`
<!-- END GENERATED: structured-block-contract -->

## Customizable fields

Only expose content fields:

heading/intro, tiers repeater locked to macro/meso/micro: label, title, body, items/links. Do not allow changing tier count, colors, or layout.

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

- Register the block with the exact block ID `macro-meso-micro` or the project namespace equivalent, preserving this ID as the stable reference.
- Use custom fields/attributes for the content listed above.
- Save structured content as block attributes, or use ACF/Meta fields only if that is the WordPress project's convention.
- Use server-side rendering if dynamic WordPress data is required; otherwise save static block markup generated from attributes.
- Enqueue editor and frontend CSS so Gutenberg matches Astro at editing time.
- Reuse existing design tokens when available. If the WordPress theme does not have them, define a compatibility layer that maps Nomia tokens to the same values.
- Add sensible empty states in the editor, but do not show empty-state UI on the frontend.
- Validate required content fields and keep fallback copy/images out of production output unless the original Astro component has intentional defaults.
