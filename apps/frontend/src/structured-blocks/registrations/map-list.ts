import {
  arrayAttribute,
  arrayOfAttribute,
  defineStructuredBlock,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const MAP_TERM_FIELDS = {
  id: stringAttribute(),
  label: stringAttribute(),
};

const MAP_ITEM_FIELDS = {
  id: stringAttribute(),
  title: stringAttribute(),
  excerpt: stringAttribute(),
  dateLabel: stringAttribute(),
  imageId: numberAttribute(),
  imageSrc: stringAttribute("", {
    legacyReads: ["imageUrl"],
    ui: { kind: "media" },
  }),
  imageAlt: stringAttribute(),
  href: stringAttribute("", {
    legacyReads: ["url"],
    ui: { kind: "url" },
  }),
  regionId: stringAttribute(),
  audienceIds: arrayOfAttribute(stringAttribute()),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/map-list",
    catalogId: "map-list",
    schemaVersion: 1,
    order: 7,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("map-list"),
    regions: arrayAttribute(MAP_TERM_FIELDS, {
      required: ["id", "label"],
    }),
    audiences: arrayAttribute(MAP_TERM_FIELDS, {
      required: ["id", "label"],
    }),
    items: arrayAttribute(MAP_ITEM_FIELDS, {
      required: ["title", "href", "imageSrc", "regionId", "audienceIds"],
    }),
  },
  renderer: {
    module: "MapListExplorerBlock.astro",
    preview: {
      label: "Map list",
      attributes: {
        regions: [
          {
            id: "alentejo",
            label: "Alentejo",
          },
        ],
        audiences: [
          {
            id: "empresas",
            label: "Empresas",
          },
        ],
        items: [
          {
            id: "map-list-fixture",
            title: "Iniciativa de teste",
            excerpt: "Resumo curto vindo do WordPress.",
            href: "#iniciativa",
            dateLabel: "2026",
            imageUrl: "/images/hero-carousel/economia-circular.jpg",
            imageAlt: "Mapa",
            regionId: "alentejo",
            audienceIds: ["empresas"],
          },
        ],
      },
    },
  },
  editor: {
    title: "Mapa com lista",
    description: "Mapa de regiões com filtros por público e lista dos conteúdos de cada região.",
    icon: "location",
    experience: "preview",
    bespoke: true,
  },
  documentation: {
    path: "map-list.md",
  },
});
