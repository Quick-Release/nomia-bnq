import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const RESULT_FIELDS = {
  year: stringAttribute(),
  value: stringAttribute(),
  unit: stringAttribute(),
  description: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
  nodeId: stringAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/cta-results",
    catalogId: "cta-results",
    schemaVersion: 1,
    order: 8,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("cta-results"),
    results: arrayAttribute(RESULT_FIELDS, {
      required: ["year", "value", "unit", "description", "href"],
    }),
  },
  compatibility: {
    legacyReads: {
      items: "array",
    },
  },
  renderer: {
    module: "BarometroResultsBlock.astro",
    preview: {
      label: "Barómetro results",
      attributes: {
        results: [
          {
            year: "2024",
            value: "87,13",
            unit: "%",
            description: "Indicador de teste",
            href: "/indicadores/",
          },
        ],
      },
    },
  },
  editor: {
    title: "Chamada para resultados",
    description:
      "Resultados do Barómetro em destaque, cada um com ano, valor, unidade, descrição e ligação.",
    icon: "analytics",
    experience: "preview",
    bespoke: true,
  },
  documentation: {
    path: "sections/landing/cta-results.md",
  },
});
