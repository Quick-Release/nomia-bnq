// The public routes, rendered through Astro's Container API against a stubbed
// WordPress: the page a visitor gets, and its HTTP status, when content is
// published, confirmed missing, or WordPress fails. Delivery itself (the
// publication store, events, refresh, retries) is @getquick/content's and is
// tested there; these test what this Site composes from what it delivers:
// the pages, their words, metadata and chrome.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import Entry from "./pages/[...slug].astro";
import Home from "./pages/index.astro";
import {
  chrome,
  data,
  httpError,
  queries,
  stubWordPress,
  timeout,
  tokens,
} from "./test/wordpress-stub";

// The monolingual Site this file describes: the site's gq.ops.json without
// wordpress.languages.
vi.mock("../../../gq.ops.json", async (importOriginal) => {
  const { default: ops } = await importOriginal<{
    default: { wordpress: { languages?: unknown } };
  }>();
  const { languages: _languages, ...wordpress } = ops.wordpress;
  return { default: { ...ops, wordpress } };
});

const about = {
  id: "64",
  title: "About",
  content: "<p>We make things.</p>",
  uri: "/about/",
  status: "publish",
  isRestricted: false,
  featuredImage: null,
};

const frontPage = {
  __typename: "Page",
  isFrontPage: true,
  title: "Home",
  content: "<h1>Welcome to Acme</h1>",
};

async function render(path: string) {
  const container = await AstroContainer.create();
  const page = path === "/" ? Home : Entry;
  const slug = path.replace(/^\/|\/$/g, "");
  const response = await container.renderToResponse(page, {
    request: new Request(new URL(path, "https://acme.example")),
    params: path === "/" ? {} : { slug },
    partial: false,
  });
  return { status: response.status, html: await response.text() };
}

