# Content listing

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `content-listing`
- WordPress block name: `getquick/content-listing`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/ContentListingBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/content-listing/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Lists a collection's published items (the gq-bioeconomia types: Biblioteca, Eventos, Oportunidades, …) on an archive Page, in Nomia's design. The editor lays the archive Page out with blocks: a hero, the [Filters block](./content-filters.md), other sections, and this listing.

The block stores which items to list, never the items. When the Page is visited, the Frontend asks gq-content's publication store for them (`content.list`), so the Page shows what is published now without being saved again, and a visit never reads WordPress.

## Settings

| Attribute | Values | Default |
|---|---|---|
| `collection` | a key of `CONTENT_COLLECTIONS` (`src/lib/content-collections.ts`), the post type's name | `biblioteca` |
| `taxonomy`, `term` | one of the collection's taxonomies and a term slug: the listing shows only that term (a category Page such as `/biblioteca/legislacao/`) | none |
| `display` | `list` (titles), `thumbnail-grid` (three columns, title over the image), `titled-thumbnail-grid` (two columns, title above the image), `document-grid` (Biblioteca cards) | `list` |
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

The editor chooses what to list and how many, and a presentation. The Legislação category always uses document cards. Colours, spacing, typography and card design stay with the Astro component (`src/components/content-lists/listing/NomiaContentListing.astro`).


## Legislação documents

A Biblioteca listing fixed to `categoria_biblioteca=legislacao` uses `document-grid`
automatically, including existing saved Pages. Cards show the native title and
excerpt, year, publisher, featured image and independent PDF/page actions. A card
without a featured image says exactly `image not available`. The grid has one
column on mobile, two from `sm`, and three from `lg`.

Editors add Biblioteca documents, select the Legislação category, and fill in
**Detalhes do documento**: a year-only selector (1000 through next year),
**Publicado por**, **Descrição**, **Ficheiro PDF**, and **Ligação para a página**.
Descrição edits the native excerpt; the featured image uses WordPress's native
image panel. The publisher reuses the existing author meta key so older data and
GraphQL consumers remain compatible.

GraphQL on `Biblioteca` exposes `title`, `excerpt`, `featuredImage`,
`gqBioeconomiaLibraryYear`, `gqBioeconomiaLibraryPublisher`,
`gqBioeconomiaLibraryFileUrl`, and `gqBioeconomiaLibraryPageUrl`. The original
`gqBioeconomiaLibraryAuthor` remains an alias of the publisher.

The Site's collection extension stores these fields with each Biblioteca item.
The document listing reads all matching store pages (100 entries per read), then
applies `?ano=`, `?fonte=` and search before visitor pagination. This keeps counts
and matches correct beyond the first page. Search also includes the publisher.
Reads are shared by both blocks within a request; a failed store page produces
an unavailable listing rather than partial results. This approach is intended
for the Biblioteca catalogue; its cost grows with the category's document count.

Deploy the CMS additions before the Frontend, then run the normal publication
refresh/reconciliation so existing Biblioteca snapshots acquire the new fields.
Older snapshots without metadata still render title, excerpt and image; their
missing year/source does not appear in the filter options. This change does not
populate metadata for imported documents or modify production Page content.
