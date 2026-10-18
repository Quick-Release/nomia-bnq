# PieChartDonutSection

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `pie-chart-donut`
- WordPress block name: `getquick/pie-chart-donut`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/PieChartDonutBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/nomia-blocks/assets/editor.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Create a native WordPress Gutenberg custom block that matches the Astro component visually as closely as possible in both the editor canvas and the frontend.

Pie chart donut section (recycling and waste by default).

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
- `description`
- `summary`
- `slices`

### Legacy compatibility reads

- `items`
<!-- END GENERATED: structured-block-contract -->

## Customizable fields

Only expose content fields:

heading, eyebrow/label, description, chart data points/series labels/values, source note. Chart type, palette, axes, tooltip style, and dimensions are locked.

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

- Register the block with catalog ID `pie-chart-donut` and block name `getquick/pie-chart-donut`.
- Use custom fields/attributes for the content listed above.
- Save structured content as block attributes, or use ACF/Meta fields only if that is the WordPress project's convention.
- Use server-side rendering if dynamic WordPress data is required; otherwise save static block markup generated from attributes.
- Enqueue editor and frontend CSS so Gutenberg matches Astro at editing time.
- Reuse existing design tokens when available. If the WordPress theme does not have them, define a compatibility layer that maps Nomia tokens to the same values.
- Add sensible empty states in the editor, but do not show empty-state UI on the frontend.
- Validate required content fields and keep fallback copy/images out of production output unless the original Astro component has intentional defaults.

## Deprecating `getquick/graph-recycling-waste`

The old block is not registered or rendered. Before removing the old plugin build from apps/cms, migrate any posts that still reference it:

```bash
ddev wp search-replace 'getquick/graph-recycling-waste' 'getquick/pie-chart-donut' --all-tables --precise
ddev wp search-replace 'getquick-graph-recycling-waste' 'pie-chart-donut' --all-tables --precise
```

Re-save affected pages in Gutenberg after migration so block attributes validate against the new contract.
