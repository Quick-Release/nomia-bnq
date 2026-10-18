import {
  defineStructuredBlock,
  booleanAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/two-columns-text-image",
    catalogId: "two-columns-text-image",
    schemaVersion: 1,
    order: 9,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("two-columns-text-image"),
    eyebrowLabel: stringAttribute(),
    eyebrow: stringAttribute(),
    accent: stringAttribute(),
    heading: stringAttribute(),
    body: stringAttribute(),
    ctaHref: stringAttribute("", { ui: { kind: "url" } }),
    ctaLabel: stringAttribute(),
    primaryId: numberAttribute(),
    primarySrc: stringAttribute("", { ui: { kind: "media" } }),
    primaryAlt: stringAttribute(),
    mediaPosition: stringAttribute(),
    hideCta: booleanAttribute(),
    hideTaxonomy: booleanAttribute(),
  },
  compatibility: {
    legacyReads: {
      ctaUrl: "string",
      primaryUrl: "string",
      headingId: "string",
    },
    legacyLinks: ["ctaUrl"],
  },
  renderer: {
    module: "TwoColumnsTextImageBlock.astro",
    preview: {
      label: "Two columns text image",
      attributes: {
        eyebrow: "NOMIA",
        heading: "Two columns text image WP",
        body: "Texto do WordPress.",
        ctaHref: "/biblioteca/",
        ctaLabel: "Saber mais",
        primarySrc: "/images/home/bioeconomia-intro/hero.jpg",
        primaryAlt: "Muda em mãos",
        mediaPosition: "left",
      },
    },
  },
  editor: {
    title: "Duas colunas com texto e imagem",
    description:
      "Texto com etiqueta, título e botão ao lado de uma imagem, à esquerda ou à direita.",
    icon: "align-pull-left",
    experience: "preview",
    bespoke: true,
  },
  documentation: {
    path: "sections/landing/two-columns-text-image.md",
  },
});
