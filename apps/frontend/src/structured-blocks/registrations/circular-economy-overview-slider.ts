import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const OVERVIEW_PILL_FIELDS = {
  label: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
};

const OVERVIEW_SLIDE_FIELDS = {
  id: stringAttribute(),
  caption: stringAttribute(),
  imageId: numberAttribute(),
  imageSrc: stringAttribute("", {
    legacyReads: ["imageUrl"],
    ui: { kind: "media" },
  }),
  imageAlt: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/circular-economy-overview-slider",
    catalogId: "circular-economy-overview-slider",
    schemaVersion: 1,
    order: 17,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("circular-economy-overview-slider"),
    eyebrow: stringAttribute(),
    headingLine1: stringAttribute(),
    headingLine2: stringAttribute(),
    pills: arrayAttribute(OVERVIEW_PILL_FIELDS, {
      required: ["label"],
    }),
    verTodosHref: stringAttribute("", { ui: { kind: "url" } }),
    verTodosLabel: stringAttribute(),
    slides: arrayAttribute(OVERVIEW_SLIDE_FIELDS, {
      required: ["caption", "imageSrc", "href"],
    }),
  },
  compatibility: {
    legacyReads: {
      verTodosUrl: "string",
      items: "array",
    },
    legacyLinks: ["verTodosUrl"],
  },
  renderer: {
    module: "EconomiaCircularOverviewSliderBlock.astro",
    preview: {
      label: "Economia circular overview slider",
      attributes: {
        eyebrow: "Visão geral",
        headingLine1: "A Economia Circular promove um modelo económico reorganizado,",
        headingLine2:
          "através da coordenação dos sistemas de produção e consumo em circuitos fechados.",
        pills: [{ label: "Princípios", href: "#principios" }],
        verTodosHref: "/biblioteca/",
        verTodosLabel: "Ver todos",
        slides: [
          {
            id: "concecao",
            caption: "Conceção/design",
            imageSrc: "/images/economia-circular/overview-slider/concecao.jpg",
            imageAlt: "Espaço interior com vegetação",
            href: "/economia-circular/concecao-design/",
          },
          {
            id: "producao",
            caption: "Produção",
            imageSrc: "/images/economia-circular/overview-slider/producao.jpg",
            imageAlt: "Antena parabólica em campo aberto",
            href: "/economia-circular/producao/",
          },
        ],
      },
    },
  },
  editor: {
    title: "Economia circular: slider geral",
    description:
      "Carrossel de imagens com legenda e ligação, precedido de título, etiquetas e botão «Ver todos».",
    icon: "slides",
    experience: "preview",
  },
  documentation: {
    path: "sections/economia-circular/overview-slider.md",
  },
});
