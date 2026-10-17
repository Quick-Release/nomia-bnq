import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import {
  SECTION_BACKGROUND_POSITIONS,
  normalizeSectionBackgroundImage,
  readSectionBackgroundPosition,
  readSectionBackgroundSize,
  sectionBackgroundPositionCss,
} from "../src/lib/section-block.ts";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

test.after(async () => {
  await (await harnessPromise).close();
});

function section(attrs) {
  const [block] = parse(
    `<!-- wp:getquick/section ${JSON.stringify(attrs)} --><!-- wp:paragraph --><p>Conteúdo</p><!-- /wp:paragraph --><!-- /wp:getquick/section -->`,
  );
  return block;
}

test("background image URLs are paths or http(s), nothing else", () => {
  assert.equal(normalizeSectionBackgroundImage(" /app/uploads/a.jpg "), "/app/uploads/a.jpg");
  assert.equal(normalizeSectionBackgroundImage("https://x.test/a.jpg"), "https://x.test/a.jpg");
  for (const value of [
    "javascript:alert(1)",
    "data:image/png;base64,x",
    "//evil.test/a.jpg",
    "",
    null,
  ]) {
    assert.equal(normalizeSectionBackgroundImage(value), null, String(value));
  }
});

test("every named position resolves to a CSS position and unknown values to the centre", () => {
  for (const position of SECTION_BACKGROUND_POSITIONS) {
    assert.match(
      sectionBackgroundPositionCss(position),
      /^(left|center|right) (top|center|bottom)$/,
    );
  }
  assert.equal(sectionBackgroundPositionCss("right"), "right center");
  assert.equal(readSectionBackgroundPosition("50% 20%"), "center");
  assert.equal(readSectionBackgroundSize("200px"), "cover");
});

test("a square image fitted to the right sits behind the section's content", async () => {
  const { document } = await (
    await harnessPromise
  ).render(
    section({
      backgroundColor: "#00524d",
      backgroundImageId: 7,
      backgroundImageSrc: "https://x.test/quadrado.jpg",
      backgroundImagePosition: "right",
      backgroundImageSize: "contain",
    }),
  );

  const band = document.querySelector("section");
  assert.ok(band.classList.contains("isolate") && band.classList.contains("relative"));
  assert.equal(band.getAttribute("style"), "background-color: #00524d");
  const image = band.querySelector("[data-nomia-section-background-image]");
  assert.equal(image.getAttribute("src"), "https://x.test/quadrado.jpg");
  assert.equal(image.getAttribute("alt"), "");
  assert.ok(image.classList.contains("object-contain"));
  // Beside the copy from tablets up; after the content on phones.
  assert.ok(image.classList.contains("md:absolute") && image.classList.contains("md:-z-10"));
  assert.ok(!image.classList.contains("absolute"));
  assert.equal(image.getAttribute("style"), "object-position: right center");
  // The content still renders above it.
  assert.equal(band.querySelector("[data-nomia-section-inner]").textContent.trim(), "Conteúdo");
});

test("a section without an image, or with an unsafe one, draws none", async () => {
  const harness = await harnessPromise;
  for (const attrs of [{}, { backgroundImageSrc: "javascript:alert(1)" }]) {
    const { document } = await harness.render(section(attrs));
    assert.equal(document.querySelector("[data-nomia-section-background-image]"), null);
    assert.ok(!document.querySelector("section").classList.contains("isolate"));
  }
});

test("a filling image is the section's background at every width", async () => {
  const { document } = await (
    await harnessPromise
  ).render(section({ backgroundImageSrc: "/app/uploads/foto.jpg" }));

  const image = document.querySelector("[data-nomia-section-background-image]");
  assert.ok(image.classList.contains("object-cover"));
  assert.ok(image.classList.contains("absolute") && image.classList.contains("-z-10"));
  assert.equal(image.getAttribute("style"), "object-position: center center");
});
