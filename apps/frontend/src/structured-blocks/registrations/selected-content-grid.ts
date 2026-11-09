import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/selected-content-grid",
    catalogId: "selected-content-grid",
    schemaVersion: 1,
    order: 44,
  },
  lifecycle: { status: "active", inserter: true },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("selected-content-grid"),
    items: arrayAttribute({
      postId: numberAttribute(),
      postType: stringAttribute(),
      uri: stringAttribute(),
      title: stringAttribute(),
    }),
  },
  renderer: {
    module: "SelectedContentGridBlock.astro",
    preview: { label: "Destaques selecionados", attributes: { items: [] } },
  },
  editor: {
    title: "Grelha de destaques",
    description: "Um destaque principal e quatro conteúdos selecionados.",
    icon: "screenoptions",
    experience: "preview",
    bespoke: true,
  },
  documentation: { path: "content-lists/selected-content-grid.md" },
});
