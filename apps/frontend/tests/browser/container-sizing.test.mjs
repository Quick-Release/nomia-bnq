import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  presentationStyleSheet,
  renderDesignPattern,
  renderWordPressBlocks,
} from "@getquick/content";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
import { build } from "vite";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";
import { parse } from "@wordpress/block-serialization-default-parser";

async function productionCss() {
  const result = await build({
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
  return (
    result.output
      .filter((item) => item.type === "asset" && item.fileName.endsWith(".css"))
      .map((item) => String(item.source))
      .join("\n") + presentationStyleSheet()
  );
}

// Compile the actual Site CSS before authoring the document. The Layout adds
// the same complete public stylesheet; no CMS values enter Tailwind's scanner.
test("saved Containers render through Nomia Astro and chrome with production CSS", async (t) => {
  const css = await productionCss();
  const saved = (id, presentation = {}, children = "", extra = {}) => {
    const attributes = { presentation, ...extra };
    return `<!-- wp:getquick-design/container ${JSON.stringify(attributes)} --><div id="${id}" class="wp-block-getquick-design-container${extra.align ? ` align${extra.align}` : ""}">${children || "<span>Content</span>"}</div><!-- /wp:getquick-design/container -->`;
  };
  const document = [
    saved("bare"),
    saved("center", { base: { marginInline: "auto", paddingInline: 4, paddingBlock: 2 } }),
    saved("fraction", {
      base: { width: "1/2", maxWidth: "none" },
      md: { width: "full" },
      xl: { width: "1/3" },
    }),
    saved("reset", {
      base: { width: "1/2", maxWidth: "none", marginInline: "auto" },
      lg: { width: "reset", marginInline: "reset" },
    }),
    saved("limited", { base: { width: "full", maxWidth: "3xs" } }),
    saved("top-wide", {}, "", { align: "wide" }),
    saved("top-full", {}, "", { align: "full" }),
    saved("overridden-full", { lg: { width: "1/2" }, xl: { marginInline: "auto" } }, "", {
      align: "full",
    }),
    saved(
      "parent",
      { base: { maxWidth: "sm", paddingInline: 4, marginInline: "auto" } },
      saved("nested") +
        saved("nested-full", { base: { width: "full", maxWidth: "none" } }) +
        saved("nested-half", { base: { width: "1/2", maxWidth: "none" } }) +
        saved("wide", {}, "", { align: "wide" }) +
        saved("full", {}, "", { align: "full" }),
    ),
  ].join("");
  const blocks = parse(document);
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const { html } = await harness.renderBlocks(blocks, { bare: true });
  // Chrome reads neutral Design nodes, whereas the local body adapter reads
  // WordPress's parsed saved document. Both must observe the same settings.
  const designNode = (block) => ({
    name: block.blockName,
    attributes: block.attrs,
    content: block.innerHTML,
    children: block.innerBlocks.map(designNode),
  });
  const chrome = renderDesignPattern(blocks.filter((block) => block.blockName).map(designNode));
  const wordpressNode = (block) => ({
    name: block.blockName,
    attributes: block.attrs,
    htmlContent: block.innerHTML,
    innerBlocks: block.innerBlocks.map(wordpressNode),
  });
  const deliveredHtml = renderWordPressBlocks(
    blocks.filter((block) => block.blockName).map(wordpressNode),
  );
  // Public delivery can retain rendered HTML without the original attributes.
  // A second pass must retain the saved neutral variables in that case.
  const savedHtmlOnly = renderWordPressBlocks([
    {
      name: "getquick-design/container",
      htmlContent: renderWordPressBlocks([wordpressNode(blocks[1])]),
    },
  ]);
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent(
    `<style>${css}</style><div class="nomia-blocks">${html}</div><div class="nomia-pattern">${chrome}</div><div class="prose-wp">${deliveredHtml}</div><div class="saved-html-only">${savedHtmlOnly}</div>`,
  );
  const close = (actual, expected, label) =>
    assert.ok(Math.abs(actual - expected) < 0.1, `${label}: ${actual} ≠ ${expected}`);
  const measure = (scope, id) =>
    page.locator(`${scope} [id="${id}"]`).evaluate((element) => {
      const box = element.getBoundingClientRect();
      const parent = element.parentElement.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        width: box.width,
        left: box.left - parent.left,
        padding: parseFloat(style.paddingInlineStart),
        blockPadding: parseFloat(style.paddingBlockStart),
      };
    });
  for (const viewport of [
    375, 639, 640, 641, 767, 768, 769, 1023, 1024, 1025, 1279, 1280, 1281, 1535, 1536, 1537, 1920,
  ]) {
    await page.setViewportSize({ width: viewport, height: 900 });
    const cap = [640, 768, 1024, 1280, 1536].filter((size) => size <= viewport).at(-1) ?? viewport;
    for (const scope of [".nomia-blocks", ".nomia-pattern", ".prose-wp"]) {
      const bare = await measure(scope, "bare");
      close(bare.width, cap, `${scope} bare cap at ${viewport}`);
      close(bare.left, 0, "bare starts at parent edge");
      close(bare.padding, 0, "bare has no padding");
      const center = await measure(scope, "center");
      close(center.left, (viewport - cap) / 2, "authored center");
      close(center.padding, 16, "explicit inline spacing");
      close(center.blockPadding, 8, "explicit block spacing");
      close(
        (await measure(scope, "fraction")).width,
        viewport * (viewport >= 1280 ? 1 / 3 : viewport >= 768 ? 1 : 1 / 2),
        "upward fraction with omitted levels",
      );
      const reset = await measure(scope, "reset");
      close(reset.width, viewport >= 1024 ? viewport : viewport / 2, "explicit width reset");
      close(reset.left, viewport >= 1024 ? 0 : viewport / 4, "margin reset");
      close((await measure(scope, "limited")).width, 256, "width and max width independent");
      const parent = await measure(scope, "parent");
      const inner = parent.width - 32;
      close((await measure(scope, "nested")).width, inner, "bare nested fits parent");
      close((await measure(scope, "nested")).padding, 0, "parent spacing does not inherit");
      close((await measure(scope, "nested-full")).width, inner, "full is parent-relative");
      close((await measure(scope, "nested-half")).width, inner / 2, "fraction is parent-relative");
      close(
        (await measure(scope, "wide")).width,
        inner,
        "native wide fits nested containing layout",
      );
      close(
        (await measure(scope, "full")).width,
        inner,
        "native full fits nested containing layout",
      );
    }
    close(
      (await measure(".prose-wp", "top-wide")).width,
      Math.min(1200, viewport - 48),
      "top native wide uses Site wide measure",
    );
    close((await measure(".prose-wp", "top-full")).width, viewport, "top native full breaks out");
    const overridden = await measure(".prose-wp", "overridden-full");
    close(
      overridden.width,
      viewport >= 1024 ? viewport / 2 : viewport,
      "neutral width overrides native upward only when authored",
    );
    close(
      overridden.left,
      viewport >= 1280 ? viewport / 4 : 0,
      "native margin survives until explicit neutral center",
    );
    const savedCenter = await measure(".saved-html-only", "center");
    close(savedCenter.padding, 16, "HTML-only delivery retains saved spacing");
    close(savedCenter.left, (viewport - cap) / 2, "HTML-only delivery retains saved center");
  }
  await page.locator("body").evaluate((body) => {
    body.dir = "rtl";
  });
  await page.setViewportSize({ width: 1920, height: 900 });
  close((await measure(".nomia-blocks", "bare")).left, 384, "bare starts at RTL edge");
  close((await measure(".nomia-blocks", "center")).left, 192, "logical margins center in RTL");
});

test("real Gutenberg Container document survives Nomia parsed, chrome and rendered HTML paths", async (t) => {
  const css = await productionCss();
  const fixture = (name) =>
    readFileSync(new URL(`../fixtures/design-presentation/${name}`, import.meta.url), "utf8");
  const blocks = parse(fixture("container-presentation.html"));
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const local = (await harness.renderBlocks(blocks, { bare: true })).html;
  const chrome = renderDesignPattern([
    JSON.parse(fixture("container-presentation.json")).blocks[0].node,
  ]);
  const bodyHtml = fixture("container-presentation-rendered.html");
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent(
    `<style>${css}</style><div data-fixture="local" class="nomia-blocks">${local}</div><div data-fixture="chrome" class="nomia-pattern">${chrome}</div><div data-fixture="html" class="prose-wp">${bodyHtml}</div>`,
  );
  const close = (actual, expected, label) =>
    assert.ok(Math.abs(actual - expected) < 0.1, `${label}: ${actual} ≠ ${expected}`);
  for (const width of [
    639, 640, 641, 767, 768, 769, 1023, 1024, 1025, 1279, 1280, 1281, 1535, 1536, 1537,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    const cap = [640, 768, 1024, 1280, 1536].filter((size) => size <= width).at(-1) ?? width;
    for (const scope of ["local", "chrome", "html"]) {
      const containers = page.locator(
        `[data-fixture="${scope}"] .wp-block-getquick-design-container`,
      );
      assert.equal(await containers.count(), 3);
      const box = (index) =>
        containers.nth(index).evaluate((node) => {
          const rect = node.getBoundingClientRect();
          const parent = node.parentElement.getBoundingClientRect();
          return {
            width: rect.width,
            left: rect.left - parent.left,
            padding: parseFloat(getComputedStyle(node).paddingInlineStart),
          };
        });
      const outer = await box(0);
      const bare = await box(1);
      const authored = await box(2);
      close(outer.width, width, `${scope}: outer maxWidth none`);
      close(bare.width, cap, `${scope}: bare responsive cap`);
      close(bare.left, 0, `${scope}: bare uncentered`);
      close(bare.padding, 0, `${scope}: bare unpadded`);
      const expected = width >= 1024 ? 512 : width >= 768 ? cap : width / 2;
      close(authored.width, expected, `${scope}: editor-authored upward width/max width`);
      close(authored.left, (width - expected) / 2, `${scope}: editor-authored center`);
      close(authored.padding, 16, `${scope}: editor-authored padding4`);
      assert.ok(
        await containers.nth(1).getByText("Bare nested container", { exact: true }).count(),
      );
      assert.ok(
        await containers.nth(2).getByText("Authored nested container", { exact: true }).count(),
      );
    }
  }
});
