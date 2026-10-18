import {
  arrayAttribute,
  arrayOfAttribute,
  defineStructuredBlock,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const PRODUCTIVITY_POINT_FIELDS = {
  year: numberAttribute(),
  value: numberAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/resource-productivity-chart",
    catalogId: "resource-productivity-chart",
    schemaVersion: 1,
    order: 34,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("resource-productivity-chart"),
    title: stringAttribute(),
    filterLabels: arrayOfAttribute(stringAttribute()),
    points: arrayAttribute(PRODUCTIVITY_POINT_FIELDS, {
      required: ["year", "value"],
    }),
    yMax: numberAttribute(),
    locale: stringAttribute(),
  },
  renderer: {
    module: "ResourceProductivityGraphBlock.astro",
    preview: {
      label: "Graph resource productivity",
      attributes: {
        title: "Produtividade dos recursos",
        filterLabels: ["Portugal", "União Europeia"],
        locale: "pt-PT",
        points: [
          {
            year: 2020,
            value: 1.1,
          },
          {
            year: 2021,
            value: 1.25,
          },
          {
            year: 2022,
            value: 1.38,
          },
          {
            year: 2023,
            value: 1.41,
          },
        ],
      },
    },
  },
  editor: {
    title: "Gráfico de produtividade dos recursos",
    description:
      "Gráfico de barras simples da produtividade dos recursos por ano, com título e etiquetas de filtro.",
    icon: "chart-area",
    experience: "preview",
  },
  documentation: {
    path: "charts/resource-productivity.md",
  },
});
