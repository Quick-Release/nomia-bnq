import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const BIOECONOMY_CARD_FIELDS = {
  title: stringAttribute(),
  body: stringAttribute(),
  imageId: numberAttribute(),
  imageSrc: stringAttribute("", {
    legacyReads: ["imageUrl"],
    ui: { kind: "media" },
  }),
  imageAlt: stringAttribute(),
  headingId: stringAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/sustainable-bioeconomy-dual-cards",
    catalogId: "sustainable-bioeconomy-dual-cards",
    schemaVersion: 1,
    order: 12,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("sustainable-bioeconomy-dual-cards"),
    eyebrow: stringAttribute(),
    heading: stringAttribute(),
    cards: arrayAttribute(BIOECONOMY_CARD_FIELDS, {
      required: ["title", "body", "imageSrc"],
    }),
  },
  compatibility: {
    legacyReads: {
      items: "array",
    },
  },
  renderer: {
    module: "BioeconomiaSustentavelDualCardsBlock.astro",
    preview: {
      label: "Bioeconomia sustentável dual cards",
      attributes: {
        eyebrow: "Bioeconomia sustentável",
        heading: "Uma bioeconomia que regenera recursos e territórios",
        cards: [
          {
            title: "O que é",
            body: "Conheça os princípios de uma bioeconomia sustentável.",
            imageSrc: "/images/bioeconomia-sustentavel/card-o-que-e.jpg",
            imageAlt: "Planta em crescimento",
          },
          {
            title: "Porque importa",
            body: "Descubra como a inovação pode apoiar a regeneração.",
            imageSrc: "/images/bioeconomia-sustentavel/card-porque-importante.jpg",
            imageAlt: "Paisagem natural",
          },
        ],
      },
    },
  },
  editor: {
    title: "Bioeconomia sustentável: cartões duplos",
    description: "Cabeçalho com dois cartões lado a lado, cada um com imagem, título e texto.",
    icon: "columns",
    experience: "preview",
  },
  documentation: {
    path: "sections/bioeconomia/sustentavel-dual-cards.md",
  },
});
