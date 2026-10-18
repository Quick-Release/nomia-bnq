import {
  arrayAttribute,
  booleanAttribute,
  defineStructuredBlock,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const FILTER_TERM_FIELDS = {
  slug: stringAttribute(),
  name: stringAttribute(),
};

const PLATFORM_ITEM_FIELDS = {
  id: stringAttribute(),
  title: stringAttribute(),
  slug: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
  date: stringAttribute(),
  dateLabel: stringAttribute(),
  description: stringAttribute(),
  subtitle: stringAttribute(),
  featured: booleanAttribute(),
  imageId: numberAttribute(),
  imageUrl: stringAttribute("", { ui: { kind: "media" } }),
  imageAlt: stringAttribute(),
  tematicas: arrayAttribute(FILTER_TERM_FIELDS, {
    required: ["slug", "name"],
  }),
  setores: arrayAttribute(FILTER_TERM_FIELDS, {
    required: ["slug", "name"],
  }),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/content-grid-filters",
    catalogId: "content-grid-filters",
    schemaVersion: 1,
    order: 6,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("content-grid-filters"),
    heading: stringAttribute(),
    items: arrayAttribute(PLATFORM_ITEM_FIELDS, {
      required: ["title", "href"],
    }),
    tematicas: arrayAttribute(FILTER_TERM_FIELDS, {
      required: ["slug", "name"],
    }),
    setores: arrayAttribute(FILTER_TERM_FIELDS, {
      required: ["slug", "name"],
    }),
  },
  compatibility: {
    legacyReads: {
      plataformas: "array",
    },
  },
  renderer: {
    module: "PlataformasGridBlock.astro",
    preview: {
      label: "Plataformas grid",
      attributes: {
        heading: "Plataformas",
        tematicas: [
          {
            slug: "circular",
            name: "Circular",
          },
        ],
        setores: [
          {
            slug: "industria",
            name: "Indústria",
          },
        ],
        items: [
          {
            id: "fixture-platform",
            title: "Plataforma de teste",
            slug: "plataforma-de-teste",
            href: "#plataforma",
            dateLabel: "2026",
            description: "Descrição curta da plataforma.",
            subtitle: "Subtítulo",
            featured: true,
            imageUrl: "/images/hero-carousel/economia-circular.jpg",
            imageAlt: "Imagem de plataforma",
            tematicas: [
              {
                slug: "circular",
                name: "Circular",
              },
            ],
            setores: [
              {
                slug: "industria",
                name: "Indústria",
              },
            ],
          },
        ],
      },
    },
  },
  editor: {
    title: "Grelha de conteúdos com filtros",
    description:
      "Grelha de cartões com imagem, título e descrição, que os visitantes filtram por temáticas e setores.",
    icon: "filter",
    experience: "preview",
    module: "ContentGridFilters.jsx",
  },
  documentation: {
    path: "content-lists/content-grid-filters.md",
  },
});
