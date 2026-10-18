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
    blockName: "getquick/grafico-donut",
    catalogId: "grafico-donut",
    schemaVersion: 1,
    order: 29,
    componentVersion: "0.2.0",
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("grafico-donut"),
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
    module: "GraficoDonutBlock.astro",
    preview: {
      label: "Gráfico Donut",
      attributes: {
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
    title: "Gráfico donut",
    description:
      "Só o gráfico donut com legenda, sem título nem texto, para usar dentro de outros blocos.",
    icon: "chart-pie",
    experience: "inline-fields",
  },
  documentation: {
    path: "charts/grafico-donut.md",
  },
});
