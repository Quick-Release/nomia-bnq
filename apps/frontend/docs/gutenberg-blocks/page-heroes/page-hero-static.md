# Cabeçalho página com imagem

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `page-hero-static`
- WordPress block name: `getquick/page-hero-static`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/PageHeroStaticBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/nomia-blocks/src/editors/PageHeroStatic.jsx`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Create a native WordPress Gutenberg custom block that matches the Astro component visually as closely as possible in both the editor canvas and the frontend.

Static full-bleed page hero.

## Editor experience

- Render the real block preview in Gutenberg, not a placeholder-only form.
- The editor preview should use the same locked markup, class names/design tokens, spacing, responsive behavior, and interaction model as the Astro component.
- Put content fields in the block sidebar or inline rich text where appropriate.
- Start from the existing Astro component as the source of truth. Port the structure to the WordPress block implementation rather than redesigning it.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `title`
- `subtitle`
- `showSubtitle`
- `imageId`
- `imageSrc`
- `imageAlt`
- `cta`
- `ctaLabel`
- `showCta`
- `ctaHref`
- `titleTextFontSize`
- `subtitleTextFontSize`
- `titleTextColor`
- `subtitleTextColor`
- `subtitleLineHeight`
- `textAlign`
- `height`
- `paddingTop`
- `paddingBottom`

### Legacy compatibility reads

- `ctaUrl`
- `imageUrl`
- `hideCta`
<!-- END GENERATED: structured-block-contract -->

## Customizable fields

Expose the content fields — title, subtitle, background image, decorative image alt, optional CTA label and URL, and CTA visibility — plus the following presentation fields:

- `subtitle`: plain text that reads as a short description and may run to several paragraphs. In the canvas, Enter starts a new line (stored as `<br>`); Astro renders each non-empty line as its own `<p>`, 16px apart, inside one wrapper that carries the subtitle's typography. A one-line subtitle keeps its single `<p>`. No formatting is allowed.

- `showSubtitle`: a Content-panel toggle. It defaults to on, so a hero saved before the toggle existed keeps its subtitle; only an explicit `false` hides it, and the subtitle text is kept in post content while hidden.

- `titleTextFontSize` / `subtitleTextFontSize`: optional whole-pixel values from 8px to 160px, edited with the typography controls in the block sidebar.
- `titleTextColor` / `subtitleTextColor`: optional opaque six-digit hex colours. The sidebar shows the colour in use; opening it offers the theme swatches, and Gutenberg's own "Custom color" button inside the palette is the only path to a free-form picker.
- `textAlign`: `left` | `center` | `right`, picked from an icon button group in the typography panel. It is one block-level choice — title, subtitle and CTA move together — and `left` is the default every hero saved before the control existed resolves to.
- `height`: a named step, `xs` | `s` | `m` | `l` | `xl`, picked from a button group in the block sidebar. `xl` is the default and the only value heroes saved before the scale existed resolve to.
- `subtitleLineHeight`: `default` or a `--typography-line-height-*` token slug (`j` … `a`, 16px to 112px), picked from a select in the typography panel that names each token's pixel value. `default` keeps the `text-subtitle` class's token (`g`, 40px). Astro emits `line-height: var(--typography-line-height-<slug>)`.
- `paddingTop` / `paddingBottom`: `default` | `none` | `small` | `medium` | `large`, picked from two selects in the layout panel. `default` keeps the padding the height step brings, so heroes saved before these controls are unchanged; the other steps follow the Section block's rhythm. Horizontal padding stays locked to the header gutter so the title lines up with the logo.

## Locked controls

The Astro renderer owns the hero's spacing, borders, and responsive behavior. Horizontal alignment is an editor choice, but only among the three named sides: `src/components/page-heroes/pageHeroShared.ts` owns the classes each side resolves to, so the copy keeps its measure and gutters whichever side it sits on. The title and subtitle may opt into bounded font-size and colour overrides; when unset they inherit the design tokens. Height and vertical padding are chosen as named steps only, and the subtitle line height as a design token: `src/components/page-heroes/pageHeroShared.ts` owns the viewport units and padding each step resolves to, so no measurement is ever stored in post content. Do not expose controls for the other visual policies, animation settings, arbitrary CSS classes, or custom HTML.

The Gutenberg canvas cannot import Tailwind's output, so it restates each step's
measurements in `src/lib/page-hero-canvas-scale.mjs` inside the plugin. That
restatement is checked, not trusted: `apps/web/tests/page-hero-canvas-scale.test.mjs`
derives the expected values from the frontend classes and fails when the two drift
or when a new step arrives without a canvas entry, including every combination of
height and padding step.

## Stored-content migration

Older block comments may still contain former visual attributes (`backgroundColor` and `heroHeight`). The Astro renderer ignores those fields and applies its current visual policy; content fields and the supported typography overrides continue to render. Re-saving a block through Gutenberg drops the unregistered visual fields.

`textAlign` was one of those retired fields and is registered again, so a hero saved with an old value reads it back. Anything outside `left` / `center` / `right` resolves to `left`.

The `heroHeight` name stays retired. Height now lives under `height` with the `xs`/`s`/`m`/`l`/`xl` vocabulary; the Astro `heroHeight` *prop* (used by hand-written pages such as `src/pages/noticias/index.astro`) still accepts the older `full` / `half` words, which resolve to `xl` and `s`.

## Implementation notes for the coding agent

- Register the block with the exact block ID `page-hero-static` or the project namespace equivalent, preserving this ID as the stable reference.
- Use custom fields/attributes for the content listed above.
- Save structured content as block attributes, or use ACF/Meta fields only if that is the WordPress project's convention.
- Use server-side rendering if dynamic WordPress data is required; otherwise save static block markup generated from attributes.
- Enqueue editor and frontend CSS so Gutenberg matches Astro at editing time.
- Reuse existing design tokens when available. If the WordPress theme does not have them, define a compatibility layer that maps Nomia tokens to the same values.
- Add sensible empty states in the editor, but do not show empty-state UI on the frontend.
- Validate required content fields and keep fallback copy/images out of production output unless the original Astro component has intentional defaults.
