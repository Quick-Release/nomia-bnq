import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

test.after(async () => {
  await (await harnessPromise).close();
});

test("the render harness exposes the Structured block container's parsed DOM", async () => {
  const [block] = parse(
    "<!-- wp:getquick/section -->\n<!-- wp:paragraph -->\n<p>Texto dentro da secção.</p>\n<!-- /wp:paragraph -->\n<!-- /wp:getquick/section -->",
  );
  const { document } = await (await harnessPromise).render(block);
  const section = document.querySelector("section");
  const paragraph = document.querySelector("p");

  assert.ok(section);
  assert.ok(paragraph);
  assert.equal(paragraph.textContent, "Texto dentro da secção.");
  assert.equal(paragraph.closest("section"), section);
});

test("core quote keeps child paragraphs inside its parsed quotation element", async () => {
  const [block] = parse(
    '<!-- wp:quote {"className":"is-style-large","anchor":"fonte","align":"wide","textAlign":"center"} -->\n<blockquote id="fonte" class="wp-block-quote alignwide has-text-align-center is-style-large"><!-- wp:paragraph -->\n<p>Texto citado.</p>\n<!-- /wp:paragraph --></blockquote>\n<!-- /wp:quote -->',
  );
  const { document } = await (await harnessPromise).render(block);
  const quote = document.querySelector("blockquote");
  const paragraph = document.querySelector("p");

  assert.ok(quote);
  assert.ok(paragraph);
  assert.equal(quote.classList.contains("wp-block-quote"), true);
  assert.equal(quote.classList.contains("alignwide"), true);
  assert.equal(quote.classList.contains("has-text-align-center"), true);
  assert.equal(quote.classList.contains("is-style-large"), true);
  assert.equal(quote.id, "fonte");
  assert.equal(quote.querySelectorAll("p").length, 1);
  assert.equal(paragraph.closest("blockquote"), quote);
});

test("core quote preserves interleaved markup around child blocks", async () => {
  const [block] = parse(
    '<!-- wp:quote -->\n<blockquote class="wp-block-quote"><p>Antes</p><!-- wp:paragraph -->\n<p>Meio</p>\n<!-- /wp:paragraph --><cite>Depois</cite></blockquote>\n<!-- /wp:quote -->',
  );
  const { document } = await (await harnessPromise).render(block);
  const quote = document.querySelector("blockquote");

  assert.ok(quote);
  assert.deepEqual(
    [...quote.querySelectorAll("p")].map((paragraph) => paragraph.textContent),
    ["Antes", "Meio"],
  );
  assert.equal(quote.querySelector("cite")?.textContent, "Depois");
});

test("an empty core quote keeps its wrapper without inventing children", async () => {
  const [block] = parse(
    '<!-- wp:quote -->\n<blockquote class="wp-block-quote"></blockquote>\n<!-- /wp:quote -->',
  );
  const { document } = await (await harnessPromise).render(block);
  const quote = document.querySelector("blockquote");

  assert.ok(quote);
  assert.equal(quote.className, "wp-block-quote");
  assert.equal(quote.children.length, 0);
});

test("a malformed core quote keeps descendants without inventing a quotation wrapper", async () => {
  const [block] = parse(
    "<!-- wp:quote -->\n<!-- wp:paragraph -->\n<p>Conteúdo recuperável.</p>\n<!-- /wp:paragraph -->\n<!-- /wp:quote -->",
  );
  const { document } = await (await harnessPromise).render(block);
  const paragraph = document.querySelector("p");

  assert.ok(paragraph);
  assert.equal(paragraph.textContent, "Conteúdo recuperável.");
  assert.equal(document.querySelector("blockquote"), null);
});

