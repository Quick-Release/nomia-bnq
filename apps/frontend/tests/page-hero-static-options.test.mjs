import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import {
  PAGE_HERO_LINE_HEIGHTS,
  normalizePageHeroLineHeight,
  pageHeroTextStyle,
  pageHeroTextStyleProperties,
  readPageHeroTextTypography,
} from "../src/lib/page-hero-typography.ts";
import { resolvePageHeroPadding } from "../src/components/page-heroes/pageHeroShared.ts";
import { LINE_HEIGHT_SLUGS } from "../src/lib/typography-tokens.ts";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

test.after(async () => {
  await (await harnessPromise).close();
});

function hero(attrs) {
  const [block] = parse(
    `<!-- wp:getquick/page-hero-static ${JSON.stringify({ title: "Título", subtitle: "Subtítulo", ...attrs })} /-->`,
  );
  return block;
}

test("the subtitle line height is a design token or nothing", () => {
  assert.deepEqual(PAGE_HERO_LINE_HEIGHTS, ["default", ...LINE_HEIGHT_SLUGS]);
  assert.equal(normalizePageHeroLineHeight("e"), "e");
  for (const value of ["default", "", "40px", "1.5", "z", undefined, 3]) {
    assert.equal(normalizePageHeroLineHeight(value), undefined, String(value));
  }

  const typography = readPageHeroTextTypography({ subtitleLineHeight: "e" }, "subtitle");
  assert.deepEqual(typography, { lineHeight: "e" });
  assert.equal(pageHeroTextStyle(typography), "line-height: var(--typography-line-height-e)");
  assert.deepEqual(pageHeroTextStyleProperties(typography), { lineHeight: "64px" });
});

test("padding steps fall back to the height's own padding", () => {
  for (const step of ["default", "none", "small", "medium", "large"]) {
    assert.equal(resolvePageHeroPadding(step), step);
  }
  for (const value of ["", "huge", "24px", undefined, null]) {
    assert.equal(resolvePageHeroPadding(value), "default", String(value));
  }
});

test("the hero renders the subtitle line height and padding the editor chose", async () => {
  const { document } = await (
    await harnessPromise
  ).render(
    hero({ height: "l", subtitleLineHeight: "e", paddingTop: "none", paddingBottom: "small" }),
  );

  const subtitle = document.querySelector("section p");
  assert.match(
    subtitle.getAttribute("style") ?? "",
    /line-height: var\(--typography-line-height-e\)/,
  );

  const classes = document
    .querySelector("h1")
    .closest("div[class*='max-w-[1920px]']")
    .className.split(" ");
  assert.ok(classes.includes("pt-0"));
  assert.ok(classes.includes("pb-8") && classes.includes("md:pb-12"));
  assert.ok(
    !classes.includes("md:pt-32") && !classes.includes("pb-40"),
    "the height's padding is replaced",
  );
});

test("a hero saved before these options renders as it did", async () => {
  const { document } = await (await harnessPromise).render(hero({ height: "l" }));

  assert.equal(document.querySelector("section p").getAttribute("style"), null);
  const classes = document
    .querySelector("h1")
    .closest("div[class*='max-w-[1920px]']")
    .className.split(" ");
  for (const expected of ["pt-24", "md:pt-32", "pb-40", "md:pb-48"]) {
    assert.ok(classes.includes(expected), expected);
  }
});

test("each line of the subtitle renders as its own paragraph", async () => {
  const { document } = await (
    await harnessPromise
  ).render(
    hero({
      subtitle: "Primeiro parágrafo &amp; mais.<br>Segundo parágrafo.<br><br>\nTerceiro.",
      subtitleLineHeight: "h",
    }),
  );

  const wrapper = document.querySelector("[data-page-hero-subtitle]");
  assert.equal(wrapper.tagName, "DIV");
  assert.match(
    wrapper.getAttribute("style") ?? "",
    /line-height: var\(--typography-line-height-h\)/,
  );
  assert.deepEqual(
    [...wrapper.querySelectorAll("p")].map((paragraph) => paragraph.textContent),
    ["Primeiro parágrafo & mais.", "Segundo parágrafo.", "Terceiro."],
  );
  assert.equal(wrapper.querySelector("br"), null);
});

test("a one-paragraph subtitle keeps its single paragraph", async () => {
  const { document } = await (await harnessPromise).render(hero({ subtitle: "Só um." }));

  const subtitle = document.querySelector("[data-page-hero-subtitle]");
  assert.equal(subtitle.tagName, "P");
  assert.equal(subtitle.textContent, "Só um.");
});
