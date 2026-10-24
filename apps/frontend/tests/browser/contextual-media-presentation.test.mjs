import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { designPostContext } from "@getquick/content";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";
import { buildPresentationCss } from "../presentation-build.mjs";

test("Nomia Layout supplies published post media and explicit Branding contexts to chrome", async (t) => {
  const fixture = JSON.parse(
    readFileSync(
      new URL("../fixtures/design-presentation/media-presentation-public.json", import.meta.url),
      "utf8",
    ),
  );
  const [featured, logo] = ["core/post-featured-image", "core/site-logo"].map((name) =>
    fixture.nodes.find((node) => node.name === name),
  );
  const css = await buildPresentationCss();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    assert.match(JSON.parse(init.body).query, /query DesignPresets/);
    return Response.json({ data: { designTokens: { colors: [], spacingSizes: [] } } });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  // Explicit publication/Branding context variants, not additional producer
  // captures. They exercise the actual Site Layout's public context seam.
  const post = designPostContext({
    id: "published-post",
    databaseId: 42,
    title: "Published context",
    uri: "/published-context/",
    designBlocks: [],
    featuredImage: {
      sourceUrl: "https://media.example/featured.svg",
      altText: "Published photograph",
    },
  });
  const primary = {
    url: "https://media.example/primary.svg",
    alt: "Primary identity",
    width: 400,
    height: 200,
  };
  const dark = {
    url: "https://media.example/dark.svg",
    alt: "Dark identity",
    width: 400,
    height: 200,
  };
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.route("https://media.example/*.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"></svg>',
    }),
  );
  for (const current of [
    { colorScheme: "light", logo: primary, logoDark: dark, expected: primary },
    { colorScheme: "dark", logo: primary, logoDark: dark, expected: dark },
    { colorScheme: "dark", logo: primary, logoDark: null, expected: primary },
    { colorScheme: "light", logo: null, logoDark: null, expected: null },
  ]) {
    const pattern = {
      title: "Contextual media",
      blocks: [
        featured,
        {
          ...logo,
          attributes: { ...logo.attributes, logo: current.logo, logoDark: current.logoDark },
        },
      ],
    };
    const chrome = { header: pattern, footer: null, menuItems: [], siteIcon: null, siteLogo: null };
    const html = await harness.renderLayout("<main>Body</main>", undefined, {
      chrome,
      post,
      siteTitle: "Nomia & title",
      colorScheme: current.colorScheme,
    });
    await page.setViewportSize({ width: 1000, height: 900 });
    await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
    const feature = page.locator(".wp-block-post-featured-image");
    assert.equal((await feature.boundingBox()).height, 192);
    assert.equal((await feature.locator("img").boundingBox()).height, 192);
    assert.equal(await feature.locator("img").getAttribute("alt"), "Published photograph");
    assert.equal(await feature.locator("a").getAttribute("href"), "/published-context/");
    const branding = page.locator(".wp-block-site-logo");
    if (current.expected) {
      assert.equal(await branding.locator("img").getAttribute("src"), current.expected.url);
      assert.equal(await branding.locator("img").getAttribute("alt"), current.expected.alt);
      assert.equal((await branding.locator("img").boundingBox()).height, 192);
    } else {
      assert.equal(await branding.locator("img").count(), 0);
      assert.equal(await branding.getByRole("link", { name: "Nomia & title" }).count(), 1);
    }
  }
  // The entry route also supplies its delivered context to Layout automatically.
  // This is the existing reader with explicit stub data, not a live CMS probe.
  globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(init.body);
    const operation = /query (\w+)/.exec(request.query)?.[1];
    const data =
      operation === "EntryByUri"
        ? {
            pageBy: null,
            postBy: {
              id: "post:42",
              databaseId: 42,
              title: "Published context",
              content: "<p>Published body</p>",
              uri: "/published-context/",
              status: "publish",
              isRestricted: false,
              excerpt: "",
              date: "2026-10-24T00:00:00",
              getquickBlocksJson: "[]",
              language: { slug: "pt" },
              translations: [],
              featuredImage: {
                node: {
                  sourceUrl: "https://media.example/featured.svg",
                  altText: "Published photograph",
                },
              },
            },
            designTokens: { colors: [], spacingSizes: [] },
          }
        : operation === "SiteChrome"
          ? {
              generalSettings: { siteIcon: null, siteLogo: null },
              menuItems: { nodes: [] },
              header: {
                title: "Published context header",
                blocksJson: JSON.stringify([featured, logo]),
              },
              footer: null,
            }
          : operation === "DesignPresets"
            ? { designTokens: { colors: [], spacingSizes: [] } }
            : operation === "ConsentSettings"
              ? { getquickLegal: null, googleAnalytics: null }
              : null;
    assert.ok(data, `unexpected query ${operation}`);
    return Response.json({ data });
  };
  const delivered = await harness.renderEntry("/published-context/");
  assert.equal(delivered.status, 200);
  await page.setContent(delivered.html.replace("<head>", `<head><style>${css}</style>`));
  const deliveredFeature = page.locator(".wp-block-post-featured-image");
  assert.equal(await deliveredFeature.locator("img").getAttribute("alt"), "Published photograph");
  assert.equal(await deliveredFeature.locator("a").getAttribute("href"), "/published-context/");
  assert.equal((await deliveredFeature.boundingBox()).height, 192);
  assert.equal(
    await page
      .locator(".wp-block-site-logo")
      .getByRole("link", { name: "Nomia", exact: true })
      .count(),
    1,
  );
});