test("an unsupported container preserves descendants in source order", async () => {
  const [block] = parse(
    '<!-- wp:future/container -->\n<div class="future-container"><!-- wp:paragraph -->\n<p>Primeiro</p>\n<!-- /wp:paragraph --><!-- wp:paragraph -->\n<p>Segundo</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:future/container -->',
  );
  const { document } = await (await harnessPromise).render(block);
  const container = document.querySelector(".future-container");

  assert.ok(container);
  assert.deepEqual(
    [...container.querySelectorAll("p")].map((paragraph) => paragraph.textContent),
    ["Primeiro", "Segundo"],
  );
});

test("title with label renders no second line when the block leaves it empty", async () => {
  const [block] = parse(
    '<!-- wp:getquick/title-with-label {"label":"Visão geral","titleLine1":"Só a primeira linha."} /-->',
  );
  const { document } = await (await harnessPromise).render(block);

  assert.equal(document.querySelector("h2")?.textContent.trim(), "Só a primeira linha.");
  assert.equal(document.querySelector('[data-node-id="40017244:13027"]'), null);
  assert.doesNotMatch(document.body.textContent, /através da coordenação/);
});

test("title with label decodes RichText entities and keeps both lines in one heading", async () => {
  const [block] = parse(
    '<!-- wp:getquick/title-with-label {"label":"Energia \\u0026amp; Clima","titleLine1":"Linha \\u0026lt;um\\u003e","titleLine2":"Segunda\\u003cbr\\u003elinha","level":3} /-->',
  );
  const { document } = await (await harnessPromise).render(block);

  assert.equal(document.querySelector("h2"), null);
  const heading = document.querySelector("h3");
  assert.ok(heading);
  assert.equal(heading.textContent.replace(/\s+/g, " ").trim(), "Linha <um> Segunda linha");
  assert.match(document.body.textContent, /Energia & Clima/);
  assert.doesNotMatch(document.body.innerHTML, /&amp;amp;|&lt;br/);
  assert.equal(document.querySelector("section")?.hasAttribute("aria-label"), false);
});

test("title with label renders nested buttons as a right-hand third column from xl", async () => {
  const [block] = parse(
    '<!-- wp:getquick/title-with-label {"label":"Aprender","titleLine1":"Descobre."} -->\n<!-- wp:buttons -->\n<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-bioeconomia"} -->\n<div class="wp-block-button is-style-bioeconomia"><a class="wp-block-button__link wp-element-button" href="/recursos-educativos/">PARA OS MAIS NOVOS!</a></div>\n<!-- /wp:button --></div>\n<!-- /wp:buttons -->\n<!-- /wp:getquick/title-with-label -->',
  );
  const { document } = await (await harnessPromise).render(block);
  const grid = document.querySelector('[data-node-id="40017244:13022"]');
  const actions = document.querySelector("[data-title-with-label-actions]");

  assert.ok(grid?.classList.contains("xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"));
  assert.equal(actions?.parentElement, grid);
  assert.ok(actions.classList.contains("xl:col-[3]"));
  assert.equal(actions.querySelector("a")?.textContent, "PARA OS MAIS NOVOS!");
  assert.equal(actions.querySelector("h2"), null);
});

test("title with label without nested blocks keeps its two columns", async () => {
  const [block] = parse(
    '<!-- wp:getquick/title-with-label {"label":"Visão geral","titleLine1":"Um"} /-->',
  );
  const { document } = await (await harnessPromise).render(block);

  assert.equal(document.querySelector("[data-title-with-label-actions]"), null);
  assert.ok(
    document
      .querySelector('[data-node-id="40017244:13022"]')
      ?.classList.contains("md:grid-cols-[auto_minmax(0,1fr)]"),
  );
});

test("title with label renders unmigrated pixel typography through the nearest token", async () => {
  const [block] = parse(
    '<!-- wp:getquick/title-with-label {"label":"Visão","titleLine1":"Um","titleLine2":"Dois","titleLine2FontSize":18} /-->',
  );
  const { document } = await (await harnessPromise).render(block);

  assert.equal(
    document.querySelector('[data-node-id="40017244:13027"]')?.getAttribute("style"),
    "font-size: var(--typography-font-size-body-large)",
  );
});
