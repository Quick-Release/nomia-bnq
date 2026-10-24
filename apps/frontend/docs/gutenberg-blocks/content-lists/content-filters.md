# Content filters

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `content-filters`
- WordPress block name: `getquick/content-filters`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/ContentFiltersBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/content-filters/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

A search box and a collection's taxonomy choices for the [Content listing](./content-listing.md) on the same archive Page.

It's a plain GET form whose action is the Page itself. Submitting it reloads the Page with the choices in the address (`?q=`, `?categoria=`, `?tematica=`, …), and the listing reads them on the server. Every filtered view is a link, and the form works without JavaScript. Submitting drops `?pagina=`, so a new search starts from the first page.

## Settings

| Attribute | Values | Default |
|---|---|---|
| `collection` | the same collection as the Page's listing | `biblioteca` |
| `showSearch` | whether the search box shows | `true` |
| `hiddenTaxonomies` | the collection's taxonomies the block doesn't offer, e.g. the category on a category Page, whose listing fixes it | `[]` |

A taxonomy shows the terms the collection's published items have, with their counts, from the publication store (`content.terms`). A taxonomy without such terms doesn't show, and the block renders nothing when it has neither a search box nor a choice.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `collection`
- `showSearch`
- `hiddenTaxonomies`
<!-- END GENERATED: structured-block-contract -->

## Locked controls

The editor chooses the collection, whether to search and which taxonomies to offer. The form's design stays with the Astro component (`src/components/content-lists/listing/NomiaContentFilters.astro`).
