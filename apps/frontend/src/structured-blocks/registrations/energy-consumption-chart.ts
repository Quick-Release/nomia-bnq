import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const ENERGY_DATA_FIELDS = {
  month: stringAttribute(),
  solar: numberAttribute(),
  eletrica: numberAttribute(),
  gas: numberAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/energy-consumption-chart",
    catalogId: "energy-consumption-chart",
    schemaVersion: 1,
    order: 30,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("energy-consumption-chart"),
    title: stringAttribute(),
    description: stringAttribute(),
    summary: stringAttribute(),
    data: arrayAttribute(ENERGY_DATA_FIELDS, {
      required: ["month", "solar", "eletrica", "gas"],
    }),
    yMax: numberAttribute(),
  },
  compatibility: {
    legacyReads: {
      items: "array",
    },
  },
  renderer: {
    module: "EnergyConsumptionGraphBlock.astro",
    preview: {
      label: "Graph energy consumption",
      attributes: {
        title: "Consumo de energia por fonte",
        description: "Compare a evolução mensal das principais fontes de energia.",
        summary: "Os valores apresentados são dados de demonstração do gráfico.",
        yMax: 100,
        data: [
          { month: "Jan", solar: 32, eletrica: 48, gas: 20 },
          { month: "Abr", solar: 41, eletrica: 44, gas: 15 },
          { month: "Jul", solar: 58, eletrica: 31, gas: 11 },
          { month: "Out", solar: 45, eletrica: 39, gas: 16 },
        ],
      },
    },
  },
  editor: {
    title: "Gráfico de consumo de energia",
    description:
      "Gráfico de linhas com o consumo mensal por fonte de energia, com título, descrição e resumo.",
    icon: "chart-line",
    experience: "preview",
  },
  documentation: {
    path: "charts/energy-consumption.md",
  },
});
