# Gutenberg block implementation briefs

These files are organized like `src/components` and brief a coding agent to create native WordPress Gutenberg blocks matching the Astro components.

Design rule: editors may change content only. Visual styling, spacing, layout, motion, variants, and arbitrary CSS are locked to the Astro reference. Gutenberg should preview each block as it will appear on the Astro frontend.

## Architecture

- [Astro-owned rendering architecture](./ARCHITECTURE.md)
- [WordPress implementation guide](./WORDPRESS-IMPLEMENTATION.md)
- [WordPress plugin smoke test checklist](./WORDPRESS-SMOKE-TEST.md)

## Blocks

### charts

- [NomiaConsumoSustentavelSection](./charts/sustainable-consumption-bars.md) — `sustainable-consumption-bars`
- [NomiaConsumoEnergiaSection](./charts/energy-consumption.md) — `energy-consumption-chart`
- [PieChartDonutSection](./charts/pie-chart-donut.md) — `pie-chart-donut`
- [GraficoDonutSection](./charts/grafico-donut.md) — `grafico-donut`
- [NomiaProdutividadeRecursosSection](./charts/resource-productivity-bars.md) — `resource-productivity-bars`
- [ResourceProductivityChart](./charts/resource-productivity.md) — `resource-productivity-chart`
- [NomiaResiduosUrbanosGeoSection](./charts/urban-waste-geo.md) — `urban-waste-geo-chart`
- [NomiaAreaChartInteractiveSection](./charts/interactive-area-chart.md) — `interactive-area-chart`
- [NomiaBarChartDefault](./charts/bar-chart-default.md) — `bar-chart-default`
- [NomiaBarChartActive](./charts/bar-chart-active.md) — `bar-chart-active`
- [NomiaBarChartHorizontal](./charts/bar-chart-horizontal.md) — `bar-chart-horizontal`
- [NomiaBarChartInteractive](./charts/bar-chart-interactive.md) — `bar-chart-interactive`
- [NomiaBarChartLabelCustom](./charts/bar-chart-custom-label.md) — `bar-chart-custom-label`
- [NomiaBarChartLabel](./charts/bar-chart-label.md) — `bar-chart-label`
- [NomiaBarChartMixed](./charts/bar-chart-mixed.md) — `bar-chart-mixed`
- [NomiaBarChartMultiple](./charts/bar-chart-multiple.md) — `bar-chart-multiple`
- [NomiaBarChartNegative](./charts/bar-chart-negative.md) — `bar-chart-negative`
- [NomiaBarChartStacked](./charts/bar-chart-stacked.md) — `bar-chart-stacked`

### content-lists/plataformas

- [NomiaPlataformasListSection](./content-lists/content-grid-filters.md) — `content-grid-filters`

### content-lists/podcasts

- [PodcastList](./content-lists/content-list.md) — `content-list`

### map-list-explorer

- [NomiaMapListExplorerSection](./map-list.md) — `map-list`

### page-heroes

- [PageHeroSlider](./page-heroes/page-hero-slider.md) — `page-hero-slider`
- [NomiaPageHero static variant](./page-heroes/page-hero-static.md) — `page-hero-static`

### sections/bioeconomia

- [NomiaBioeconomiaPabsContentSliderSection](./sections/bioeconomia/pabs-content-slider.md) — `pabs-content-slider`
- [NomiaBioeconomiaPhasesBandSection](./sections/bioeconomia/phases-band.md) — `bioeconomy-phases-band`
- [BioeconomiaSustentavelIntroSection](./sections/bioeconomia/sustentavel-dual-cards.md) — `sustainable-bioeconomy-dual-cards`

### sections/economia-circular

- [NomiaEconomiaCircularIndicadoresSpotlightSection](./sections/economia-circular/indicadores-spotlight.md) — `circular-economy-indicators-spotlight`
- [NomiaEconomiaCircularMacroMesoMicroSection](./sections/economia-circular/macro-meso-micro.md) — `macro-meso-micro`
- [HorizontalScrollWithContentSection](./sections/economia-circular/horizontal-scroll-with-content.md) — `horizontal-scroll-with-content`
- [Deprecated circular economy overview alias](./sections/economia-circular/overview.md) — `circular-economy-overview`
- [NomiaEconomiaCircularPaec2030Section](./sections/economia-circular/paec-2030.md) — `paec-2030`
- [NomiaEconomiaCircularRecursosSection](./sections/economia-circular/recursos.md) — `circular-economy-resources`
- [HorizontalScrollWithContent](./sections/economia-circular/overview-slider.md) — `circular-economy-overview-slider`

### sections/landing

- [NomiaBarometroResultsSection](./sections/landing/cta-results.md) — `cta-results`
- [NomiaBibliotecaSection](./sections/landing/biblioteca.md) — `library-grid`
- [home-intro](./sections/landing/home-intro.md) — `home-intro`
- [TwoColumnsTextImage](./sections/landing/two-columns-text-image.md) — `two-columns-text-image`
- [NomiaHomeEventCard compact](./sections/landing/event-card-compact.md) — `event-card-compact`
- [NomiaHomeEvents](./sections/landing/events-grid.md) — `events-grid`
- [NomiaIndicadoresSection](./sections/landing/indicadores.md) — `indicators-grid`
- [NomiaMultimediaSection](./sections/landing/multimedia.md) — `multimedia-grid`
- [NomiaOportunidadesSection](./sections/landing/oportunidades.md) — `opportunities-grid`
