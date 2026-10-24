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

test("saved Hero box, foreground and deferred player work in Nomia production CSS", async (t) => {
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
  assert.doesNotMatch(script, /schemaEnv|validateSchema|ajv-formats/);
  const blocks = ["video-hero-presentation.html", "video-hero-youtube.html"].flatMap((name) =>
    parse(
      readFileSync(new URL(`../fixtures/design-presentation/${name}`, import.meta.url), "utf8"),
    ),
  );
  const design = (block) => ({
    name: block.blockName,
    attributes: block.attrs,
    content: block.innerHTML,
    children: block.innerBlocks.map(design),
  });
  const wordpress = (block) => ({
    name: block.blockName,
    attributes: block.attrs,
    htmlContent: block.innerHTML,
    innerBlocks: block.innerBlocks.map(wordpress),
  });
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const scopes = {
    local: (await harness.renderBlocks(blocks, { bare: true })).html,
    chrome: renderDesignPattern(blocks.map(design)),
    html: renderWordPressBlocks(blocks.map(wordpress)),
  };
  const html = await harness.renderLayout(
    Object.entries(scopes)
      .map(([name, html]) => `<section data-hero="${name}">${html}</section>`)
      .join(""),
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.setDefaultTimeout(5000);
  await page.route("https://example.test/poster.jpg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"></svg>',
    }),
  );
  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
  await page.setViewportSize({ width: 767, height: 900 });
  await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
  // Exercise a late scoped media reset as well as the Site's actual CSS.
  await page.addStyleTag({
    content: ".gqd-content.gqd-content img,.gqd-content.gqd-content video{height:auto}",
  });
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    globalThis.stopPresentation = globalThis.NomiaPresentation.startDesignPresentation();
  });
  for (const scope of Object.keys(scopes)) {
    const region = page.locator(`[data-hero="${scope}"]`);
    const heroes = region.locator(".wp-block-getquick-design-video-hero");
    assert.equal(await heroes.count(), 2);
    for (const hero of await heroes.all()) {
      assert.equal((await hero.boundingBox()).height, 256);
      assert.equal((await hero.boundingBox()).width, 383.5);
      assert.equal((await hero.locator(".gqd-video-hero__media").boundingBox()).height, 256);
      assert.equal((await hero.locator(".gqd-video-hero__poster").boundingBox()).height, 256);
    }
    const content = heroes.first().locator(".gqd-video-hero__content");
    assert.equal(await content.evaluate((node) => getComputedStyle(node).alignItems), "flex-end");
    assert.equal(
      await content.evaluate((node) => getComputedStyle(node).justifyContent),
      "flex-end",
    );
    assert.equal(await content.evaluate((node) => getComputedStyle(node).textAlign), "start");
    const link = region.getByRole("link", { name: "Explore the collection" });
    assert.equal(await link.getAttribute("href"), "#destination");
    await link.focus();
    assert.equal(await link.evaluate((node) => node === document.activeElement), true);
    const frame = region.locator("iframe");
    assert.equal(
      await frame.getAttribute("src"),
      null,
      "reduced motion prevents initial player attachment",
    );
    assert.equal(await frame.getAttribute("title"), 'Video "di" sfondo & musica');
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const width of [767, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const scope of Object.keys(scopes)) {
      const frame = page.locator(`[data-hero="${scope}"] iframe`);
      await frame.waitFor({ state: "visible" });
      assert.match(await frame.getAttribute("src"), /youtube-nocookie/);
      const box = await frame.boundingBox();
      const mediaWidth = width / 2;
      const expectedHeight = width < 768 ? 256 : (mediaWidth * 315) / 560;
      const expectedWidth = width < 768 ? (256 * 560) / 315 : mediaWidth;
      assert.ok(
        Math.abs(box.width - expectedWidth) < 0.1,
        "iframe cover/contain uses actual half-width media box",
      );
      assert.ok(Math.abs(box.height - expectedHeight) < 0.1);
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const frame of await page.locator("iframe").all()) {
    await page.waitForFunction((node) => !node.getAttribute("src"), await frame.elementHandle());
  }
  await page.evaluate(() => globalThis.stopPresentation());
});
