import { defineStructuredBlock, numberAttribute, stringAttribute } from "../define.ts";

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/header-search",
    catalogId: "header-search",
    schemaVersion: 1,
    order: 42,
  },
  lifecycle: { status: "active", inserter: true },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("header-search"),
    label: stringAttribute("Pesquisar"),
    placeholder: stringAttribute("Palavra-chave…"),
    submitLabel: stringAttribute("Pesquisar"),
    closeLabel: stringAttribute("Fechar pesquisa"),
    resultsHref: stringAttribute("/pesquisa/", { ui: { kind: "url" } }),
    iconId: numberAttribute(),
    iconUrl: stringAttribute("", { ui: { kind: "media" } }),
  },
  renderer: {
    module: "HeaderSearchBlock.astro",
    preview: { label: "Header search", attributes: { resultsHref: "/pesquisa/" } },
  },
  editor: {
    title: "Pesquisa do cabeçalho",
    description:
      "Ícone de pesquisa que abre um formulário para pesquisar numa página de resultados.",
    icon: "search",
    keywords: ["nomia", "pesquisa", "search", "header"],
    experience: "inline-fields",
    bespoke: true,
  },
  documentation: { path: "sections/header-search.md" },
});
