import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test, vi } from "vite-plus/test";
import Grid from "./components/wp-blocks/blocks/SelectedContentGridBlock.astro";
const { publishedEntry } = vi.hoisted(() => ({ publishedEntry: vi.fn() }));
vi.mock("./lib/content", () => ({ content: () => ({ publishedEntry }) }));

test("renders one principal and four secondary published cards in selection order", async () => {
  publishedEntry.mockImplementation(async (uri: string) => ({
    kind: "found",
    content: {
      entry: {
        title: `Title ${uri}`,
        uri,
        excerpt: "<p>Current excerpt</p>",
        content: "",
        featuredImage: { sourceUrl: "/image.jpg", altText: "Photo" },
      },
    },
  }));
  const container = await AstroContainer.create();
  const html = await container.renderToString(Grid, {
    props: {
      block: {
        blockName: "getquick/selected-content-grid",
        attrs: {
          items: ["post", "videos", "eventos", "oportunidades", "ferramentas"].map(
            (postType, i) => ({ postId: i + 1, postType, uri: `/item-${i}/` }),
          ),
        },
        innerBlocks: [],
        innerHTML: "",
        innerContent: [],
      },
    },
  });
  expect(html.match(/<article/g)).toHaveLength(5);
  expect(html.match(/<img/g)).toHaveLength(5);
  expect(html.match(/Current excerpt/g)).toHaveLength(5);
  expect(html.indexOf("Title /item-0/")).toBeLessThan(html.indexOf("Title /item-1/"));
});

test("oportunidades, plataformas and bases de dados cards show only the authored excerpt", async () => {
  publishedEntry.mockImplementation(async (uri: string) => ({
    kind: "found",
    content: {
      entry: {
        title: `Title ${uri}`,
        uri,
        excerpt: uri === "/bases-de-dados/escrita/" ? "<p>Resumo escrito</p>" : "",
        content: "<p>Corpo com https://example.com</p>",
        featuredImage: null,
      },
    },
  }));
  const container = await AstroContainer.create();
  const html = await container.renderToString(Grid, {
    props: {
      block: {
        blockName: "getquick/selected-content-grid",
        attrs: {
          items: [
            { postId: 1, postType: "plataformas", uri: "/plataformas/sem-resumo/" },
            { postId: 2, postType: "bases_de_dados", uri: "/bases-de-dados/escrita/" },
            {
              postId: 3,
              postType: "oportunidades",
              uri: "/oportunidades/oportunidade/sem-resumo/",
            },
            { postId: 4, postType: "eventos", uri: "/eventos/sem-resumo/" },
          ],
        },
        innerBlocks: [],
        innerHTML: "",
        innerContent: [],
      },
    },
  });
  expect(html.match(/<article/g)).toHaveLength(4);
  expect(html).toContain("Resumo escrito");
  expect(html.match(/Corpo com/g)).toHaveLength(1);
});

test("omits withdrawn, duplicate and disallowed selections", async () => {
  publishedEntry.mockClear();
  publishedEntry.mockResolvedValue({ kind: "missing" });
  const container = await AstroContainer.create();
  const html = await container.renderToString(Grid, {
    props: {
      block: {
        blockName: "getquick/selected-content-grid",
        attrs: {
          items: [
            { postId: 1, postType: "post", uri: "/withdrawn/" },
            { postId: 1, postType: "post", uri: "/duplicate/" },
            { postId: 2, postType: "page", uri: "/page/" },
            { postId: 3, postType: "videos", uri: "//external.example/" },
          ],
        },
        innerBlocks: [],
        innerHTML: "",
        innerContent: [],
      },
    },
  });
  expect(html).not.toContain("<article");
  expect(publishedEntry).toHaveBeenCalledTimes(1);
});
