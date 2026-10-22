import assert from "node:assert/strict";
import { after, test } from "node:test";
import {
  CONTENT_COLLECTIONS,
  isFilteredByVisitor,
  listingPageHref,
  listingPagination,
  listingQuery,
  readCollection,
  readListingDisplay,
  readPerPage,
} from "../src/lib/content-collections.ts";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

after(async () => {
  await (await harnessPromise).close();
});

const biblioteca = { collection: "biblioteca", taxonomy: null, term: null, perPage: 12 };

test("settings fall back to the registration's defaults", () => {
  assert.equal(readCollection("eventos"), "eventos");
  assert.equal(readCollection("pages"), null);
  assert.equal(readCollection(undefined), null);
  assert.equal(readListingDisplay("thumbnail-grid"), "thumbnail-grid");
  assert.equal(readListingDisplay("masonry"), "list");
  assert.equal(readPerPage(6), 6);
  assert.equal(readPerPage("6"), 6);
  assert.equal(readPerPage(0), 12);
  assert.equal(readPerPage(1.5), 12);
  assert.equal(readPerPage(500), 48);
});

test("the address narrows the listing by search, the collection's taxonomies and page", () => {
  const params = new URLSearchParams(
    "q=+plástico+&categoria=legislacao&tematica=agua&setor=&pagina=3",
  );
  assert.deepEqual(listingQuery(biblioteca, params), {
    collection: "biblioteca",
    terms: { categoria_biblioteca: ["legislacao"], tematicas: ["agua"] },
    search: "plástico",
    page: 3,
    perPage: 12,
  });
});

test("parameters of another collection's taxonomies and bad pages are ignored", () => {
  const params = new URLSearchParams("tipo=webinar&pagina=-2");
  assert.deepEqual(listingQuery(biblioteca, params), {
    collection: "biblioteca",
    terms: {},
    page: 1,
    perPage: 12,
  });
  assert.deepEqual(listingQuery({ ...biblioteca, collection: "eventos" }, params).terms, {
    tipo_evento: ["webinar"],
  });
});

test("a term the editor fixed always applies and can't be widened", () => {
  const legislacao = { ...biblioteca, taxonomy: "categoria_biblioteca", term: "legislacao" };
  const query = listingQuery(legislacao, new URLSearchParams("categoria=publicacoes"));
  assert.deepEqual(query.terms, { categoria_biblioteca: ["legislacao"] });
  assert.equal(isFilteredByVisitor(legislacao, query), false);

  const filtered = listingQuery(legislacao, new URLSearchParams("setor=energia"));
  assert.deepEqual(filtered.terms, {
    categoria_biblioteca: ["legislacao"],
    setor_atividade: ["energia"],
  });
  assert.equal(isFilteredByVisitor(legislacao, filtered), true);
  assert.equal(
    isFilteredByVisitor(biblioteca, listingQuery(biblioteca, new URLSearchParams("q=x"))),
    true,
  );
});

test("page links keep the filters and drop the page parameter on the first page", () => {
  const url = new URL("https://nomia.bnq.pt/biblioteca/?q=agua&pagina=2");
  assert.equal(listingPageHref(url, 3), "/biblioteca/?q=agua&pagina=3");
  assert.equal(listingPageHref(url, 1), "/biblioteca/?q=agua");
  assert.equal(
    listingPageHref(new URL("https://nomia.bnq.pt/biblioteca/?pagina=2"), 1),
    "/biblioteca/",
  );

  const pagination = listingPagination(url, 2, 3);
  assert.deepEqual(
    pagination.pages.map(({ page, current }) => [page, current]),
    [
      [1, false],
      [2, true],
      [3, false],
    ],
  );
  assert.equal(pagination.previous, "/biblioteca/?q=agua");
  assert.equal(pagination.next, "/biblioteca/?q=agua&pagina=3");
});

test("every collection's taxonomy has its own parameter", () => {
  for (const [key, collection] of Object.entries(CONTENT_COLLECTIONS)) {
    const params = collection.taxonomies.map(({ param }) => param);
    assert.equal(new Set(params).size, params.length, key);
    assert.ok(!params.includes("q") && !params.includes("pagina"), key);
  }
});

const items = [
  { href: "/biblioteca/documento/lei-1/", title: "Lei 1", imageSrc: "/a.jpg", imageAlt: "A" },
  { href: "/biblioteca/documento/lei-2/", title: "Lei 2", imageSrc: null, imageAlt: "" },
];
const listing = "/src/components/content-lists/listing/NomiaContentListing.astro";

