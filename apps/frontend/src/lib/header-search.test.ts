import { describe, expect, it } from "vite-plus/test";
import { searchFormTarget } from "./header-search";
import { siteSearch, siteSearchQuery } from "./site-search";

describe("header search destinations", () => {
  it("preserves archive filters but resets the previous query and pagination", () => {
    expect(
      searchFormTarget(
        "/biblioteca/?categoria=guias&q=old&pagina=9&tematica=a&tematica=b#top",
        "https://nomia.test",
      ),
    ).toEqual({
      action: "/biblioteca/",
      fields: [
        ["categoria", "guias"],
        ["tematica", "a"],
        ["tematica", "b"],
      ],
    });
  });
  it("allows web forms and rejects telephone, email and script destinations", () => {
    for (const href of [
      "",
      "#section",
      "tel:+351123",
      "mailto:a@example.com",
      "javascript:alert(1)",
    ]) {
      expect(searchFormTarget(href, "https://nomia.test")).toBeNull();
    }
    expect(
      searchFormTarget("https://search.example.com/results/?scope=all", "https://nomia.test"),
    ).toEqual({ action: "https://search.example.com/results/", fields: [["scope", "all"]] });
  });
});

describe("Nomia search page adapter", () => {
  it("normalizes visitor input and bounds the keyword", () => {
    expect(siteSearchQuery(new URLSearchParams("q=++energia++&pagina=-1"))).toEqual({
      search: "energia",
      page: 1,
      perPage: 12,
    });
    expect(
      siteSearchQuery(new URLSearchParams({ q: "a".repeat(300), pagina: "Infinity" })).search,
    ).toHaveLength(200);
  });
  it("passes the agreed query to the runtime and serves its published results", async () => {
    const query = { search: "água", page: 2, perPage: 12, language: "pt" };
    const found = {
      kind: "found",
      content: {
        items: [{ title: "Água", uri: "/agua/", excerpt: "Recurso" }],
        total: 13,
        page: 2,
        perPage: 12,
        totalPages: 2,
      },
    } as const;
    const runtime = {
      async search(received: unknown) {
        expect(received).toEqual(query);
        return found;
      },
    };
    expect(await siteSearch(runtime, query)).toEqual(found);
  });
  it("reports old runtimes and unavailable stores without a WordPress fallback", async () => {
    const query = { search: "energia", page: 1, perPage: 12 };
    const runtime = {
      wordpress: {
        getPublishedEntries() {
          throw new Error("CMS must not be read");
        },
      },
    };
    expect(await siteSearch(runtime, query)).toEqual({ kind: "unavailable" });
    expect(
      await siteSearch(
        {
          search: async () => ({
            kind: "unavailable",
            failure: { reason: "store", message: "offline" },
          }),
        },
        query,
      ),
    ).toMatchObject({ kind: "unavailable" });
  });
});
