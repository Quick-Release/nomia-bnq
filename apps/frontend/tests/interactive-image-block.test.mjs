import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

after(async () => {
  await (await harnessPromise).close();
});

const block = (attrs) => ({
  blockName: "getquick/interactive-image",
  attrs,
  innerBlocks: [],
  innerHTML: "",
  innerContent: [],
});

test("a block saved without its image shows the default graphic, as Gutenberg omits defaults", async () => {
  const { document } = await (await harnessPromise).render(block({}));
  assert.ok(document.querySelector("svg"), "the Economia Circular graphic renders");
});

test("an unknown image renders nothing", async () => {
  const { document } = await (await harnessPromise).render(block({ image: "nope" }));
  assert.equal(document.querySelector("svg"), null);
});
