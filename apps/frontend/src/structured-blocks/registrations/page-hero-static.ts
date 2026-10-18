import {
  PAGE_HERO_HEIGHT_DEFAULT,
  PAGE_HERO_HEIGHT_STEPS,
  PAGE_HERO_PADDING_DEFAULT,
  PAGE_HERO_PADDING_STEPS,
} from "../../components/page-heroes/pageHeroShared.ts";
import {
  PAGE_HERO_LINE_HEIGHT_DEFAULT,
  PAGE_HERO_LINE_HEIGHTS,
  PAGE_HERO_TEXT_ALIGN_DEFAULT,
  PAGE_HERO_TEXT_ALIGNS,
} from "../../lib/page-hero-typography.ts";
import {
  defineStructuredBlock,
  booleanAttribute,
  numberAttribute,
  objectAttribute,
  stringAttribute,
} from "../define.ts";

/**
 * `height`, `paddingTop` and `paddingBottom` store named steps, never
 * measurements: the svh values and padding each step resolves to stay owned by
 * `src/components/page-heroes/pageHeroShared.ts` rather than being frozen into
 * post content. `subtitleLineHeight` likewise stores a line-height token slug.
 *
 * Text typography overrides are deliberately bounded and optional. The shared
 * `page-hero-typography.ts` module owns their defaults and sanitization for the
 * Gutenberg canvas and Astro renderer.
 */
export default defineStructuredBlock({
  identity: {
    blockName: "getquick/page-hero-static",
    catalogId: "page-hero-static",
    schemaVersion: 1,
    order: 1,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("page-hero-static"),
    title: stringAttribute(),
    subtitle: stringAttribute(),
    /** Defaults to shown, so heroes saved before the toggle keep their subtitle. */
    showSubtitle: booleanAttribute(true),
    imageId: numberAttribute(),
    imageSrc: stringAttribute("", { ui: { kind: "media" } }),
    imageAlt: stringAttribute(),
    cta: objectAttribute(),
    ctaLabel: stringAttribute(),
    showCta: booleanAttribute(),
    ctaHref: stringAttribute("", { ui: { kind: "url" } }),
    titleTextFontSize: numberAttribute(undefined, { ui: { kind: "number" } }),
    subtitleTextFontSize: numberAttribute(undefined, { ui: { kind: "number" } }),
    titleTextColor: stringAttribute("", { ui: { kind: "text" } }),
    subtitleTextColor: stringAttribute("", { ui: { kind: "text" } }),
    subtitleLineHeight: stringAttribute(PAGE_HERO_LINE_HEIGHT_DEFAULT, {
      enum: PAGE_HERO_LINE_HEIGHTS,
      ui: { kind: "select" },
    }),
    textAlign: stringAttribute(PAGE_HERO_TEXT_ALIGN_DEFAULT, {
      enum: PAGE_HERO_TEXT_ALIGNS,
      ui: { kind: "select" },
    }),
    height: stringAttribute(PAGE_HERO_HEIGHT_DEFAULT, {
      enum: PAGE_HERO_HEIGHT_STEPS,
      ui: { kind: "select" },
    }),
    paddingTop: stringAttribute(PAGE_HERO_PADDING_DEFAULT, {
      enum: PAGE_HERO_PADDING_STEPS,
      ui: { kind: "select" },
    }),
    paddingBottom: stringAttribute(PAGE_HERO_PADDING_DEFAULT, {
      enum: PAGE_HERO_PADDING_STEPS,
      ui: { kind: "select" },
    }),
  },
  compatibility: {
    legacyReads: {
      ctaUrl: "string",
      imageUrl: "string",
      hideCta: "boolean",
    },
    legacyLinks: ["ctaUrl", "href", "url"],
  },
  renderer: {
    module: "PageHeroStaticBlock.astro",
    preview: {
      label: "Page hero with image",
      attributes: {
        title: "Título vindo do WordPress",
        subtitle: "Subtítulo editável no Gutenberg, renderizado pelo Astro.",
        imageSrc: "/images/home/bioeconomia-intro/hero.jpg",
        imageAlt: "Muda em mãos",
        ctaLabel: "Saber Mais",
        ctaHref: "/bioeconomia-sustentavel/",
        showCta: true,
        showSubtitle: true,
        titleTextFontSize: 64,
        subtitleTextFontSize: 28,
        titleTextColor: "#ffffff",
        subtitleTextColor: "#e5faf9",
        textAlign: "left",
        height: "xl",
      },
    },
  },
  editor: {
    title: "Cabeçalho página com imagem",
    description: "Hero no topo da página com imagem de fundo, título, subtítulo e botão opcional.",
    icon: "cover-image",
    keywords: ["hero", "cabeçalho", "capa", "banner", "destaque"],
    experience: "preview",
    bespoke: true,
  },
  documentation: {
    path: "page-heroes/page-hero-static.md",
  },
});
