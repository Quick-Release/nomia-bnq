import { COLLECTION_KEYS } from "../../lib/content-collections.ts";
import {
  arrayOfAttribute,
  booleanAttribute,
  defineStructuredBlock,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

/**
 * A search box and a collection's taxonomy choices. Submitting it reloads the
 * Page with the choices in its address (`?q=`, `?categoria=`, `?tematica=`…),
 * which the Listing block on the same Page reads on the server: every
 * filtered view is a link, and it works without JavaScript.
 */
export default defineStructuredBlock({
  identity: {
    blockName: "getquick/content-filters",
    catalogId: "content-filters",
    schemaVersion: 1,
    order: 40,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("content-filters"),
    collection: stringAttribute("biblioteca", {
      enum: COLLECTION_KEYS,
      ui: { kind: "select" },
    }),
    showSearch: booleanAttribute(true),
    /** The collection's taxonomies the block doesn't offer; it offers every other. */
    hiddenTaxonomies: arrayOfAttribute(stringAttribute()),
  },
  renderer: {
    module: "ContentFiltersBlock.astro",
    preview: {
      label: "Content filters",
      attributes: {
        collection: "biblioteca",
        showSearch: true,
      },
    },
  },
  editor: {
    title: "Pesquisa e filtros",
    description:
      "Caixa de pesquisa e filtros por categoria, temática e setor para a listagem de conteúdos da mesma página.",
    icon: "filter",
    keywords: ["pesquisa", "filtros", "search", "filters", "arquivo"],
    experience: "preview",
    bespoke: true,
  },
  documentation: {
    path: "content-lists/content-filters.md",
  },
});
