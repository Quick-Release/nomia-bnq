import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const INDICATOR_CARD_FIELDS = {
  title: stringAttribute(),
  description: stringAttribute(),
  imageId: numberAttribute(),
  imageSrc: stringAttribute("", {
    legacyReads: ["imageUrl"],
    ui: { kind: "media" },
  }),
  imageAlt: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
  layout: stringAttribute("start", { enum: ["start", "stagger"] }),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/circular-economy-indicators-spotlight",
    catalogId: "circular-economy-indicators-spotlight",
    schemaVersion: 1,
    order: 20,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("circular-economy-indicators-spotlight"),
    eyebrow: stringAttribute(),
    heading: stringAttribute(),
    ctaHref: stringAttribute("", { ui: { kind: "url" } }),
    ctaLabel: stringAttribute(),
    cards: arrayAttribute(INDICATOR_CARD_FIELDS, {
      required: ["title", "description", "imageSrc"],
    }),
  },
  compatibility: {
    legacyReads: {
      ctaUrl: "string",
      items: "array",
    },
    legacyLinks: ["ctaUrl"],
  },
  renderer: {
    module: "EconomiaCircularIndicadoresSpotlightBlock.astro",
    preview: {
      label: "Indicadores spotlight",
      attributes: {
        eyebrow: "Indicadores",
        heading: "Dados para compreender a economia circular",
        ctaHref: "/indicadores/",
        ctaLabel: "Ver todos",
        cards: [
          {
            title: "Produtividade dos recursos",
            description: "Acompanhe a eficiência na utilização dos recursos.",
            imageSrc: "/images/economia-circular/indicadores-spotlight/produtividade-recursos.jpg",
            imageAlt: "Produtividade dos recursos",
            href: "/indicadores/",
          },
          {
            title: "Taxa de circularidade",
            description: "Observe a utilização de materiais circulares.",
            imageSrc: "/images/economia-circular/indicadores-spotlight/taxa-circular.jpg",
            imageAlt: "Taxa de circularidade",
            href: "/indicadores/",
            layout: "stagger",
          },
        ],
      },
    },
  },
  editor: {
    title: "Economia circular: indicadores em destaque",
    description:
      "Indicadores em cartões com imagem, título e texto, em disposição escalonada, com cabeçalho e botão.",
    icon: "star-filled",
    experience: "preview",
  },
  documentation: {
    path: "sections/economia-circular/indicadores-spotlight.md",
  },
});
