import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "@wordpress/block-serialization-default-parser";
import { resolveDesignTheme } from "@getquick/content";
import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";

test("Nomia Layout applies delivered default and overridden themes to saved content", async (t) => {
  const output = await build({
    root: fileURLToPath(new URL("../..", import.meta.url)),
    configFile: false,
    logLevel: "error",
    plugins: [tailwindcss()],
    build: {
      write: false,
      rollupOptions: {
        input: fileURLToPath(new URL("../../src/styles/global.css", import.meta.url)),
      },
    },
  });
  const css = output.output
    .filter((asset) => asset.type === "asset" && asset.fileName.endsWith(".css"))
    .map((asset) => String(asset.source))
    .join("\n");
  const savedContainer = readFileSync(
    new URL("../fixtures/design-presentation/container-presentation.html", import.meta.url),
    "utf8",
  );
  // Compose the real Gutenberg Container snapshot with saved native content.
  const saved = `${savedContainer}<!-- wp:heading --><h3 class="wp-block-heading">Heading baseline</h3><!-- /wp:heading --><!-- wp:list --><ul class="wp-block-list"><!-- wp:list-item --><li>List baseline</li><!-- /wp:list-item --></ul><!-- /wp:list --><!-- wp:image --><figure class="wp-block-image"><img src="https://media.example/theme.svg" alt="Baseline media" width="1200" height="600"></figure><!-- /wp:image -->`;
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const rendered = (await harness.renderBlocks(parse(saved), { bare: true })).html;
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.route("https://media.example/theme.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"></svg>',
    }),
  );
  const cases = [
    { theme: resolveDesignTheme(), md: 768, padding: 16, capBeforeMd: 640 },
    {
      theme: resolveDesignTheme({
        breakpoints: { md: "52rem" },
        spacing: "0.5rem",
        fontFamilies: { sans: '"Courier New", monospace' },
      }),
      md: 832,
      padding: 32,
      capBeforeMd: 640,
    },
  ];
  for (const { theme, md, padding, capBeforeMd } of cases) {
    const html = await harness.renderLayout(`<div class="nomia-blocks">${rendered}</div>`, theme);
    await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
    assert.ok(
      (await page.locator("body").evaluate((node) => getComputedStyle(node).fontFamily)).includes(
        theme.fontFamilies.sans.split(",")[0].trim(),
      ),
      "delivered font family reaches the content scope",
    );
    for (const width of [md - 1, md, md + 1]) {
      await page.setViewportSize({ width, height: 900 });
      const containers = page.locator(".nomia-blocks .wp-block-getquick-design-container");
      const bare = await containers.nth(1).boundingBox();
      const authored = await containers.nth(2).evaluate((node) => ({
        width: node.getBoundingClientRect().width,
        padding: parseFloat(getComputedStyle(node).paddingInlineStart),
      }));
      assert.equal(
        bare.width,
        width < md ? capBeforeMd : md,
        "caps use actual resolved breakpoint",
      );
      assert.equal(
        authored.width,
        width < md ? width / 2 : md,
        "upward override uses delivered theme, not old media rules",
      );
      assert.equal(authored.padding, padding, "spacing uses delivered theme unit");
      const heading = await page
        .getByRole("heading", { name: "Heading baseline" })
        .evaluate((node) => ({
          size: getComputedStyle(node).fontSize,
          weight: getComputedStyle(node).fontWeight,
        }));
      assert.equal(heading.size, "16px", "unstyled heading follows scoped Preflight");
      assert.equal(heading.weight, "400");
      assert.equal(
        await page
          .locator(".wp-block-list")
          .evaluate((node) => getComputedStyle(node).listStyleType),
        "none",
      );
      assert.ok(
        (await page.getByAltText("Baseline media").boundingBox()).width <= width,
        "media remains within containing width",
      );
    }
  }
});
