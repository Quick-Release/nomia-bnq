import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { wpGroupLayoutClasses } from "../src/lib/wp-group-layout.ts";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

/** Serialized by WordPress 7.1's editor (`wp.blocks.serialize`) for each allowed static block. */
const SAMPLES = JSON.parse(
  readFileSync(new URL("./fixtures/core-block-samples.json", import.meta.url), "utf8"),
);
const harnessPromise = createAstroRenderHarness();

test.after(async () => {
  await (await harnessPromise).close();
});

async function render(name) {
  const [block] = parse(SAMPLES[name]);
  return (await (await harnessPromise).render(block)).document;
}

test("every static sample renders its saved HTML, children nested in place", async () => {
  const expectations = {
    group: ["div.wp-block-group.has-main-ciano-100-background-color p", "Dentro do grupo"],
    cover: ["div.wp-block-cover > div.wp-block-cover__inner-container p", "Texto na capa"],
    mediaText: ["div.wp-block-media-text > div.wp-block-media-text__content p", "Texto ao lado"],
    gallery: ["figure.wp-block-gallery.columns-3 > .wp-block-image img", ""],
    audio: ["figure.wp-block-audio > audio", ""],
    video: ["figure.wp-block-video > video", ""],
    table: ["figure.wp-block-table.is-style-stripes > table.has-fixed-layout td", "2024"],
    separator: ["hr.wp-block-separator", ""],
    spacer: ["div.wp-block-spacer", ""],
    code: ["pre.wp-block-code > code", "const x = 1;"],
    preformatted: ["pre.wp-block-preformatted", "linha 1linha 2"],
    pullquote: ["figure.wp-block-pullquote > blockquote > p", "Uma citação"],
    verse: ["pre.wp-block-verse", "verso umverso dois"],
    details: ["details.wp-block-details p", "Conteúdo escondido"],
    math: ["div.wp-block-math > math", "x2"],
  };

  for (const [name, [selector, text]] of Object.entries(expectations)) {
    const document = await render(name);
    const element = document.querySelector(selector);
    assert.ok(element, `${name}: ${selector}`);
    if (text) assert.equal(element.textContent.trim(), text, name);
    assert.equal(document.querySelector("[data-nomia-unsupported-block]"), null, name);
  }

  const gallery = await render("gallery");
  assert.equal(gallery.querySelectorAll("figure.wp-block-gallery > .wp-block-image").length, 3);
});

test("a group's flex layout becomes classes on its own element", async () => {
  assert.deepEqual(wpGroupLayoutClasses({ layout: { type: "flex", flexWrap: "nowrap" } }), [
    "is-layout-flex",
    "is-nowrap",
  ]);
  assert.deepEqual(
    wpGroupLayoutClasses({
      layout: { type: "flex", orientation: "vertical", justifyContent: "center" },
    }),
    ["is-layout-flex", "is-vertical", "is-content-justification-center"],
  );
  assert.deepEqual(wpGroupLayoutClasses({ layout: { type: "constrained" } }), []);

  const document = await render("groupRow");
  const group = document.querySelector(".wp-block-group");
  assert.ok(group.classList.contains("is-layout-flex") && group.classList.contains("is-nowrap"));
  // Each paragraph is its own flex item.
  assert.equal(group.children.length, 2);
  assert.equal(group.textContent.replace(/\s+/g, ""), "AB");
});

test("the core block stylesheet takes its colours from GQ Design's palette", () => {
  const css = readFileSync(new URL("../src/styles/wp-core-blocks.css", import.meta.url), "utf8");
  const palette = JSON.parse(
    readFileSync(new URL("../../cms/scripts/nomia-palette.json", import.meta.url), "utf8"),
  );
  const slugs = new Set(palette.colors.map(({ slug }) => slug));

  // No copied palette: the preset classes come with each page's design presets.
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
  assert.doesNotMatch(css, /\.has-[a-z0-9-]+-(?:background-)?color\b/);
  for (const [, slug] of css.matchAll(/--wp--preset--color--([a-z0-9-]+)/g)) {
    assert.ok(slugs.has(slug), `${slug} is not in the Nomia palette`);
  }
});
