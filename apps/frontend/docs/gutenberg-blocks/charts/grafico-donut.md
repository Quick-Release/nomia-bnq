# GraficoDonutSection

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `grafico-donut`
- WordPress block name: `getquick/grafico-donut`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/GraficoDonutBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/nomia-blocks/src/index.jsx`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Chart-only pie donut block: Recharts doughnut plus side legend pills. No title, description, or summary — for embedding the visualization inside other layouts.

## Editor experience

- **Inline fields** in the block canvas (`editorExperience: inline-fields`). No Astro iframe preview.
- Content fields are **not** in the block sidebar (`InspectorControls`).
- Visual styling remains locked to apps/web; editors change slice data only.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `slices`

### Legacy compatibility reads

- `items`
<!-- END GENERATED: structured-block-contract -->

## Customizable fields

Only expose chart data:

- `slices` / `items` — array of `{ type, label, value }` per slice.

Chart type, palette, tooltip style, and dimensions are locked; slice colors follow the Nomia palette by position.

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

- Register the block with catalog ID `grafico-donut` and block name `getquick/grafico-donut`.
- Use inline `AttributeField` UI in Gutenberg (see `apps/cms/web/app/plugins/nomia-blocks/src/index.jsx`).
- Save structured content as block attributes in post content comments; Astro renders at build time.
- Reuse slice shape from `PieChartDonutChart` (`PieChartDonutSlice` type).
- The frontend does not render this block when `slices` is empty; the catalog demo supplies its own preview data.

## Migrating from `getquick/chart-pie-chart`

Before removing an old plugin build from apps/cms, migrate any posts that still reference the previous block:

```bash
ddev wp search-replace 'getquick/chart-pie-chart' 'getquick/grafico-donut' --all-tables --precise
ddev wp search-replace 'chart-pie-chart' 'grafico-donut' --all-tables --precise
```

Re-save affected pages in Gutenberg after migration so block attributes validate against the new contract.
