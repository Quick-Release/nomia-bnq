import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const PAEC_OBJECTIVE_FIELDS = {
  code: stringAttribute(),
  description: stringAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/paec-2030",
    catalogId: "paec-2030",
    schemaVersion: 1,
    order: 18,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("paec-2030"),
    eyebrow: stringAttribute(),
    heading: stringAttribute(),
    imageLeftId: numberAttribute(),
    imageLeftSrc: stringAttribute("", { ui: { kind: "media" } }),
    imageLeftAlt: stringAttribute(),
    imageRightId: numberAttribute(),
    imageRightSrc: stringAttribute("", { ui: { kind: "media" } }),
    imageRightAlt: stringAttribute(),
    intro: stringAttribute(),
    saberMaisHref: stringAttribute("", { ui: { kind: "url" } }),
    saberMaisLabel: stringAttribute(),
    objectives: arrayAttribute(PAEC_OBJECTIVE_FIELDS, {
      required: ["code", "description"],
    }),
  },
  compatibility: {
    legacyReads: {
      imageLeftUrl: "string",
      imageRightUrl: "string",
      saberMaisUrl: "string",
    },
    legacyLinks: ["saberMaisUrl"],
  },
  renderer: {
    module: "EconomiaCircularPaec2030Block.astro",
    preview: {
      label: "Economia circular PAEC 2030",
      attributes: {
        heading: "PAEC 2030 em teste",
        imageLeftSrc: "/images/economia-circular/paec-2030/split-left.jpg",
        imageLeftAlt: "Imagem esquerda",
        imageRightSrc: "/images/economia-circular/paec-2030/split-right.jpg",
        imageRightAlt: "Imagem direita",
        intro: "Introdução do WordPress.",
        saberMaisHref: "/biblioteca/",
        saberMaisLabel: "Saber mais",
        objectives: [
          {
            code: "OE1",
            description: "Objetivo editável",
          },
        ],
      },
    },
  },
  editor: {
    title: "PAEC 2030",
    description:
      "Secção do PAEC 2030 com título, duas imagens, introdução, objetivos com código e ligação.",
    icon: "flag",
    experience: "preview",
  },
  documentation: {
    path: "sections/economia-circular/paec-2030.md",
  },
});
