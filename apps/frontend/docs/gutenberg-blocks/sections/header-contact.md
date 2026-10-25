# Header contact

## Purpose

A site-owned phone icon linking to Nomia's contact page, matching the reference
header. Insert **Contacto do cabeçalho** in the header pattern alongside Site
Logo, nomia_navigation and Pesquisa do cabeçalho.

## Editing

The inspector sets the accessible label and destination (default `/contactos/`).
A `tel:+351…` destination makes it a telephone link. Upload an optional icon;
removing it restores the built-in phone. Icons are decorative because the link
has an accessible label. Colors inherit from the surrounding Container.

## Header composition

Use a Container with the additional CSS class `nomia-header-bar` and put Site
Logo, nomia_navigation, Contacto do cabeçalho and Pesquisa do cabeçalho directly
inside it. Choose the background and text colors on that Container. The bar
provides spacing and the navigation takes the remaining width. Below 1400px,
the navigation supplies its menu button; contact and search remain available.

The block is owned and shipped by Nomia's gq-bioeconomia plugin and Astro
frontend. It adds no block or behavior to the global gq-design plugin.

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `header-contact`
- WordPress block name: `getquick/header-contact`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/HeaderContactBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/header-contact/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `label`
- `href`
- `iconId`
- `iconUrl`
<!-- END GENERATED: structured-block-contract -->

## Layout delivery

Nomia’s `Blocks/HeaderActions.php` declares the block and its saved attribute
types through `getquick_design_block_definitions`, the existing Site extension
hook. This preserves editor settings in delivered header patterns without
changing gq-design or registering these blocks for other Sites.
