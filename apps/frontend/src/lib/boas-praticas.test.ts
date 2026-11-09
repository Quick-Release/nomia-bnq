import { describe, expect, it } from "vite-plus/test";
import type { CollectionItem } from "@getquick/content";
import { boaPratica, publishedBoasPraticas } from "./boas-praticas";
import type { listCollection } from "./content-listing";
import type { NomiaExtension } from "./nomia-content";

const item = (
  overrides: Partial<CollectionItem<NomiaExtension>> = {},
): CollectionItem<NomiaExtension> => ({
  uri: "/biblioteca/boa-pratica/",
  title: " Boa prática ",
  date: "2026-11-01T10:00:00",
  modifiedAt: null,
  excerpt: "<p>Resumo &amp; mais.</p>",
  featuredImage: null,
  terms: {
    regiao_nuts: [
      { slug: "pt11d", name: "Douro" },
      { slug: "unknown", name: "Outra" },
    ],
  },
  ...overrides,
});

describe("boaPratica", () => {
  it("keeps its link, plain-text excerpt, and regions with their parents", () => {
    expect(boaPratica(item())).toEqual({
      href: "/biblioteca/boa-pratica/",
      title: "Boa prática",
      excerpt: "Resumo & mais.",
      regions: ["PT", "PT1", "PT11", "PT11D"],
    });
  });

  it("has no regions when it isn't tagged", () => {
    expect(boaPratica(item({ terms: {} })).regions).toEqual([]);
  });
});

describe("publishedBoasPraticas", () => {
  it("lists every page of the Boas práticas category, once per request", async () => {
    const queries: unknown[] = [];
    const list = (async (query) => {
      queries.push(query);
      return {
        kind: "found",
        items: [item({ uri: `/p${query.page}/` })],
        total: 2,
        page: query.page ?? 1,
        pages: 2,
      };
    }) as typeof listCollection;
    const request = new Request("https://example.test/");

    const first = await publishedBoasPraticas(request, list);
    const second = await publishedBoasPraticas(request, list);

    expect(second).toBe(first);
    expect(queries).toEqual([
      {
        collection: "biblioteca",
        terms: { categoria_biblioteca: ["boas-praticas"] },
        page: 1,
        perPage: 100,
      },
      {
        collection: "biblioteca",
        terms: { categoria_biblioteca: ["boas-praticas"] },
        page: 2,
        perPage: 100,
      },
    ]);
    expect(first?.items.map((entry) => entry.href)).toEqual(["/p1/", "/p2/"]);
  });

  it("keeps the entries tagged Internacional off the map, as listing rows", async () => {
    const list = (async () => ({
      kind: "found",
      items: [
        item({ uri: "/pt/" }),
        item({
          uri: "/eu/",
          title: "Towards circular plastics in Europe",
          terms: {
            regiao_nuts: [{ slug: "internacional", name: "Internacional" }],
          },
        }),
      ],
      total: 2,
      page: 1,
      pages: 1,
    })) as typeof listCollection;

    const answer = await publishedBoasPraticas(new Request("https://example.test/"), list);

    expect(answer?.items.map((entry) => entry.href)).toEqual(["/pt/"]);
    expect(answer?.international).toMatchObject([
      { href: "/eu/", title: "Towards circular plastics in Europe" },
    ]);
  });

  it("is null when the store can't be read", async () => {
    const list = (async () => ({
      kind: "unavailable",
      failure: { reason: "not-ready", message: "" },
    })) as unknown as typeof listCollection;
    expect(await publishedBoasPraticas(new Request("https://example.test/"), list)).toBeNull();
  });
});
