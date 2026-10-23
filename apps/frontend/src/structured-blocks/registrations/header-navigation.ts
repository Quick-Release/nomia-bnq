import {
  arrayAttribute,
  defineStructuredBlock,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

/**
 * Navigation bar: a WordPress menu the editor picks, drawn as bioeconomia.pt's
 * header navigation (`NomiaHeader.astro`). The editor stores the menu and styling options;
 * `menuItems` is never saved by the editor, gq-bioeconomia's `wpBlocksJson`
 * fills it from the menu when the page is read, so the stored page carries the
 * menu as it was at its last refresh.
 */
export default defineStructuredBlock({
  identity: {
    blockName: "getquick/header-navigation",
    catalogId: "header-navigation",
    schemaVersion: 1,
    order: 38,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("header-navigation"),
    menuId: numberAttribute(0),
    hoverBackgroundColor: stringAttribute(),
    hoverTextColor: stringAttribute(),
    submenuIconId: numberAttribute(),
    submenuIconUrl: stringAttribute("", { ui: { kind: "media" } }),
    menuItems: arrayAttribute({
      id: numberAttribute(),
      parentId: numberAttribute(),
      label: stringAttribute(),
      url: stringAttribute("", { ui: { kind: "url" } }),
      target: stringAttribute(),
    }),
  },
  renderer: {
    module: "HeaderNavigationBlock.astro",
    preview: {
      label: "Header navigation",
      attributes: {
        menuId: 1,
        menuItems: [
          { id: 1, parentId: 0, label: "Bioeconomia", url: "/bioeconomia/", target: "" },
          {
            id: 2,
            parentId: 0,
            label: "Economia circular",
            url: "/economia-circular/",
            target: "",
          },
          { id: 3, parentId: 0, label: "Indicadores", url: "/indicadores/", target: "" },
          { id: 4, parentId: 3, label: "Barómetro", url: "/indicadores/barometro/", target: "" },
          { id: 5, parentId: 0, label: "Notícias", url: "/noticias/", target: "" },
        ],
      },
    },
  },
  editor: {
    title: "nomia_navigation",
    description: "Barra de navegação com um menu do WordPress, no estilo do cabeçalho Nomia.",
    icon: "menu",
    keywords: ["nomia", "navegação", "menu", "cabeçalho", "navigation", "header"],
    experience: "inline-fields",
    bespoke: true,
  },
  documentation: {
    path: "sections/header-navigation.md",
  },
});
