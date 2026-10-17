import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const CONSUMPTION_BAR_FIELDS = {
  band: stringAttribute(),
  label: stringAttribute(),
  pct: numberAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/sustainable-consumption-bars",
    catalogId: "sustainable-consumption-bars",
    schemaVersion: 1,
    order: 31,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("sustainable-consumption-bars"),
    bars: arrayAttribute(CONSUMPTION_BAR_FIELDS, {
      required: ["band", "label", "pct"],
    }),
    title: stringAttribute(),
    subtitle: stringAttribute(),
    summary: stringAttribute(),
    headingId: stringAttribute(),
    sectionId: stringAttribute(),
  },
  compatibility: {
    legacyReads: {
      items: "array",
    },
  },
  renderer: {
    module: "SustainableConsumptionBarsGraphBlock.astro",
    preview: {
      label: "Graph vertical bars",
      attributes: {
        title: "Participação em programas de reciclagem",
        subtitle: "Compare a participação por faixa etária.",
        summary: "Os valores apresentados são dados de demonstração do gráfico.",
        bars: [
          { band: "18-25", label: "18–25 anos", pct: 20 },
          { band: "26-40", label: "26–40 anos", pct: 40 },
          { band: "41-60", label: "41–60 anos", pct: 27 },
          { band: "60plus", label: "+60 anos", pct: 13 },
        ],
      },
    },
  },
  editor: {
    title: "Barras de consumo sustentável",
    description:
      "Gráfico de barras verticais com percentagens por grupo, com título, subtítulo e resumo.",
    icon: "chart-bar",
    experience: "preview",
  },
  documentation: {
    path: "charts/sustainable-consumption-bars.md",
  },
});
