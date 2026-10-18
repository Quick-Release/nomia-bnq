# home-intro

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `home-intro`
- WordPress block name: `getquick/home-intro`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/HomeIntro.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/nomia-blocks/blocks/home-intro/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Create a native WordPress Gutenberg custom block that matches the Astro component visually as closely as possible in both the editor canvas and the frontend.

Landing intro section for bioeconomia.

## Editor experience

- Inline canvas editing (same pattern as `getquick/two-columns-text-image`): temática eyebrow select, heading, body, CTA label, hero image, and figcaption lines are edited in the block.
- Sidebar: **Show CTA button** (on by default; **CTA URL** when on), **Show Tematic selector**, **Show description text** (figcaption under the hero; on by default).
- Hero `alt` is taken from the media item when the image is selected (no manual alt field).

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
- `showCta`
- `showTematica`
- `showCaption`
- `heroId`
- `heroSrc`
- `heroAlt`
- `captionHeading`
- `captionBody`

### Legacy compatibility reads

- `ctaUrl`
- `heroUrl`
- `hideCta`
<!-- END GENERATED: structured-block-contract -->

## Customizable fields

Only expose content fields:

heading, body copy, CTA label/URL, image(s), alt text. No visual controls.

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

- Register the block with the exact block ID `home-intro` or the project namespace equivalent, preserving this ID as the stable reference.
- Use custom fields/attributes for the content listed above.
- Save structured content as block attributes, or use ACF/Meta fields only if that is the WordPress project's convention.
- Use server-side rendering if dynamic WordPress data is required; otherwise save static block markup generated from attributes.
- Enqueue editor and frontend CSS so Gutenberg matches Astro at editing time.
- Reuse existing design tokens when available. If the WordPress theme does not have them, define a compatibility layer that maps Nomia tokens to the same values.
- Add sensible empty states in the editor, but do not show empty-state UI on the frontend.
- Validate required content fields and keep fallback copy/images out of production output unless the original Astro component has intentional defaults.
