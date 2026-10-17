import {
  arrayAttribute,
  defineStructuredBlock,
  numberAttribute,
  objectAttribute,
  stringAttribute,
} from "../define.ts";

const URBAN_WASTE_REGION_FIELDS = {
  id: stringAttribute(),
  label: stringAttribute(),
  values: objectAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/urban-waste-geo-chart",
    catalogId: "urban-waste-geo-chart",
    schemaVersion: 1,
    order: 32,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("urban-waste-geo-chart"),
    title: stringAttribute(),
    badge: stringAttribute(),
    intro: stringAttribute(),
    summary: stringAttribute(),
    comparisonLabel: stringAttribute(),
    metricLabel: stringAttribute(),
    periodLabel: stringAttribute(),
    scopeLabel: stringAttribute(),
    regions: arrayAttribute(URBAN_WASTE_REGION_FIELDS, {
      required: ["id", "label", "values"],
    }),
  },
  renderer: {
    module: "UrbanWasteGeoGraphBlock.astro",
    preview: {
      label: "Graph urban waste geo",
      attributes: {
        title: "Resíduos urbanos por habitante",
        badge: "2021–2024",
        intro: "Comparação ilustrativa por localização geográfica.",
        summary: "Valores de demonstração para o gráfico.",
        comparisonLabel: "Localização vs resíduos urbanos",
        metricLabel: "kg/habitante",
        periodLabel: "Anual",
        scopeLabel: "Portugal",
        regions: [
          {
            id: "pt",
            label: "Portugal",
            values: { "2021": 349, "2022": 735, "2023": 876, "2024": 787 },
          },
          {
            id: "cont",
            label: "Continente",
            values: { "2021": 680, "2022": 956, "2023": 735, "2024": 720 },
          },
          {
            id: "norte",
            label: "Norte",
            values: { "2021": 735, "2022": 1000, "2023": 959, "2024": 915 },
          },
        ],
      },
    },
  },
  editor: {
    title: "Gráfico geográfico de resíduos urbanos",
    description:
      "Barras horizontais de resíduos urbanos por habitante, por região e ano, com anos filtráveis.",
    icon: "admin-site-alt3",
    experience: "preview",
  },
  documentation: {
    path: "charts/urban-waste-geo.md",
  },
});
