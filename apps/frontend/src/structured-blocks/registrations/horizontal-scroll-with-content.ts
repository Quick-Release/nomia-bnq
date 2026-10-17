import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const HORIZONTAL_SCROLL_PILL_FIELDS = {
  label: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
};

const HORIZONTAL_SCROLL_SLIDE_FIELDS = {
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
    blockName: "getquick/horizontal-scroll-with-content",
    catalogId: "horizontal-scroll-with-content",
    schemaVersion: 1,
    order: 15,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("horizontal-scroll-with-content"),
    eyebrow: stringAttribute(),
    headingLine1: stringAttribute(),
    headingLine2: stringAttribute(),
    pills: arrayAttribute(HORIZONTAL_SCROLL_PILL_FIELDS, {
      required: ["label"],
    }),
    verTodosHref: stringAttribute("", { ui: { kind: "url" } }),
    verTodosLabel: stringAttribute(),
    slides: arrayAttribute(HORIZONTAL_SCROLL_SLIDE_FIELDS, {
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
    module: "HorizontalScrollWithContentBlock.astro",
    preview: {
      label: "Horizontal scroll with content",
      attributes: {
        eyebrow: "Visão geral",
        headingLine1: "A Economia Circular promove um modelo económico reorganizado,",
        headingLine2:
          "através da coordenação dos sistemas de produção e consumo em circuitos fechados.",
        pills: [
          { label: "Princípios", href: "#principios" },
          { label: "Produção", href: "#producao" },
          { label: "Consumo", href: "#consumo" },
        ],
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
          {
            id: "distribuicao",
            caption: "Distribuição",
            imageSrc: "/images/economia-circular/overview-slider/distribuicao.jpg",
            imageAlt: "Ave em pastagem",
            href: "/economia-circular/distribuicao/",
          },
        ],
      },
    },
  },
  editor: {
    title: "Scroll horizontal com conteúdo",
    description:
      "Imagens com legenda e ligação em deslocamento horizontal, com título, etiquetas e botão «Ver todos».",
    icon: "leftright",
    experience: "preview",
  },
  documentation: {
    path: "sections/economia-circular/horizontal-scroll-with-content.md",
  },
});
