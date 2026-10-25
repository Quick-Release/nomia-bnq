# Header search

## Purpose

A site-owned magnifying-glass control opening an inline GET search form, like
Nomia's reference header. Insert **Pesquisa do cabeçalho** alongside the logo,
nomia_navigation and Contacto do cabeçalho in the header pattern.

## Editing

The inspector sets the accessible label, placeholder, submit and close labels,
results-page URL and optional uploaded icon. Removing the image restores the
built-in magnifying glass. Set **Página de resultados** to `/pesquisa/` for the
site-wide results page once its gq-content search dependency has been adopted,
or an archive Page with content filters/listing to search that archive now.
The form sends the keyword as `q`; fixed query parameters in the destination
are preserved, while a previous `q` and `pagina` are removed.

The form only accepts HTTP(S) destinations. A missing or unsafe destination
renders no control. Contact links may use `tel:`, but search forms cannot.

## Frontend behavior

Without JavaScript, the labeled search form remains visible and can submit.
With JavaScript, the icon opens it and focuses the input. Close or Escape
restores focus to the icon. Each instance has unique form/input IDs. Only one
form expands within the same header, and separate headers remain independent.

Inside a Container with the `nomia-header-bar` class, opening search hides the
navigation and contact controls to give the form room; closing restores them.
Below 768px the form occupies its own row. Colors inherit from the Container.
Use the blocks directly inside this Container as described in header-contact.md.

These editor and frontend controls belong to Nomia. The site-wide publication
search API belongs to gq-content and is implemented in a separate repository
session; this block never queries WordPress directly or implements a second
publication store.

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `header-search`
- WordPress block name: `getquick/header-search`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/HeaderSearchBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/header-search/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `label`
- `placeholder`
- `submitLabel`
- `closeLabel`
- `resultsHref`
- `iconId`
- `iconUrl`
<!-- END GENERATED: structured-block-contract -->

## Layout delivery

Nomia’s `Blocks/HeaderActions.php` declares the block and its saved attribute
types through `getquick_design_block_definitions`, the existing Site extension
hook. This preserves editor settings in delivered header patterns without
changing gq-design or registering these blocks for other Sites.
