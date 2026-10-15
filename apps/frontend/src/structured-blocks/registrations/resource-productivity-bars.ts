import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const PRODUCTIVITY_POINT_FIELDS = {
  year: numberAttribute(),
  label: stringAttribute(),
  value: numberAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/resource-productivity-bars",
    catalogId: "resource-productivity-bars",
    schemaVersion: 1,
    order: 33,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("resource-productivity-bars"),
    title: stringAttribute(),
    badge: stringAttribute(),
    intro: stringAttribute(),
    points: arrayAttribute(PRODUCTIVITY_POINT_FIELDS, {
      required: ["year", "value"],
    }),
    yMax: numberAttribute(),
    metricLabel: stringAttribute(),
    periodLabel: stringAttribute(),
    scopeLabel: stringAttribute(),
  },
  compatibility: {
    legacyReads: {
      items: "array",
    },
  },
  renderer: {
    module: "ResourceProductivityBarsGraphBlock.astro",
    preview: {
      label: "Graph resource productivity bars",
      attributes: {
        title: "Produtividade dos recursos",
        badge: "2020–2023",
        intro: "A evolução da produtividade dos recursos em Portugal.",
        metricLabel: "€/kg",
        periodLabel: "Anual",
        scopeLabel: "Portugal",
        yMax: 2,
        points: [
          { year: 2020, label: "2020", value: 1.1 },
          { year: 2021, label: "2021", value: 1.25 },
          { year: 2022, label: "2022", value: 1.38 },
          { year: 2023, label: "2023", value: 1.41 },
        ],
      },
    },
  },
  editor: {
    title: "Barras de produtividade dos recursos",
    description:
      "Gráfico de barras anual da produtividade dos recursos, com título, etiqueta, introdução e filtros.",
    icon: "chart-bar",
    experience: "preview",
  },
  documentation: {
    path: "charts/resource-productivity-bars.md",
  },
});
