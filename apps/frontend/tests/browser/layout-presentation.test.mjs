import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "@wordpress/block-serialization-default-parser";
import { renderDesignPattern } from "@getquick/content";
import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";

test("real saved layout controls render in Nomia parsed, chrome and body HTML paths", async (t) => {
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
  const fixture = JSON.parse(
    readFileSync(
      new URL("../fixtures/design-presentation/layout-presentation-final.json", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(fixture.invalid, []);
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const local = (await harness.renderBlocks(parse(fixture.document), { bare: true })).html;
  const scopes = { local, chrome: renderDesignPattern(fixture.nodes), html: fixture.html };
  const html = await harness.renderLayout(
    Object.entries(scopes)
      .map(
        ([name, html]) =>
          `<div data-layout-scope="${name}" style="width:100%;max-width:600px">${html}</div>`,
      )
      .join(""),
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
  const close = (actual, expected, label) =>
    assert.ok(Math.abs(actual - expected) < 0.2, `${label}: ${actual} ≠ ${expected}`);
  for (const width of [
    375, 639, 640, 641, 767, 768, 769, 1023, 1024, 1025, 1279, 1280, 1281, 1535, 1536, 1537,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    for (const scope of Object.keys(scopes)) {
      const root = page.locator(`[data-layout-scope="${scope}"]`);
      const grid = root.locator(".wp-block-getquick-design-grid").first();
      const layout = await grid.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          display: style.display,
          tracks: style.gridTemplateColumns.split(" "),
          gap: style.columnGap,
          rowGap: style.rowGap,
        };
      });
      assert.equal(layout.display, "grid", `${scope}: real Grid display`);
      const count = width >= 1536 ? 3 : width >= 1280 ? 1 : width >= 768 ? 4 : 3;
      assert.equal(
        layout.tracks.length,
        count,
        `${scope}: actual authored track count at ${width}`,
      );
      assert.equal(layout.gap, "16px");
      assert.equal(layout.rowGap, width >= 768 ? "0px" : "16px");
      const narrow = root.locator("#narrow-grid");
      const narrowStyle = await narrow.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          width: node.getBoundingClientRect().width,
          gap: style.columnGap,
          rowGap: style.rowGap,
        };
      });
      close(
        narrowStyle.width,
        Math.min(width, 384) - 16,
        `${scope}: nested bare Container fits definite narrow parent`,
      );
      assert.equal(narrowStyle.gap, width >= 1280 ? "0px" : width >= 768 ? "16px" : "8px");
      assert.equal(
        narrowStyle.rowGap,
        width >= 1280 ? "0px" : width >= 768 ? "16px" : "0px",
        `${scope}: later gap shorthand overrides prior rowGap`,
      );
      const group = root.locator(".wp-block-group").first();
      const groupStyle = await group.evaluate((node) => ({
        display: getComputedStyle(node).display,
        gap: getComputedStyle(node).gap,
        direction: getComputedStyle(node).flexDirection,
      }));
      assert.equal(groupStyle.display, "flex");
      assert.equal(groupStyle.gap, "24px", "real shared Gap inspector edit");
      assert.equal(groupStyle.direction, width >= 1024 ? "column" : "row");
      const columns = root.locator(".wp-block-columns").first();
      assert.equal(await columns.evaluate((node) => getComputedStyle(node).display), "flex");
      const children = columns.locator(":scope > .wp-block-column");
      assert.equal(await children.count(), 2);
      const boxes = await children.evaluateAll((nodes) =>
        nodes.map((node) => ({
          width: node.getBoundingClientRect().width,
          top: node.getBoundingClientRect().top,
          align: getComputedStyle(node).alignSelf,
        })),
      );
      close(
        boxes[1].width / boxes[0].width,
        3,
        `${scope}: native unequal quarter/three-quarter split survives`,
      );
      assert.equal(
        boxes[1].align,
        width >= 1024 ? "end" : "center",
        "native Column actual inspector Align self edit",
      );
      const spacer = await root
        .locator(".wp-block-spacer")
        .evaluate((node) => node.getBoundingClientRect().height);
      close(
        spacer,
        width >= 1280 ? 0 : width >= 768 ? 32 : 37,
        `${scope}: native Spacer omission/scale/reset`,
      );
      const parentWidth = await root.evaluate((node) => node.getBoundingClientRect().width);
      const separator = await root.locator(".wp-block-separator").evaluate((node) => ({
        width: node.getBoundingClientRect().width,
        opacity: getComputedStyle(node).opacity,
      }));
      close(separator.width, parentWidth / 2, `${scope}: Separator width`);
      assert.equal(separator.opacity, "0.5");
    }
  }
  await page.locator("body").evaluate((body) => {
    body.dir = "rtl";
  });
  await page.setViewportSize({ width: 768, height: 900 });
  for (const scope of Object.keys(scopes)) {
    const grid = page
      .locator(`[data-layout-scope="${scope}"] .wp-block-getquick-design-grid`)
      .first();
    const lefts = await grid
      .locator(":scope > *")
      .evaluateAll((nodes) => nodes.slice(0, 2).map((node) => node.getBoundingClientRect().left));
    assert.ok(lefts[0] > lefts[1], `${scope}: RTL logical track placement`);
  }
});
