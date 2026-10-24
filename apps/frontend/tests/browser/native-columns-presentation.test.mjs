import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { renderDesignPattern } from "@getquick/content";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";
import { buildPresentationCss } from "../presentation-build.mjs";

test("actual saved native Columns preserve growth, native 782px stacking and neutral overrides", async (t) => {
  const fixture = JSON.parse(
    readFileSync(
      new URL(
        "../fixtures/design-presentation/native-columns-structural-saved.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  assert.deepEqual(fixture.invalid, []);
  const css = await buildPresentationCss();
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const scopes = {
    local: (await harness.renderBlocks(parse(fixture.document), { bare: true })).html,
    chrome: renderDesignPattern(fixture.nodes),
    html: fixture.html,
  };
  const html = await harness.renderLayout(
    Object.entries(scopes)
      .map(
        ([name, html]) =>
          `<section data-columns="${name}" style="max-width:600px">${html}</section>`,
      )
      .join(""),
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
  for (const width of [640, 781, 782, 783, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const dir of ["ltr", "rtl"]) {
      await page.locator("body").evaluate((node, dir) => {
        node.dir = dir;
      }, dir);
      for (const scope of Object.keys(scopes)) {
        const groups = page.locator(`[data-columns="${scope}"] .wp-block-columns`);
        assert.equal(await groups.count(), 4);
        const inspect = (group) =>
          group.evaluate((node) => ({
            wrap: getComputedStyle(node).flexWrap,
            align: getComputedStyle(node).alignItems,
            children: [...node.children].map((child) => ({
              width: child.getBoundingClientRect().width,
              top: child.getBoundingClientRect().top,
              grow: getComputedStyle(child).flexGrow,
              basis: getComputedStyle(child).flexBasis,
              align: getComputedStyle(child).alignSelf,
            })),
          }));
        const stacked = await inspect(groups.nth(0));
        assert.equal(stacked.wrap, width < 782 ? "wrap" : "nowrap");
        assert.equal(stacked.align, "center");
        assert.equal(stacked.children[1].align, "flex-end");
        assert.equal(stacked.children[0].basis, width < 782 ? "100%" : "0px");
        assert.equal(stacked.children[1].top > stacked.children[0].top, width < 782);
        const unequal = await inspect(groups.nth(1));
        assert.equal(unequal.wrap, "nowrap");
        assert.equal(unequal.align, "flex-start");
        assert.equal(unequal.children[0].basis, "25%");
        assert.equal(unequal.children[1].basis, "75%");
        assert.equal(unequal.children[1].align, "center");
        assert.ok(Math.abs(unequal.children[1].width / unequal.children[0].width - 3) < 0.01);
        const equal = await inspect(groups.nth(2));
        assert.equal(equal.children.length, 3);
        for (const child of equal.children) {
          assert.equal(child.grow, "1");
          assert.ok(Math.abs(child.width - 200) < 0.1);
        }
        const overrides = await inspect(groups.nth(3));
        assert.equal(overrides.align, "center");
        assert.equal(
          overrides.children[0].basis,
          "25%",
          "authored neutral width wins native 75% and mobile default",
        );
        assert.equal(overrides.children[0].align, "center");
        assert.equal(overrides.children[0].grow, "0");
      }
    }
  }
});
