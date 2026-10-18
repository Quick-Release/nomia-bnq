# title-with-label

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `title-with-label`
- WordPress block name: `getquick/title-with-label`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/TitleWithLabelBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/nomia-blocks/blocks/title-with-label/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Create a native WordPress Gutenberg custom block that matches the Astro component visually as closely as possible in both the editor canvas and the frontend.

Section heading with a short eyebrow label and a title split into one or two lines.

## Editor experience

- Inline editing for the label, first title line, and optional second title line. The fields
  are plain text: no formats, and Enter/Shift+Enter cannot insert a line break.
- Keep the editor preview close to the frontend spacing and typography so editors can judge line breaks before publishing.
- The block toolbar's heading-level dropdown sets the title to h2 (default), h3, or h4.
- The settings sidebar has one standard typography panel per field (label, title line 1,
  title line 2), each with its own reset.
- While the label or the first title line is empty, the canvas shows a warning: Astro renders
  nothing for the block until both are filled.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `label`
- `titleLine1`
- `titleLine2`
- `level`
- `typography`

### Legacy compatibility reads

- `labelFontSize`
- `labelLineHeight`
- `labelBold`
- `labelItalic`
- `titleLine1FontSize`
- `titleLine1LineHeight`
- `titleLine1Bold`
- `titleLine1Italic`
- `titleLine2FontSize`
- `titleLine2LineHeight`
- `titleLine2Bold`
- `titleLine2Italic`
<!-- END GENERATED: structured-block-contract -->

## Customizable fields

Content fields:

label, first title line, second title line.

Per-field typography, stored in one `typography` object keyed by field
(`label`, `titleLine1`, `titleLine2`):

- `size`: a `--typography-font-size-*` token (`extra` … `h4` … `super`)
- `lineHeight`: a `--typography-line-height-*` token (`j` … `a`)
- `bold` / `italic`: `true` for the whole field

```json
{ "typography": { "titleLine1": { "size": "h3", "lineHeight": "f", "bold": true } } }
```

Values are design-token slugs, never measurements (ADR 0013, invariant 5): Astro renders
them as `var(--typography-…)` references, so a token change reaches every block. Bold and
italic apply to the entire field, not to a selection, and bold resolves to
`font-weight: 700`, a real step up from the `font-semibold` title lines and the
`font-medium` eyebrow.

Every override is optional. An untouched field stores nothing and keeps the classes'
tokens (`text-body`/`text-h4` with line heights `i`/`f`). Unknown keys and values outside
the token lists are contract violations and are ignored by the renderer.

Both title lines render inside one heading element, so assistive technology announces the
whole title.

### Retired pixel attributes

Content saved before the token schema stored `<field>FontSize`, `<field>LineHeight`,
`<field>Bold`, and `<field>Italic` per field. They remain legacy compatibility reads: the
editor migrates them through a block deprecation when the post is opened, and until then
Astro maps each pixel value to the nearest token with the same function (ties round up),
so saving the migrated post does not change the page.

## Locked controls

Do not expose controls for:

- colors
- typography beyond the per-field size and line-height tokens, bold, and italic listed above
- spacing
- alignment
- borders/radius/shadows
- layout variants unless explicitly listed as content above
- animation settings
- arbitrary CSS classes
- custom HTML

## Implementation notes for the coding agent

- Register the block with the exact block ID `title-with-label` or the project namespace equivalent, preserving this ID as the stable reference.
- Use custom fields/attributes for the content listed above.
- Save structured content as block attributes, or use ACF/Meta fields only if that is the WordPress project's convention.
- Use server-side rendering if dynamic WordPress data is required; otherwise save static block markup generated from attributes.
- Enqueue editor and frontend CSS so Gutenberg matches Astro at editing time.
- Reuse existing design tokens when available. If the WordPress theme does not have them, define a compatibility layer that maps Nomia tokens to the same values.
- Add sensible empty states in the editor, but do not show empty-state UI on the frontend.
- Validate required content fields and keep fallback copy/images out of production output unless the original Astro component has intentional defaults.
