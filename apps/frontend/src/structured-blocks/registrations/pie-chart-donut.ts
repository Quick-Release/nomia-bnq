import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const DONUT_SLICE_FIELDS = {
  type: stringAttribute(),
  label: stringAttribute(),
  value: numberAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/pie-chart-donut",
    catalogId: "pie-chart-donut",
    schemaVersion: 1,
    order: 28,
    componentVersion: "0.1.01",
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("pie-chart-donut"),
    title: stringAttribute(),
    description: stringAttribute(),
    summary: stringAttribute(),
    slices: arrayAttribute(DONUT_SLICE_FIELDS, {
      required: ["type", "label", "value"],
    }),
  },
  compatibility: {
    legacyReads: {
      items: "array",
    },
  },
  renderer: {
    module: "PieChartDonutBlock.astro",
    preview: {
      label: "Pie chart donut",
      attributes: {
        title: "Reciclagem de resíduos",
        description: "Compare a percentagem de resíduos reciclados por material.",
        summary: "Os valores apresentados são dados de demonstração do gráfico.",
        slices: [
          { type: "vidro", label: "Vidro", value: 30 },
          { type: "metal", label: "Metal", value: 25 },
          { type: "papel", label: "Papel", value: 28 },
          { type: "plastico", label: "Plástico", value: 17 },
        ],
      },
    },
  },
  editor: {
    title: "Gráfico circular donut",
    description:
      "Gráfico donut com título, descrição, resumo e legenda, por exemplo para percentagens de reciclagem.",
    icon: "chart-pie",
    experience: "preview",
  },
  documentation: {
    path: "charts/pie-chart-donut.md",
  },
});
