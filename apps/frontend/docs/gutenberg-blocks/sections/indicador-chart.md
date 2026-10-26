# Indicador chart

## Purpose

Draws one published Indicador (gq-bioeconomia's `indicadores` type) as a
chart, with its title, period, unit, geographic area and source. Add one
**Gráfico de indicador** block per Indicador, in the order the page needs, as
on `/economia-circular/indicadores-economia-circular/`.

## Editing

**Temática** narrows the list of Indicadores to one Temáticas term (stored as
`tematica`, used only by the editor); **Indicador** picks the Indicador
(stored as `indicadorId`). The preview shows the chart as the Frontend draws
it. The chart's values, axes and source are edited on the Indicador itself,
in its **Metadados do gráfico** panel, never on the block.

## Frontend behavior

The block stores which Indicador to draw, never its values. When the page is
visited, the Frontend reads the published Indicadores from gq-content's
publication store (`content.list`, once per visit for every block on the
page), so the page shows an Indicador's data as published now without being
saved again, and a visit never reads WordPress. Each Indicador's chart is
stored with it as Nomia's content extension (`src/lib/indicador-chart.ts`,
`src/lib/nomia-content.ts`).

An Indicador that is not published, has no values, or can't be read renders
nothing.

- **Horizontal Bars** draws horizontal bars: categories (years) on y, values
  on x, as the legacy charts did. **Columns**, and the representations not
  drawn yet (**Traffic Lights**, **Speedometer**), draw columns: categories
  on x, values on y.
- Points entered on the other axes (the years where the values belong) are
  read the other way round, and a time label (`Ano`) always names the
  categories, so legacy entries draw correctly either way.
- Rows without a value are left out; year categories are drawn oldest first.
- Values accept `1.59` or `1,59`, and are shown in Portuguese formatting.
- A visually hidden table carries the values for screen readers.

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `indicador-chart`
- WordPress block name: `getquick/indicador-chart`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/IndicadorChartBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/indicador-chart/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `indicadorId`
- `tematica`
<!-- END GENERATED: structured-block-contract -->
