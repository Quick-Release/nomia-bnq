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
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/indicators-grid",
    catalogId: "indicators-grid",
    schemaVersion: 1,
    order: 22,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("indicators-grid"),
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
    module: "IndicadoresBlock.astro",
    preview: {
      label: "Indicadores",
      attributes: {
        eyebrow: "Indicadores",
        heading: "Acompanhe a transição para uma economia circular",
        ctaHref: "/indicadores/",
        ctaLabel: "Ver todos",
        cards: [
          {
            title: "Produtividade dos recursos",
            description: "Veja a evolução da eficiência na utilização de recursos.",
            imageSrc: "/images/home/indicators/produtividade-recursos.jpg",
            imageAlt: "Indicador de produtividade",
            href: "/indicadores/",
          },
          {
            title: "Taxa de circularidade",
            description: "Conheça a incorporação de materiais reciclados.",
            imageSrc: "/images/home/indicators/taxa-circular.jpg",
            imageAlt: "Indicador de circularidade",
            href: "/indicadores/",
          },
        ],
      },
    },
  },
  editor: {
    title: "Grelha de indicadores",
    description:
      "Cartões de indicadores com imagem, título e texto em três colunas, com cabeçalho e botão.",
    icon: "dashboard",
    experience: "preview",
  },
  documentation: {
    path: "sections/landing/indicadores.md",
  },
});
