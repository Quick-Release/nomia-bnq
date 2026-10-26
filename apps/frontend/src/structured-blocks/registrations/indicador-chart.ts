import { defineStructuredBlock, numberAttribute, stringAttribute } from "../define.ts";

/**
 * One Indicador's chart, read from the publication store when the page is
 * visited. It stores which Indicador to draw, never its values: the page
 * shows the Indicador's data as published now. Editors add one block per
 * Indicador, in the order the page needs.
 */
export default defineStructuredBlock({
  identity: {
    blockName: "getquick/indicador-chart",
    catalogId: "indicador-chart",
    schemaVersion: 1,
    order: 43,
  },
  lifecycle: { status: "active", inserter: true },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("indicador-chart"),
    /** The Indicador's post ID. */
    indicadorId: numberAttribute(),
    /** A Temáticas term slug narrowing the editor's list of Indicadores; the frontend ignores it. */
    tematica: stringAttribute(),
  },
  renderer: {
    module: "IndicadorChartBlock.astro",
    preview: { label: "Indicador chart", attributes: { indicadorId: 702 } },
  },
  editor: {
    title: "Gráfico de indicador",
    description: "Mostra o gráfico de um indicador publicado, com os valores e a fonte atuais.",
    icon: "chart-bar",
    keywords: ["nomia", "indicador", "indicadores", "gráfico", "chart"],
    experience: "preview",
    bespoke: true,
  },
  documentation: { path: "sections/indicador-chart.md" },
});
