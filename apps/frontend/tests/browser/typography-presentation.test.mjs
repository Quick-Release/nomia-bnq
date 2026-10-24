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

test("actual typography delivery retains rich text and authored styles in Nomia production CSS", async (t) => {
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
      new URL("../fixtures/design-presentation/typography-inline-delivery.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(fixture.cases[0].savedContent, fixture.cases[1].savedContent);
  assert.deepEqual(fixture.cases[0].neutralNodes, fixture.cases[1].neutralNodes);
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  for (const current of fixture.cases) {
    assert.equal(
      current.layout.available,
      false,
      "producer did not deliver a saved dynamic layout",
    );
    const local = (await harness.renderBlocks(parse(current.savedContent), { bare: true })).html;
    const scopes = {
      local,
      chrome: renderDesignPattern(current.neutralNodes),
      html: current.renderedHTML,
    };
    const html = await harness.renderLayout(
      Object.entries(scopes)
        .map(([name, html]) => `<section data-typography="${name}">${html}</section>`)
        .join(""),
      current.tokens.theme,
    );
    await page.setViewportSize(current.preview.viewport);
    await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
    for (const scope of Object.keys(scopes)) {
      const region = page.locator(`[data-typography="${scope}"]`);
      const heading = region.getByRole("heading", { name: "Authored heading" });
      const styles = async (locator, properties) =>
        locator.evaluate(
          (node, properties) =>
            Object.fromEntries(
              properties.map((property) => [
                property,
                getComputedStyle(node).getPropertyValue(property),
              ]),
            ),
          properties,
        );
      const compare = async (locator, name, properties) => {
        const actual = await styles(locator, properties);
        for (const property of properties)
          assert.equal(
            actual[property],
            current.preview.computed[name][property],
            `${current.name}/${scope}/${name}/${property}`,
          );
      };
      assert.equal(await heading.locator("strong").textContent(), "head");
      assert.equal(await heading.getByRole("link").getAttribute("title"), "Read > learn");
      assert.equal(await heading.locator(".inline-label").textContent(), "ing");
      const paragraph = region.locator("p").filter({ hasText: "Default paragraph" });
      assert.equal(await paragraph.getByRole("link").getAttribute("href"), "/guide");
      assert.equal(await paragraph.locator("strong").textContent(), "para");
      assert.equal(await paragraph.locator(".inline-label").textContent(), "graph");
      await compare(heading, "heading", [
        "font-size",
        "line-height",
        "font-weight",
        "letter-spacing",
        "color",
        "text-align",
      ]);
      const list = region.locator("ol");
      assert.equal(await list.getAttribute("start"), "3");
      assert.notEqual(await list.getAttribute("reversed"), null);
      await compare(list.locator(":scope > li"), "list", [
        "list-style-type",
        "list-style-position",
      ]);
      assert.equal(await list.locator("ul > li").textContent(), "Nested item");
      await compare(list.locator("ul > li"), "nestedList", ["list-style-type"]);
      const link = region.getByRole("link", { name: "Go shopping" });
      assert.equal(await link.getAttribute("href"), "/shop");
      assert.equal(await link.getAttribute("title"), "Spend > save");
      assert.equal(await link.getAttribute("target"), "_blank");
      assert.equal(await link.getAttribute("rel"), "noopener");
      assert.equal(await link.locator("strong").textContent(), "shopping");
      await compare(link, "button", [
        "padding-inline-start",
        "padding-block-start",
        "border-radius",
        "color",
        "background-color",
      ]);
      await compare(region.locator(".wp-block-buttons"), "buttons", [
        "flex-direction",
        "flex-wrap",
        "gap",
        "align-items",
        "justify-content",
      ]);
      await link.focus();
      assert.equal(await link.evaluate((node) => node === document.activeElement), true);
    }
  }
});
