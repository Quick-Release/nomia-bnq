import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "@wordpress/block-serialization-default-parser";
import { renderDesignPattern, resolveDesignTheme } from "@getquick/content";
import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";

test("Nomia Query uses selected published posts, recursive content and transparent references", async (t) => {
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const fixture = JSON.parse(
    readFileSync(
      new URL(
        "../fixtures/design-presentation/query-composition/post-public.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const saved = parse(
    readFileSync(
      new URL("../fixtures/design-presentation/query-composition/post-saved.html", import.meta.url),
      "utf8",
    ),
  );
  const selected = fixture.blocks[0].attributes.items;
  assert.equal(saved[0].attrs.offset, 1);
  assert.equal(saved[0].attrs.perPage, 2);
  assert.deepEqual(
    fixture.items.map((item) => item.title),
    ["00081 Beta", "00081 Gamma"],
  );
  assert.deepEqual(
    selected.map((item) => item.id),
    fixture.items.map((item) => item.id),
  );
  const records = new Map(fixture.items.map((item) => [item.id, item]));
  const callbacks = [];
  const direct = renderDesignPattern(fixture.blocks, {
    resolvePost: (item) => {
      callbacks.push(item.id);
      const record = records.get(item.id);
      return record
        ? { id: record.id, title: record.title, blocks: record.blocks, uri: item.uri }
        : null;
    },
  });
  assert.deepEqual(
    callbacks,
    selected.map((item) => item.id),
    "producer selection is repeated once, without a second offset/slice",
  );

  // Exercise the actual Site component and content runtime's existing reader.
  // The captured GraphQL payload stays untouched; publication envelope fields
  // below are test delivery metadata, not evidence of a new upstream request.
  const originalFetch = globalThis.fetch;
  const loads = [];
  const theme = resolveDesignTheme();
  const tokens = { colors: [], spacingSizes: [], theme };
  globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(init.body);
    const operation = /query (\w+)/.exec(request.query)?.[1];
    if (operation === "DesignPresets") return Response.json({ data: { designTokens: tokens } });
    assert.equal(operation, "EntryByUri", "reuse the existing publication loader");
    assert.match(request.query, /getquickBlocksJson/);
    assert.match(request.query, /databaseId/);
    const item = selected.find((item) => item.uri === request.variables.uri);
    assert.ok(item, "only producer-selected URIs are loaded");
    loads.push(item.uri);
    const record = records.get(item.id);
    return Response.json({
      data: {
        postBy: {
          ...record.publishedPost,
          id: `post:${record.id}`,
          uri: item.uri,
          status: "publish",
          isRestricted: false,
          content: "",
          excerpt: "",
          date: null,
          featuredImage: null,
          language: { slug: "pt" },
          translations: [],
        },
        pageBy: null,
        designTokens: tokens,
      },
    });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const chrome = await harness.renderPattern({ title: "Captured Query", blocks: fixture.blocks });
  assert.deepEqual(
    loads,
    selected.map((item) => item.uri),
    "actual Site preload uses selected URIs once and in order",
  );
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
  const html = await harness.renderLayout(
    `<section data-query="callback">${direct}</section><section data-query="site">${chrome}</section>`,
    theme,
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
  for (const width of [767, 768, 1000]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["callback", "site"]) {
      const scope = page.locator(`[data-query="${path}"]`);
      assert.deepEqual(await scope.locator("h2.wp-block-post-title").allTextContents(), [
        "00081 Beta",
        "00081 Gamma",
      ]);
      const bodies = scope.locator(".wp-block-post-content");
      assert.equal(await bodies.count(), 2);
      for (let index = 0; index < 2; index++) {
        const body = bodies.nth(index);
        const paragraphs = await body.locator(":scope > p").allTextContents();
        assert.deepEqual(
          paragraphs,
          [`${fixture.items[index].title} content`, "Nested item body"],
          "matching recursive content, transparent synced paragraph",
        );
        assert.equal(
          await body.evaluate((node) => getComputedStyle(node).paddingBlockStart),
          "8px",
        );
        assert.equal(
          await body
            .locator("p")
            .last()
            .evaluate((node) => getComputedStyle(node).fontSize),
          "18px",
        );
      }
      const grids = scope.locator(".wp-block-getquick-design-grid");
      assert.equal(await grids.count(), 2);
      for (const grid of await grids.all()) {
        const geometry = await grid.evaluate((node) => ({
          display: getComputedStyle(node).display,
          tracks: getComputedStyle(node).gridTemplateColumns.split(" ").length,
          gap: getComputedStyle(node).gap,
          previous: node.previousElementSibling?.classList.contains("wp-block-post-content"),
        }));
        assert.deepEqual(
          geometry,
          { display: "grid", tracks: width < 768 ? 1 : 2, gap: "16px", previous: true },
          "synced reference has no layout-changing wrapper",
        );
      }
      const heading = scope.getByRole("heading", { name: "Pattern details" });
      assert.equal(await heading.count(), 2);
      assert.equal(
        await heading.first().evaluate((node) => getComputedStyle(node).fontSize),
        "20px",
      );
      assert.equal(
        await heading.first().evaluate((node) => getComputedStyle(node).fontWeight),
        "700",
      );
      const links = scope.getByRole("link", { name: "Read item", exact: true });
      assert.equal(await links.count(), 2);
      for (const link of await links.all()) {
        assert.equal(await link.getAttribute("href"), "#details");
        assert.equal(await link.evaluate((node) => node.tagName), "A");
        assert.equal(
          await link.evaluate((node) => getComputedStyle(node).paddingInlineStart),
          "16px",
        );
        assert.equal(await link.evaluate((node) => getComputedStyle(node).borderRadius), "8px");
        await link.focus();
        assert.equal(await link.evaluate((node) => node === document.activeElement), true);
      }
    }
  }
});
