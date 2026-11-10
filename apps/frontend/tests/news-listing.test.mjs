import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();
after(async () => (await harnessPromise).close());
const url = new URL("https://bioeconomia.apambiente.pt/noticias/");
const component = "/src/components/content-lists/news/NewsListing.astro";
const result = (overrides = {}) => ({
  kind: "found",
  content: {
    items: [],
    total: 0,
    page: 1,
    perPage: 12,
    totalPages: 0,
    ...overrides,
  },
});
const newsItem = {
  uri: "/noticias/primeira/",
  title: "Uma notícia <nova>",
  excerpt: "",
  language: "pt",
};

test("the archive asks the runtime for standard posts in the current language", async () => {
  const { readNews } = await (await harnessPromise).loadModule("/src/lib/news-listing.ts");
  const answer = result();
  let received;
  assert.equal(
    await readNews(
      {
        listPosts: async (query) => {
          received = query;
          return answer;
        },
      },
      new URL(`${url}?pagina=2`),
      "pt",
    ),
    answer,
  );
  assert.deepEqual(received, { page: 2, perPage: 12, language: "pt" });
  for (const page of ["0", "-1", "abc", "1.5", "9007199254740992"]) {
    await readNews(
      {
        listPosts: async (query) => {
          assert.equal(query.page, 1);
          return answer;
        },
      },
      new URL(`${url}?pagina=${page}`),
      "pt",
    );
  }
});

test("only a confirmed zero renders the exact coming-soon message", async () => {
  const { document } = await (
    await harnessPromise
  ).renderComponent(component, { news: result(), url });
  assert.equal(
    document.querySelector("[data-nomia-news-empty]").textContent.trim(),
    "Brevemente disponível",
  );
  assert.equal(document.querySelector("nav"), null);
});

test("published news replaces the placeholder and offers pagination", async () => {
  const { document } = await (
    await harnessPromise
  ).renderComponent(component, {
    news: result({ items: [newsItem], total: 13, totalPages: 2 }),
    url,
  });
  assert.equal(document.querySelector("[data-nomia-news-empty]"), null);
  const link = document.querySelector("li a");
  assert.equal(link.textContent.trim(), newsItem.title);
  assert.equal(link.getAttribute("href"), newsItem.uri);
  assert.equal(link.querySelector("nova"), null);
  assert.equal(document.querySelector("a[rel='next']").getAttribute("href"), "/noticias/?pagina=2");
});

test("an empty page of a nonempty archive never claims news is coming soon", async () => {
  const harness = await harnessPromise;
  const { newsPresentation } = await harness.loadModule("/src/lib/news-listing.ts");
  const news = result({ total: 1, totalPages: 1, page: 2 });
  assert.equal(newsPresentation(news, url).state, "published");
  const { document } = await harness.renderComponent(component, { news, url });
  assert.equal(document.querySelector("[data-nomia-news-empty]"), null);
});

test("unavailable and old runtimes return 503 semantics without a zero-news claim", async () => {
  const harness = await harnessPromise;
  const { readNews, newsPresentation } = await harness.loadModule("/src/lib/news-listing.ts");
  assert.deepEqual(await readNews({}, url, "pt"), { kind: "unavailable" });
  const news = await readNews(
    { listPosts: async () => ({ kind: "unavailable", failure: { reason: "not-ready" } }) },
    url,
    "pt",
  );
  assert.equal(newsPresentation(news, url).status, 503);
  const { document } = await harness.renderComponent(component, { news, url });
  assert.equal(document.querySelector("[data-nomia-news-empty]"), null);
  assert.match(document.body.textContent, /A lista não está disponível/);
});
