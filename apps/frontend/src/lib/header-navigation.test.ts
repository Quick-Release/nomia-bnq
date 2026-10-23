import { describe, expect, it } from "vite-plus/test";
import { headerNavigationArea, headerNavigationTree } from "./header-navigation";

const origins = ["https://cms.example.com", "https://example.com"];

describe("headerNavigationTree", () => {
  it("nests items under their parents, in menu order", () => {
    const tree = headerNavigationTree(
      [
        {
          id: 1,
          parentId: 0,
          label: "Bioeconomia",
          url: "https://example.com/bioeconomia/",
          target: "",
        },
        {
          id: 2,
          parentId: 1,
          label: "Barómetro",
          url: "https://cms.example.com/barometro/?a=1#b",
          target: "",
        },
        {
          id: 3,
          parentId: 0,
          label: "Parceiro",
          url: "https://partner.example.org/",
          target: "_blank",
        },
      ],
      origins,
    );

    expect(tree).toEqual([
      {
        id: "1",
        label: "Bioeconomia",
        href: "/bioeconomia/",
        target: null,
        children: [
          { id: "2", label: "Barómetro", href: "/barometro/?a=1#b", target: null, children: [] },
        ],
      },
      {
        id: "3",
        label: "Parceiro",
        href: "https://partner.example.org/",
        target: "_blank",
        children: [],
      },
    ]);
  });

  it("shows an item whose parent is missing at the top level", () => {
    const tree = headerNavigationTree(
      [{ id: 2, parentId: 9, label: "Órfão", url: "/orfao/" }],
      origins,
    );

    expect(tree.map((item) => item.label)).toEqual(["Órfão"]);
  });

  it("drops unlabeled items and links a browser must not follow", () => {
    const tree = headerNavigationTree(
      [
        { id: 1, parentId: 0, label: "  ", url: "/vazio/" },
        { id: 2, parentId: 0, label: "Script", url: "javascript:alert(1)" },
        "not an item",
      ],
      origins,
    );

    expect(tree).toEqual([{ id: "2", label: "Script", href: "", target: null, children: [] }]);
  });

  it("is empty without a menu", () => {
    expect(headerNavigationTree(undefined, origins)).toEqual([]);
  });

  it("keeps a placeholder item linkless, rather than linking it home", () => {
    const [item] = headerNavigationTree(
      [{ id: 1, parentId: 0, label: "Economia Circular", url: "#" }],
      origins,
    );

    expect(item.href).toBe("");
  });
});

describe("headerNavigationArea", () => {
  const menu = (url: string, ...children: string[]) =>
    headerNavigationTree(
      [
        { id: 1, parentId: 0, label: "Área", url },
        ...children.map((child, index) => ({
          id: index + 2,
          parentId: 1,
          label: child,
          url: child,
        })),
      ],
      origins,
    )[0];

  it("follows the item's own link", () => {
    expect(headerNavigationArea(menu("/partilhar/"), origins)).toBe("partilhar");
  });

  it("gives a placeholder the area its subitems share", () => {
    const item = menu(
      "#",
      "/economia-circular/visao-geral/",
      "https://example.org/externo/",
      "/economia-circular/paec-2030/",
    );

    expect(headerNavigationArea(item, origins)).toBe("economia-circular");
  });

  it("gives a placeholder no area when its subitems differ or have none", () => {
    expect(headerNavigationArea(menu("#", "/barometro/", "/biblioteca/"), origins)).toBeNull();
    expect(headerNavigationArea(menu("#"), origins)).toBeNull();
  });
});
