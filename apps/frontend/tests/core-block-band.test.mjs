import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

test.after(async () => {
  await (await harnessPromise).close();
});

test("blank paragraphs before a hero do not open an empty white band", async () => {
  const blocks = parse(
    "<!-- wp:paragraph --><p></p><!-- /wp:paragraph -->\n\n<!-- wp:paragraph --><p>&nbsp;</p><!-- /wp:paragraph -->",
  );
  const { document } = await (
    await harnessPromise
  ).renderBlocks(blocks, {
    bare: true,
    wrapCoreBlocks: true,
  });

  assert.equal(document.querySelectorAll("section[data-nomia-header-surface='light']").length, 0);
  assert.equal(document.querySelectorAll("p").length, 0);
});

test("paragraphs with content still render inside the core band", async () => {
  const blocks = parse(
    "<!-- wp:paragraph --><p></p><!-- /wp:paragraph -->\n\n<!-- wp:paragraph --><p>Texto</p><!-- /wp:paragraph -->",
  );
  const { document } = await (
    await harnessPromise
  ).renderBlocks(blocks, {
    bare: true,
    wrapCoreBlocks: true,
  });

  const bands = document.querySelectorAll("section[data-nomia-header-surface='light']");
  assert.equal(bands.length, 1);
  assert.equal(bands[0].querySelector("p")?.textContent, "Texto");
});
