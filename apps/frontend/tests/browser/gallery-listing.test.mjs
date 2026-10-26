import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";

test("gallery lightbox contains focus, handles Escape and includes infinitely appended images", async (t) => {
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const built = await build({
    root,
    configFile: false,
    logLevel: "error",
    build: {
      write: false,
      lib: { entry: `${root}/src/lib/listing-browser.ts`, name: "NomiaListing", formats: ["iife"] },
    },
  });
  const script = (Array.isArray(built) ? built[0] : built).output.find(
    (item) => item.type === "chunk",
  ).code;
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const listing = "/src/components/content-lists/listing/NomiaContentListing.astro";
  const row = (number) => ({
    href: `https://gallery.test/${number}.svg`,
    title: "Album",
    imageSrc: `https://gallery.test/${number}.svg`,
    imageAlt: `Photo ${number}`,
  });
  const initial = (
    await harness.renderComponent(listing, {
      display: "thumbnail-grid",
      empty: "none",
      lightbox: true,
      infiniteLoading: true,
      rows: [row(1), row(2)],
      next: "/galeria/?pagina=2",
    })
  ).html;
  const next = (
    await harness.renderComponent(listing, {
      display: "thumbnail-grid",
      empty: "none",
      lightbox: true,
      infiniteLoading: true,
      rows: [row(3)],
    })
  ).html;
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  page.setDefaultTimeout(5000);
  await page.route("https://gallery.test/*.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"></svg>',
    }),
  );
  await page.route("https://gallery.test/galeria/?pagina=2", (route) =>
    route.fulfill({ contentType: "text/html", body: next }),
  );
  await page.setContent(
    `<!doctype html><base href="https://gallery.test/galeria/"><style>[data-listing-item] { height: 900px; } [data-listing-item] img { width: 200px; }</style>${initial.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")}`,
  );
  await page.addScriptTag({ content: script });
  await page.evaluate(() => globalThis.NomiaListing.initializeListings());
  const first = page.locator("[data-listing-item] > a").first();
  await first.click();
  assert.equal(await page.locator("dialog").evaluate((dialog) => dialog.open), true);
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator("[data-listing-image]").getAttribute("alt"), "Photo 2");
  for (let index = 0; index < 5; index++) {
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(
        () =>
          Boolean(document.activeElement.closest("dialog")) ||
          document.activeElement.tagName === "DIALOG",
      ),
      true,
    );
  }
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.documentElement.style.overflow === "");
  assert.equal(await first.evaluate((element) => document.activeElement === element), true);
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "");
  await page.locator("[data-listing-more]").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelectorAll("[data-listing-item]").length === 3);
  assert.equal(await page.locator("[data-listing-more]").isHidden(), true);
  await page.locator("[data-listing-item] > a").last().click();
  assert.equal(await page.locator("[data-listing-image]").getAttribute("alt"), "Photo 3");
});
