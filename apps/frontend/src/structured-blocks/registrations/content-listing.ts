import {
  COLLECTION_KEYS,
  LISTING_DISPLAYS,
  LISTING_PER_PAGE_DEFAULT,
} from "../../lib/content-collections.ts";
import {
  booleanAttribute,
  defineStructuredBlock,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

/**
 * A collection's items, listed from the publication store when the page is
 * visited. It stores which items to list, never the items: an archive Page
 * shows what is published now without being saved again. The Filters block
 * on the same Page narrows it through the address (`?q=`, `?categoria=`,
 * `?pagina=`).
 */
export default defineStructuredBlock({
  identity: {
    blockName: "getquick/content-listing",
    catalogId: "content-listing",
    schemaVersion: 1,
    order: 39,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("content-listing"),
    collection: stringAttribute("biblioteca", {
      enum: COLLECTION_KEYS,
      ui: { kind: "select" },
    }),
    /** A taxonomy of the collection, with `term`: the listing shows only that term. */
    taxonomy: stringAttribute(),
    term: stringAttribute(),
    display: stringAttribute("list", { enum: LISTING_DISPLAYS, ui: { kind: "select" } }),
    perPage: numberAttribute(LISTING_PER_PAGE_DEFAULT),
    showPagination: booleanAttribute(true),
    infiniteLoading: booleanAttribute(false),
    lightbox: booleanAttribute(true),
  },
  renderer: {
    module: "ContentListingBlock.astro",
    preview: {
      label: "Content listing",
      attributes: {
        collection: "biblioteca",
        display: "list",
        perPage: 12,
        showPagination: true,
      },
    },
  },
  editor: {
    title: "Listagem de conteúdos",
    description:
      "Lista os conteúdos publicados de um tipo, como os documentos da Biblioteca ou os eventos, com paginação.",
    icon: "list-view",
    keywords: ["arquivo", "listagem", "archive", "listing", "biblioteca", "eventos"],
    experience: "preview",
    bespoke: true,
  },
  documentation: {
    path: "content-lists/content-listing.md",
  },
});
