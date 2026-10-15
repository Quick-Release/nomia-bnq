import {
  arrayAttribute,
  booleanAttribute,
  defineStructuredBlock,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const PAGE_HERO_SLIDE_FIELDS = {
  id: stringAttribute(),
  title: stringAttribute(),
  subtitle: stringAttribute(),
  ctaLabel: stringAttribute(),
  ctaHref: stringAttribute("", {
    legacyReads: ["ctaUrl"],
    ui: { kind: "url" },
  }),
  bgImageId: numberAttribute(),
  bgImage: stringAttribute("", {
    legacyReads: ["imageSrc", "imageUrl"],
    ui: { kind: "media" },
  }),
  spotlightImageId: numberAttribute(),
  spotlightImageSrc: stringAttribute("", {
    legacyReads: ["spotlightImageUrl"],
    ui: { kind: "media" },
  }),
  showSpotlight: booleanAttribute(true),
  spotlightTitle: stringAttribute(),
  spotlightBody: stringAttribute(),
  spotlightHref: stringAttribute("", {
    legacyReads: ["spotlightUrl"],
    ui: { kind: "url" },
  }),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/page-hero-slider",
    catalogId: "page-hero-slider",
    schemaVersion: 1,
    order: 3,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("page-hero-slider"),
    slides: arrayAttribute(PAGE_HERO_SLIDE_FIELDS, {
      required: ["title", "subtitle", "ctaLabel", "ctaHref", "bgImage"],
    }),
  },
  renderer: {
    module: "PageHeroSliderBlock.astro",
    preview: {
      label: "Page hero slider",
      attributes: {
        slides: [
          {
            id: "economia-circular",
            title: "Economia Circular",
            subtitle:
              "Um modelo económico reorganizado focado na coordenação dos sistemas de produção e consumo.",
            ctaLabel: "Explorar",
            ctaHref: "/economia-circular/",
            bgImage: "/images/hero-carousel/economia-circular.jpg",
            showSpotlight: true,
            spotlightImageSrc: "/images/hero-carousel/spotlight-bike.jpg",
            spotlightTitle: "Design circular",
            spotlightBody:
              "Conheça soluções para produtos e processos menos intensivos em recursos.",
            spotlightHref: "/biblioteca/",
          },
          {
            id: "barometro",
            title: "Barómetro",
            subtitle: "Indicadores e estatísticas para acompanhar a transição ambiental.",
            ctaLabel: "Explorar indicadores",
            ctaHref: "/indicadores/",
            bgImage: "/images/hero-carousel/barometro.jpg",
            showSpotlight: false,
          },
        ],
      },
    },
  },
  editor: {
    title: "Hero de página: slider",
    description:
      "Hero em carrossel em que cada diapositivo tem imagem de fundo, título, botão e destaque opcional.",
    icon: "images-alt2",
    experience: "preview",
    module: "PageHeroSlider.jsx",
  },
  documentation: {
    path: "page-heroes/page-hero-slider.md",
  },
});