test("the list presentation links each item's title", async () => {
  const { document } = await (
    await harnessPromise
  ).renderComponent(listing, {
    display: "list",
    rows: items,
    empty: "none",
  });
  const links = [...document.querySelectorAll("[data-nomia-content-listing='list'] li a")];
  assert.deepEqual(
    links.map((link) => [link.getAttribute("href"), link.textContent.trim()]),
    [
      ["/biblioteca/documento/lei-1/", "Lei 1"],
      ["/biblioteca/documento/lei-2/", "Lei 2"],
    ],
  );
  assert.equal(document.querySelector("nav"), null);
});

test("the grids show the image when there is one, and the title", async () => {
  for (const display of ["thumbnail-grid", "titled-thumbnail-grid"]) {
    const { document } = await (
      await harnessPromise
    ).renderComponent(listing, {
      display,
      rows: items,
      empty: "none",
    });
    const cards = [...document.querySelectorAll("li a")];
    assert.equal(cards.length, 2, display);
    assert.equal(cards[0].querySelector("img")?.getAttribute("alt"), "A", display);
    assert.equal(cards[1].querySelector("img"), null, display);
    assert.match(cards[1].textContent, /Lei 2/, display);
  }
});

test("the page links mark the current page", async () => {
  const pagination = listingPagination(new URL("https://nomia.bnq.pt/eventos/?pagina=2"), 2, 3);
  const { document } = await (
    await harnessPromise
  ).renderComponent(listing, {
    display: "list",
    rows: items,
    empty: "none",
    ...pagination,
  });
  const nav = document.querySelector("nav[aria-label='Paginação']");
  assert.equal(nav.querySelector("[aria-current='page']").textContent.trim(), "2");
  assert.equal(nav.querySelector("a[rel='prev']").getAttribute("href"), "/eventos/");
  assert.equal(nav.querySelector("a[rel='next']").getAttribute("href"), "/eventos/?pagina=3");
});

test("an empty listing says why", async () => {
  const harness = await harnessPromise;
  const text = async (empty) =>
    (await harness.renderComponent(listing, { display: "list", rows: [], empty })).document
      .querySelector("p")
      .textContent.trim();
  assert.equal(await text("none"), "Ainda não há entradas publicadas.");
  assert.equal(await text("no-match"), "Nenhum conteúdo corresponde à pesquisa.");
  assert.equal(await text("unavailable"), "A lista não está disponível de momento.");
});

test("until the runtime lists collections, the Listing block renders its unavailable state", async () => {
  const { document } = await (
    await harnessPromise
  ).renderAt("https://nomia.bnq.pt/biblioteca/", {
    blockName: "getquick/content-listing",
    attrs: {},
    innerBlocks: [],
    innerHTML: "",
    innerContent: [],
  });
  assert.equal(
    document.querySelector("[data-nomia-content-listing='list'] p")?.textContent.trim(),
    "A lista não está disponível de momento.",
  );
});

test("the Filters block is a GET form on the Page, keeping the visitor's search", async () => {
  const { document } = await (
    await harnessPromise
  ).renderAt("https://nomia.bnq.pt/biblioteca/legislacao/?q=agua&pagina=2", {
    blockName: "getquick/content-filters",
    attrs: {},
    innerBlocks: [],
    innerHTML: "",
    innerContent: [],
  });
  const form = document.querySelector("form[role='search']");
  assert.equal(form.getAttribute("method"), "get");
  assert.equal(form.getAttribute("action"), "/biblioteca/legislacao/");
  assert.equal(form.querySelector("input[name='q']").getAttribute("value"), "agua");
  // Submitting starts from the first page.
  assert.equal(form.querySelector("[name='pagina']"), null);
  assert.equal(
    document.querySelector("a[href='/biblioteca/legislacao/']")?.textContent.trim(),
    "Limpar filtros",
  );
});

test("a Filters block with nothing to offer renders nothing", async () => {
  const { document } = await (
    await harnessPromise
  ).renderAt("https://nomia.bnq.pt/eventos/", {
    blockName: "getquick/content-filters",
    attrs: { collection: "eventos", showSearch: false },
    innerBlocks: [],
    innerHTML: "",
    innerContent: [],
  });
  assert.equal(document.querySelector("form"), null);
});
