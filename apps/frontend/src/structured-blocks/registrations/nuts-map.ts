import { defineStructuredBlock, numberAttribute, stringAttribute } from "../define.ts";

/**
 * The published Boas práticas on a map of Portugal by NUTS 2024 region:
 * visitors switch between NUTS 0, 1 and 2 (each level in its own colour),
 * pick a region on the map or in the filters to list the entries tagged with
 * it or any region inside it. The entries are
 * the Biblioteca's `boas-praticas` category, read from the publication store
 * on each visit; editors tag them with Regiões NUTS. Those
 * tagged Internacional are left off the map and listed after it, under their
 * own heading.
 */
export default defineStructuredBlock({
  identity: {
    blockName: "getquick/nuts-map",
    catalogId: "nuts-map",
    schemaVersion: 1,
    order: 46,
  },
  lifecycle: { status: "active", inserter: true },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("nuts-map"),
    /** The NUTS level the map shows first: 0 (país), 1 or 2 (regiões). */
    level: stringAttribute("2", { enum: ["0", "1", "2"], ui: { kind: "select" } }),
    /** The heading of the entries tagged Internacional, listed after the map. */
    internationalTitle: stringAttribute("Boas Práticas internacionais"),
  },
  renderer: {
    module: "NutsMapBlock.astro",
    preview: { label: "NUTS map", attributes: { level: "2" } },
  },
  editor: {
    title: "Mapa de boas práticas (NUTS)",
    description:
      "Mapa de Portugal por regiões NUTS com as boas práticas da Biblioteca de cada região, e a lista das internacionais.",
    icon: "location-alt",
    keywords: ["mapa", "nuts", "regiões", "boas práticas", "map", "region"],
    experience: "preview",
  },
  documentation: { path: "sections/nuts-map.md" },
});
