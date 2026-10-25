import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const editorialColors = {
  firstTitleColor: "#123456",
  firstTextColor: "#654321",
  secondTitleColor: "#abcdef",
  secondTextColor: "#fedcba",
};

function mediaGrid(attrs = {}) {
  return parse(
    `<!-- wp:getquick/page-hero-media-grid ${JSON.stringify({
      firstTitle: "Column A",
      firstText: "Text A",
      firstHref: "/bioeconomia/",
      secondTitle: "Column B",
      secondText: "Text B",
      secondHref: "/economia-circular/",
      ...attrs,
    })} /-->`,
  )[0];
}

test("the media grid adapter preserves four independent editorial colors over thematic identity", async (t) => {
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  for (const attrs of [
    editorialColors,
    ...Object.keys(editorialColors).map((key) => ({ ...editorialColors, [key]: "#135790" })),
  ]) {
    const { document } = await harness.render(mediaGrid(attrs));
    const colors = [...document.querySelectorAll(".action-title, .action-text")].map(
      (node) => node.style.color,
    );
    const expected = Object.values(attrs).map((color) => {
      const node = document.createElement("span");
      node.style.color = color;
      return node.style.color;
    });
    assert.deepEqual(colors, expected);
  }
});

test("missing or invalid editorial colors use safe defaults for linked and unlinked panels", async (t) => {
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const { document } = await harness.render(
    mediaGrid({
      firstHref: "",
      firstTitleColor: "red; background: url(https://example.test)",
      secondTextColor: "",
      videoSrc: "/hero.webm",
      videoTitle: "Hero video",
      firstBorderRadius: "24px",
      secondBorderRadius: "16px",
    }),
  );
  assert.deepEqual(
    [...document.querySelectorAll(".action-title, .action-text")].map((node) => node.style.color),
    Array(4).fill("rgb(255, 255, 255)"),
  );
  const panels = document.querySelectorAll(".action");
  assert.equal(panels[0].tagName, "DIV");
  assert.equal(panels[1].getAttribute("href"), "/economia-circular/");
  assert.match(panels[0].getAttribute("style"), /border-radius: 24px/);
  assert.match(panels[1].getAttribute("style"), /border-radius: 16px/);
  assert.match(panels[1].getAttribute("style"), /--nomia-area-background:/);
  assert.match(panels[1].getAttribute("style"), /--nomia-area-hover-background:/);
  assert.equal(document.querySelector("video source").getAttribute("src"), "/hero.webm");
  assert.equal(document.querySelector("video").getAttribute("aria-label"), "Hero video");
});