let consoleError: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  // A production build: local development's placeholder is the exception.
  vi.stubEnv("DEV", false);
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("entries read live in local development", () => {
  beforeEach(() => {
    vi.stubEnv("DEV", true);
  });

  test("a published entry renders with the site chrome", async () => {
    stubWordPress({ entry: () => data({ postBy: null, pageBy: about, designTokens: tokens }) });

    const { status, html } = await render("/about/");

    expect(status).toBe(200);
    expect(html).toContain("<title>About — Nomia</title>");
    expect(html).toContain("<p>We make things.</p>");
    expect(html).toMatch(/<a href="\/about\/"[^>]*>About us<\/a>/);
    expect(html).toContain('src="https://media.example/logo.svg"');
  });

  test("the header GQ Design selects replaces the site's own, Nomia's navigation included", async () => {
    // As GQ Design serves Nomia's header pattern: the bar (a container) with
    // the Site Logo and the menu-backed navigation, its menu's items and the
    // thematic palette.
    const header = {
      title: "Header navigation",
      blocksJson: JSON.stringify([
        {
          name: "getquick-design/container",
          attributes: { className: "nomia-header-bar" },
          content: null,
          children: [
            {
              name: "core/site-logo",
              attributes: {
                logo: {
                  url: "https://media.example/nomia.svg",
                  alt: "Nomia",
                  width: 160,
                  height: 40,
                },
              },
              content: null,
              children: [],
            },
            {
              name: "getquick/header-navigation",
              attributes: {
                menuId: 469,
                menuItems: [
                  { id: 1, parentId: 0, label: "Economia Circular", url: "#", target: "" },
                  {
                    id: 2,
                    parentId: 1,
                    label: "Visão geral",
                    url: "/economia-circular/visao-geral/",
                    target: "",
                  },
                  { id: 3, parentId: 0, label: "Partilhar", url: "/partilhar/", target: "" },
                ],
                thematicColors: [
                  { slug: "economia-circular", color: "#4bc2bf" },
                  { slug: "partilhar", color: "" },
                ],
              },
              content: null,
              children: [],
            },
          ],
        },
      ]),
    };
    stubWordPress({
      entry: () => data({ postBy: null, pageBy: about, designTokens: tokens }),
      chrome: () => data({ ...chrome, header }),
    });

    const { status, html } = await render("/about/");

    expect(status).toBe(200);
    expect(html).toContain("data-nomia-navigation");
    expect(html).toMatch(/<a [^>]*href="\/economia-circular\/visao-geral\/"[^>]*>\s*Visão geral/);
    expect(html).toMatch(/<a [^>]*href="\/partilhar\/"[^>]*>\s*Partilhar/);
    // The logo and the navigation share the bar.
    const headerDocument = new JSDOM(html).window.document;
    const headerBar = headerDocument.querySelector("header .nomia-header-bar");
    expect(headerBar?.querySelector(".wp-block-site-logo a")?.getAttribute("href")).toBe("/");
    expect(headerBar?.querySelector(".custom-logo")?.getAttribute("src")).toBe(
      "https://media.example/nomia.svg",
    );
    expect(headerBar?.querySelector("[data-nomia-navigation]")).not.toBeNull();
    // The palette reaches the navigation; a placeholder item takes the area
    // its subitems share, and toggles them instead of linking home.
    expect(html).toContain(
      "[data-nomia-navigation] { --nomia-tematica-economia-circular-background: #4bc2bf",
    );
    expect(html).toMatch(
      /<button[^>]*style="--nomia-area-background: var\(--nomia-tematica-economia-circular-background, transparent\)[^"]*"[^>]*type="button"[^>]*>\s*Economia Circular/,
    );
    // A link whose area has no published color draws no pill.
    expect(html).toContain(
      "--nomia-area-background: var(--nomia-tematica-partilhar-background, transparent)",
    );
    expect(html).not.toContain("--nomia-tematica-partilhar-background:");
    expect(html).not.toContain('class="site-header"');
    expect(html).not.toContain("About us");
  });

  test("header and footer patterns apply CMS palette colors outside the page body", async () => {
    const pattern = {
      title: "Orange region",
      blocksJson: JSON.stringify([
        {
          name: "getquick-design/container",
          attributes: { backgroundColor: "laranja-400" },
          content: null,
          children: [
            {
              name: "getquick/header-navigation",
              attributes: {
                menuId: 1,
                menuItems: [{ id: 1, parentId: 0, label: "Home", url: "/", target: "" }],
              },
              content: null,
              children: [],
            },
          ],
        },
      ]),
    };
    stubWordPress({
      entry: () => data({ postBy: null, pageBy: about, designTokens: tokens }),
      chrome: () => data({ ...chrome, header: pattern, footer: pattern }),
      design: () =>
        data({
          designTokens: {
            colors: [{ slug: "laranja-400", color: "#f7a600" }],
            spacingSizes: [],
          },
        }),
    });

    const { status, html } = await render("/about/");
    expect(status).toBe(200);
    expect(html).not.toMatch(/<main[^>]*class="[^"]*nomia-blocks/);
    for (const region of ["header", "footer"]) {
      const regionHtml = html.match(new RegExp(`<${region}\\b[^>]*>(.*?)</${region}>`, "s"))?.[1];
      const regionDocument = new JSDOM(regionHtml).window.document;
      expect(
        regionDocument.querySelector(
          ".nomia-pattern > .wp-block-getquick-design-container.has-laranja-400-background-color.has-background",
        ),
      ).not.toBeNull();
      const barClasses = regionHtml?.match(/class="(nomia-navigation-bar[^"]*)"/)?.[1].split(/\s+/);
      expect(barClasses).toBeDefined();
      expect(barClasses!.some((name) => name.startsWith("bg-"))).toBe(false);
    }
    expect(html).toContain(":root{--wp--preset--color--laranja-400:#f7a600}");
    expect(html).toContain(
      ".nomia-pattern .has-laranja-400-background-color{background-color:var(--wp--preset--color--laranja-400)}",
    );
  });

  test("the header grid retains neutral CMS columns and loads presentation CSS once", async () => {
    const container = (children: unknown[]) => ({
      name: "getquick-design/container",
      attributes: {},
      content: null,
      children,
    });
    const header = {
      title: "Header grid",
      blocksJson: JSON.stringify([
        {
          name: "getquick-design/grid",
          attributes: {
            presentation: {
              base: { gridColumns: "3" },
              md: { gridColumns: "2" },
              xl: { gridColumns: "1" },
            },
          },
          content: null,
          children: [
            container([
              {
                name: "core/site-logo",
                attributes: {
                  logo: {
                    url: "https://media.example/nomia.svg",
                    alt: "Nomia",
                    width: 160,
                    height: 40,
                  },
                },
                content: null,
                children: [],
              },
            ]),
            container([
              {
                name: "getquick/header-navigation",
                attributes: {
                  menuId: 1,
                  menuItems: [{ id: 1, parentId: 0, label: "Home", url: "/", target: "" }],
                },
                content: null,
                children: [],
              },
            ]),
          ],
        },
      ]),
    };
    stubWordPress({
      entry: () => data({ postBy: null, pageBy: about, designTokens: tokens }),
      chrome: () => data({ ...chrome, header }),
    });

    const { status, html } = await render("/about/");
    expect(status).toBe(200);
    const document = new JSDOM(html).window.document;
    const grid = document.querySelector("header .wp-block-getquick-design-grid");
    expect(grid?.querySelector(".wp-block-site-logo")).not.toBeNull();
    expect(grid?.querySelector("[data-nomia-navigation]")).not.toBeNull();
    const sheets = [...document.head.querySelectorAll("style")].filter((sheet) =>
      sheet.textContent.includes("--gqd-base-gridColumns"),
    );
    expect(sheets).toHaveLength(1);
  });

  test("an entry WordPress confirms isn't published is a 404", async () => {
    stubWordPress({ entry: () => data({ postBy: null, pageBy: null, designTokens: tokens }) });

    const { status, html } = await render("/gone/");

    expect(status).toBe(404);
    expect(html).toContain("Nothing here.");
    expect(consoleError).not.toHaveBeenCalled();
  });

  test("an entry request that times out is a 503, and isn't retried", async () => {
    const fetchMock = stubWordPress({ entry: timeout });

    const { status, html } = await render("/about/");

    expect(status).toBe(503);
    expect(html).toContain("Temporarily unavailable.");
    expect(html).not.toContain("Nothing here.");
    expect(queries(fetchMock, "EntryByUri")).toHaveLength(1);
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("/about/ is unavailable (timeout)"),
    );
  });

  test("a published entry is still served when the site chrome can't be read", async () => {
    stubWordPress({
      entry: () => data({ postBy: null, pageBy: about, designTokens: tokens }),
      chrome: () => httpError(500),
    });

    const { status, html } = await render("/about/");

    expect(status).toBe(200);
    expect(html).toContain("<p>We make things.</p>");
    expect(html).not.toContain("About us");
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("site chrome is unavailable (http)"),
    );
  });

  test("an optional featured image left empty doesn't fail an entry", async () => {
    stubWordPress({
      entry: () =>
        data({
          postBy: {
            ...about,
            featuredImage: { node: null },
            excerpt: null,
            date: "2026-09-30T10:00:00",
          },
          pageBy: null,
          designTokens: tokens,
        }),
    });

    const { status, html } = await render("/about/");

    expect(status).toBe(200);
    expect(html).toContain("September 30, 2026");
    expect(
      new JSDOM(html).window.document.querySelector(
        "img.featured-image, .wp-block-post-featured-image",
      ),
    ).toBeNull();
  });
});

