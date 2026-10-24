import assert from "node:assert/strict";
import test from "node:test";
import { renderDesignPattern } from "@getquick/content";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";
import { buildPresentationCss } from "../presentation-build.mjs";

test("scoped Preflight preserves Nomia utilities while neutral controls remain authoritative", async (t) => {
  const css = await buildPresentationCss();
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const navigation = await harness.render({
    blockName: "getquick/header-navigation",
    attrs: {
      menuItems: [
        { id: "area", label: "Economia Circular", url: "#" },
        { id: "overview", parentId: "area", label: "Visão geral", url: "/overview/" },
      ],
    },
    innerHTML: "",
    innerBlocks: [],
  });
  const neutral = renderDesignPattern([
    {
      name: "core/heading",
      attributes: {
        level: 2,
        content: "Authored neutral heading",
        className: "text-h2",
        presentation: { base: { fontSize: "2xl" } },
      },
      content: null,
      children: [],
    },
  ]);
  const html = await harness.renderLayout(
    `${navigation.html}<h2 class="text-h2 font-medium">Nomia utility heading</h2><h2>Unstyled heading</h2>${neutral}`,
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("body").getAttribute("class"), "gqd-content");
  const button = page.locator("[data-nomia-navigation] .nomia-area-link").first();
  assert.equal(await button.evaluate((node) => getComputedStyle(node).padding), "8px 6px");
  for (const [name, size] of [
    ["Nomia utility heading", "56px"],
    ["Unstyled heading", "16px"],
    ["Authored neutral heading", "24px"],
  ]) {
    assert.equal(
      await page
        .getByRole("heading", { name, exact: true })
        .evaluate((node) => getComputedStyle(node).fontSize),
      size,
    );
  }
});
