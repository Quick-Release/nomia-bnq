# Content listing

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `content-listing`
- WordPress block name: `getquick/content-listing`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/ContentListingBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/nomia-blocks/blocks/content-listing/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Lists a collection's published items (the nomia-cpt types: Biblioteca, Eventos, Oportunidades, …) on an archive Page, in Nomia's design. The editor lays the archive Page out with blocks: a hero, the [Filters block](./content-filters.md), other sections, and this listing.

The block stores which items to list, never the items. When the Page is visited, the Frontend asks gq-content's publication store for them (`content.list`), so the Page shows what is published now without being saved again, and a visit never reads WordPress.

## Settings

| Attribute | Values | Default |
|---|---|---|
| `collection` | a key of `CONTENT_COLLECTIONS` (`src/lib/content-collections.ts`), the post type's name | `biblioteca` |
| `taxonomy`, `term` | one of the collection's taxonomies and a term slug: the listing shows only that term (a category Page such as `/biblioteca/legislacao/`) | none |
| `display` | `list` (titles), `thumbnail-grid` (three columns, title over the image), `titled-thumbnail-grid` (two columns, title above the image) | `list` |
| `perPage` | 1–48 | 12 |
| `showPagination` | whether the page links show when there's more than one page | `true` |

Gutenberg leaves an attribute at its default out of the block comment, so the renderer reads a missing attribute as its default.

## Reading the address

The listing reads the visit's query string on the server:

- `?q=`: the search text;
- `?categoria=`, `?tipo=`, `?tematica=`, `?setor=`: a term slug, per the collection's taxonomies (`CONTENT_COLLECTIONS[…].taxonomies[].param`);
- `?pagina=`: the page, from 1.

A term fixed in the block always applies. A parameter for the taxonomy the block fixes is ignored, so a category Page can't be widened. All listings on a Page read the same parameters.

The store answers the query (`content.list`, gq-content#38): items are newest first. Within a taxonomy an item matches any of the given slugs, and it must match every taxonomy given. Matching is on a term's own slug, so a parent category doesn't include its children's items. The search matches a substring of the title or the excerpt, ignoring case and accents.

## States

- Items: the chosen presentation, and the page links when there's more than one page.
- No items: "Ainda não há entradas publicadas.", or "Nenhum conteúdo corresponde à pesquisa." when the visitor filtered.
- The store didn't answer (or the Site's `@getquick/content` doesn't list collections yet): "A lista não está disponível de momento."

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `collection`
- `taxonomy`
- `term`
- `display`
- `perPage`
- `showPagination`
<!-- END GENERATED: structured-block-contract -->

## Locked controls

The editor chooses what to list and how many, and one of the three presentations. Colours, spacing, typography and card design stay with the Astro component (`src/components/content-lists/listing/NomiaContentListing.astro`).
