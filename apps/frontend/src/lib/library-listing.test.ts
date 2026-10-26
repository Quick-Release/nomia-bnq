import { describe, expect, it } from "vite-plus/test";
import { libraryChoices, libraryPage, libraryRow, readLibraryRows } from "./library-listing";
import { nomiaExtension } from "./nomia-content";
import type { CollectionItem } from "@getquick/content";
import type { NomiaExtension } from "./nomia-content";
import type { ListingQuery } from "./content-collections";

const query: ListingQuery = {
  collection: "biblioteca",
  terms: { categoria_biblioteca: ["legislacao"] },
  page: 1,
  perPage: 1,
};
const extension = nomiaExtension.read({
  kind: "item",
  collection: "biblioteca",
  fields: {
    gqBioeconomiaLibraryYear: 2018,
    gqBioeconomiaLibraryPublisher: "Comissão Europeia",
    gqBioeconomiaLibraryFileUrl: "https://example.org/plastics.pdf",
    gqBioeconomiaLibraryPageUrl: "https://example.org/plastics/",
  },
});
const item: CollectionItem<NomiaExtension> = {
  uri: "/biblioteca/documento/plasticos/",
  title: "Estratégia Europeia para os Plásticos",
  date: "2026-10-01",
  modifiedAt: null,
  excerpt: "<p>A primeira estratégia &amp; ação.</p>",
  featuredImage: null,
  terms: { categoria_biblioteca: [{ slug: "legislacao", name: "Legislação" }] },
  extension,
};

describe("Biblioteca documents", () => {
  it("stores and restores both independent links and the publisher through the runtime extension", () => {
    expect(nomiaExtension.parse(JSON.parse(JSON.stringify(extension)))).toEqual(extension);
    expect(libraryRow(item)).toMatchObject({
      year: 2018,
      publisher: "Comissão Europeia",
      description: "A primeira estratégia & ação.",
      fileUrl: "https://example.org/plastics.pdf",
      pageUrl: "https://example.org/plastics/",
    });
    expect(nomiaExtension.fields.collections?.biblioteca).toContain("gqBioeconomiaLibraryPageUrl");
  });

  it("keeps older publications without metadata readable and rejects unsafe attachment links", () => {
    expect(libraryRow({ ...item, extension: undefined })).toMatchObject({
      year: null,
      publisher: "",
      fileUrl: "",
      pageUrl: "",
    });
    const unsafe = nomiaExtension.read({
      kind: "item",
      collection: "biblioteca",
      fields: {
        gqBioeconomiaLibraryYear: 2018.5,
        gqBioeconomiaLibraryFileUrl: "javascript:alert(1)",
        gqBioeconomiaLibraryPageUrl: "data:text/html,bad",
      },
    });
    expect(libraryRow({ ...item, extension: unsafe })).toMatchObject({
      year: null,
      fileUrl: "",
      pageUrl: "",
    });
  });

  it("reads every store page before filtering, builds scoped facets, and paginates matches", async () => {
    const calls: ListingQuery[] = [];
    const rows = await readLibraryRows(query, async (request) => {
      calls.push(request);
      return {
        kind: "found",
        items: [
          {
            ...item,
            title: request.page === 1 ? "Outro documento" : item.title,
            extension: request.page === 1 ? undefined : extension,
          },
        ],
        total: 2,
        page: request.page,
        pages: 2,
      };
    });
    expect(calls.map((call) => call.page)).toEqual([1, 2]);
    expect(
      calls.every(
        (call) => call.perPage === 100 && call.terms.categoria_biblioteca?.[0] === "legislacao",
      ),
    ).toBe(true);
    const params = new URLSearchParams({ ano: "2018", fonte: "Comissão Europeia" });
    const page = libraryPage(rows!, { ...query, search: "estrategia", page: 99 }, params);
    expect(page.total).toBe(1);
    expect(page.page).toBe(1);
    expect(page.items[0]?.title).toBe(item.title);
    expect(libraryChoices(rows!, params)[0]?.options).toEqual([
      { slug: "2018", name: "2018", count: 1 },
    ]);
    expect(libraryPage(rows!, query, new URLSearchParams({ ano: "2019" })).total).toBe(0);
    expect(libraryPage(rows!, query, new URLSearchParams({ ano: "null" })).total).toBe(0);
    expect(libraryPage(rows!, query, new URLSearchParams({ fonte: "Outra fonte" })).total).toBe(0);
  });

  it("does not serve partial cards or facets if a later store page fails", async () => {
    const rows = await readLibraryRows(query, async (request) =>
      request.page === 1
        ? { kind: "found", items: [item], total: 2, page: 1, pages: 2 }
        : { kind: "unavailable", failure: { reason: "not-ready", message: "Store unavailable" } },
    );
    expect(rows).toBeNull();
  });
});
