import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const MACRO_MESO_MICRO_TIER_FIELDS = {
  id: stringAttribute(),
  pillLabel: stringAttribute(),
  title: stringAttribute(),
  portraitId: numberAttribute(),
  portraitSrc: stringAttribute("", {
    legacyReads: ["portraitUrl"],
    ui: { kind: "media" },
  }),
  portraitAlt: stringAttribute(),
  description: stringAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/macro-meso-micro",
    catalogId: "macro-meso-micro",
    schemaVersion: 1,
    order: 19,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("macro-meso-micro"),
    leftImageId: numberAttribute(),
    leftImageSrc: stringAttribute("", { ui: { kind: "media" } }),
    leftImageAlt: stringAttribute(),
    tiers: arrayAttribute(MACRO_MESO_MICRO_TIER_FIELDS, {
      required: ["id", "pillLabel", "title", "portraitSrc", "description"],
    }),
  },
  compatibility: {
    legacyReads: {
      leftImageUrl: "string",
    },
  },
  renderer: {
    module: "EconomiaCircularMacroMesoMicroBlock.astro",
    preview: {
      label: "Macro meso micro",
      attributes: {
        leftImageSrc: "/images/economia-circular/macro-meso-micro/column-wide.jpg",
        leftImageAlt: "Paisagem para ilustrar os níveis de intervenção",
        tiers: [
          {
            id: "macro",
            pillLabel: "Macro",
            title: "Sistemas e políticas",
            portraitSrc: "/images/economia-circular/macro-meso-micro/panel-macro.jpg",
            portraitAlt: "Nível macro",
            description: "Transformação à escala das políticas e dos sistemas económicos.",
          },
          {
            id: "meso",
            pillLabel: "Meso",
            title: "Redes e territórios",
            portraitSrc: "/images/economia-circular/macro-meso-micro/panel-macro.jpg",
            portraitAlt: "Nível meso",
            description: "Cooperação entre organizações e comunidades num território.",
          },
          {
            id: "micro",
            pillLabel: "Micro",
            title: "Produtos e serviços",
            portraitSrc: "/images/economia-circular/macro-meso-micro/panel-macro.jpg",
            portraitAlt: "Nível micro",
            description: "Soluções concretas para produtos, serviços e utilizadores.",
          },
        ],
      },
    },
  },
  editor: {
    title: "Macro, meso e micro",
    description:
      "Imagem ao lado de separadores macro, meso e micro, cada um com título, retrato e descrição.",
    icon: "networking",
    experience: "preview",
  },
  documentation: {
    path: "sections/economia-circular/macro-meso-micro.md",
  },
});
