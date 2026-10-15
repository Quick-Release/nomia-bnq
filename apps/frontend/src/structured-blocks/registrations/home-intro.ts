import {
  defineStructuredBlock,
  booleanAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/home-intro",
    catalogId: "home-intro",
    schemaVersion: 1,
    order: 11,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("home-intro"),
    eyebrowLabel: stringAttribute(),
    eyebrow: stringAttribute(),
    accent: stringAttribute(),
    heading: stringAttribute(),
    body: stringAttribute(),
    ctaHref: stringAttribute("", { ui: { kind: "url" } }),
    ctaLabel: stringAttribute(),
    showCta: booleanAttribute(),
    showTematica: booleanAttribute(),
    showCaption: booleanAttribute(),
    heroId: numberAttribute(),
    heroSrc: stringAttribute("", { ui: { kind: "media" } }),
    heroAlt: stringAttribute(),
    captionHeading: stringAttribute(),
    captionBody: stringAttribute(),
  },
  compatibility: {
    legacyReads: {
      ctaUrl: "string",
      heroUrl: "string",
      hideCta: "boolean",
    },
    legacyLinks: ["ctaUrl"],
  },
  renderer: {
    module: "HomeIntro.astro",
    preview: {
      label: "Home intro",
      attributes: {
        eyebrow: "NOMIA",
        accent: "ciano",
        heading: "Bioeconomia para um futuro sustentável",
        body: "Conheça projetos, iniciativas e recursos para uma economia mais sustentável.",
        ctaHref: "/bioeconomia-sustentavel/",
        ctaLabel: "Explorar",
        showCta: true,
        showTematica: true,
        showCaption: false,
        heroSrc: "/images/home/bioeconomia-intro/hero.jpg",
        heroAlt: "Muda em mãos",
      },
    },
  },
  editor: {
    title: "Introdução da homepage",
    description:
      "Introdução com etiqueta, título, texto, botão e imagem grande com legenda opcional.",
    icon: "admin-home",
    experience: "preview",
    module: "HomeIntro.jsx",
  },
  documentation: {
    path: "sections/landing/home-intro.md",
  },
});