test("a built Frontend without a publication store is a 503 for an entry, and reads no CMS", async () => {
  const fetchMock = stubWordPress({
    entry: () => data({ postBy: null, pageBy: about, designTokens: tokens }),
  });

  const { status, html } = await render("/about/");

  expect(status).toBe(503);
  expect(html).toContain("Temporarily unavailable.");
  expect(html).not.toContain("We make things.");
  expect(fetchMock).not.toHaveBeenCalled();
  expect(consoleError).toHaveBeenCalledWith(
    expect.stringContaining("entry /about/ can't be served (not-ready)"),
  );
});

test("a built Frontend without a publication store is a 503 for the front page, and reads no CMS", async () => {
  const fetchMock = stubWordPress({
    home: () =>
      data({
        generalSettings: { title: "Acme", description: "" },
        nodeByUri: frontPage,
        designTokens: tokens,
      }),
  });

  const { status, html } = await render("/");

  expect(status).toBe(503);
  expect(html).toContain("Temporarily unavailable.");
  expect(html).not.toContain("Welcome to Acme");
  expect(html).not.toContain("Content is on its way.");
  expect(fetchMock).not.toHaveBeenCalled();
  expect(consoleError).toHaveBeenCalledWith(
    expect.stringContaining("front page can't be served (not-ready)"),
  );
});

test("local development renders WordPress's front page live", async () => {
  vi.stubEnv("DEV", true);
  stubWordPress({
    home: () =>
      data({
        generalSettings: { title: "Acme", description: "Things" },
        nodeByUri: frontPage,
        designTokens: tokens,
      }),
  });

  const { status, html } = await render("/");

  expect(status).toBe(200);
  expect(html).toContain("<h1>Welcome to Acme</h1>");
  expect(html).toContain('<meta name="description" content="Things">');
  expect(html).toMatch(/<a href="\/about\/"[^>]*>About us<\/a>/);
});

test("local development without a CMS still shows the friendly placeholder", async () => {
  vi.stubEnv("DEV", true);
  stubWordPress({
    home: () => Promise.reject(new TypeError("fetch failed")),
    chrome: () => Promise.reject(new TypeError("fetch failed")),
  });

  const { status, html } = await render("/");

  expect(status).toBe(200);
  expect(html).toContain("Content is on its way.");
});

test("local development with no front page set is a 404 that says how to set one", async () => {
  vi.stubEnv("DEV", true);
  stubWordPress({
    home: () =>
      data({
        generalSettings: { title: "Acme", description: "" },
        nodeByUri: { ...frontPage, isFrontPage: false },
        designTokens: tokens,
      }),
  });

  const { status, html } = await render("/");

  expect(status).toBe(404);
  expect(html).toContain("The front page is almost ready.");
});
