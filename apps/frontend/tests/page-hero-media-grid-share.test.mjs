import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

function mediaGrid(attrs = {}) {
  return parse(
    `<!-- wp:getquick/page-hero-media-grid ${JSON.stringify({
      firstTitle: "Column A",
      secondTitle: "Column B",
      videoSrc: "/hero.webm",
      ...attrs,
    })} /-->`,
  )[0];
}

function shareLink(document) {
  return [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Partilhar");
}

test("the default share link is the Site's own /partilhe/ page, not a retired host", async (t) => {
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const { document } = await harness.render(mediaGrid());
  const link = shareLink(document);
  assert.ok(link, "share link rendered");
  assert.equal(link.getAttribute("href"), "/partilhe/");
  assert.equal(link.getAttribute("target"), null, "same-Site link opens in place");
});

test("an authored share link still wins over the default", async (t) => {
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const { document } = await harness.render(mediaGrid({ shareHref: "https://example.org/share/" }));
  const link = shareLink(document);
  assert.equal(link.getAttribute("href"), "https://example.org/share/");
  assert.equal(link.getAttribute("target"), "_blank");
});
