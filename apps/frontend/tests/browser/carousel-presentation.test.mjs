import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "@wordpress/block-serialization-default-parser";
import { renderDesignPattern, renderWordPressBlocks } from "@getquick/content";
import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";

const fixture = (name) =>
  JSON.parse(
    readFileSync(new URL(`../fixtures/design-presentation/${name}`, import.meta.url), "utf8"),
  );

test("real saved Carousel keeps geometry and ordered content through Nomia adapters", async (t) => {
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const output = await build({
    root,
    configFile: false,
    logLevel: "error",
    plugins: [tailwindcss()],
    build: { write: false, rollupOptions: { input: `${root}/src/styles/global.css` } },
  });
  const css = output.output
    .filter((asset) => asset.type === "asset" && asset.fileName.endsWith(".css"))
    .map((asset) => String(asset.source))
    .join("\n");
  const client = await build({
    root,
    configFile: false,
    logLevel: "error",
    build: {
      write: false,
      lib: {
        entry: `${root}/src/lib/design-presentation-client.ts`,
        formats: ["iife"],
        name: "NomiaPresentation",
      },
    },
  });
  const script = (Array.isArray(client) ? client : [client])
    .flatMap((bundle) => bundle.output)
    .filter((asset) => asset.type === "chunk")
    .map((asset) => asset.code)
    .join("\n");
  assert.doesNotMatch(
    script,
    /schemaEnv|validateSchema|ajv-formats/,
    "browser mounts do not bootstrap server validation",
  );
  const saved = fixture("carousel-presentation-saved.json");
  const publicNode = fixture("carousel-presentation-public.json").blocks[0].node;
  const blocks = parse(saved.html);
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const local = (await harness.renderBlocks(blocks, { bare: true })).html;
  const wordpress = (block) => ({
    name: block.blockName,
    attributes: block.attrs,
    htmlContent: block.innerHTML,
    innerBlocks: block.innerBlocks.map(wordpress),
  });
  const scopes = {
    local,
    chrome: renderDesignPattern([publicNode]),
    html: renderWordPressBlocks(blocks.map(wordpress)),
  };
  const html = await harness.renderLayout(
    Object.entries(scopes)
      .map(([name, html]) => `<div data-carousel-scope="${name}">${html}</div>`)
      .join(""),
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.route("https://example.test/*.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"></svg>',
    }),
  );
  await page.setViewportSize({ width: 767, height: 900 });
  await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    globalThis.NomiaPresentation.startDesignPresentation();
  });
  for (const scope of Object.keys(scopes)) {
    const carousel = page.locator(`[data-carousel-scope="${scope}"] [data-gqd-carousel]`);
    await carousel.waitFor();
    assert.equal(await carousel.getAttribute("data-gqd-mounted"), "");
    assert.equal(await carousel.locator(":scope > .wp-block-getquick-design-slider").count(), 3);
    assert.deepEqual(
      await carousel.locator("img").evaluateAll((images) => images.map((image) => image.alt)),
      ["Slide 1", "Slide 2", "Slide 3"],
    );
    assert.equal(await carousel.getByRole("link").getAttribute("href"), "/first-slide");
    assert.equal(await carousel.getByRole("heading", { name: "First slide heading" }).count(), 1);
    assert.equal(
      await carousel.locator(".wp-block-getquick-design-carousel-navigation").count(),
      0,
      "saved visible:false is honored",
    );
  }
  for (const width of [767, 768, 769, 1279, 1280, 1281]) {
    await page.setViewportSize({ width, height: 900 });
    for (const scope of Object.keys(scopes)) {
      const carousel = page.locator(`[data-carousel-scope="${scope}"] [data-gqd-carousel]`);
      const state = await carousel.evaluate((node) => ({
        height: node.getBoundingClientRect().height,
        display: getComputedStyle(node).display,
      }));
      if (width >= 768 && width < 1280) {
        assert.equal(state.display, "none");
        assert.equal(state.height, 0);
      } else {
        assert.equal(state.display, "grid");
        assert.equal(
          state.height,
          width < 768 ? 150 : width / 2,
          "Auto clears earlier explicit height",
        );
      }
      if (width < 768)
        assert.equal(
          await carousel
            .locator('img[alt="Slide 1"]')
            .evaluate((node) => node.getBoundingClientRect().height),
          150,
          "linked image fills actual carousel box",
        );
    }
  }
  await page.evaluate(() => document.dispatchEvent(new Event("astro:before-swap")));
  assert.equal(
    await page.locator("[data-gqd-mounted]").count(),
    0,
    "Site navigation cleans up shared mounts",
  );
  await page.evaluate(() => document.dispatchEvent(new Event("astro:page-load")));
  assert.equal(await page.locator("[data-gqd-mounted]").count(), 3);
});
