import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

test.after(async () => {
  await (await harnessPromise).close();
});

test("a Gutenberg list owns its list items directly, in order and exactly once", async () => {
  const [block] = parse(
    '<!-- wp:list --><ul class="wp-block-list"><!-- wp:list-item --><li>Primeiro</li><!-- /wp:list-item --><!-- wp:list-item --><li>Segundo</li><!-- /wp:list-item --></ul><!-- /wp:list -->',
  );
  const { document } = await (await harnessPromise).render(block);
  const list = document.querySelector("ul");

  assert.ok(list);
  assert.deepEqual(
    [...list.children].map((item) => [item.tagName, item.textContent]),
    [
      ["LI", "Primeiro"],
      ["LI", "Segundo"],
    ],
  );
  assert.equal(document.querySelectorAll("li").length, 2);
});

test("ordered lists preserve numbering and mixed nested list ancestry", async () => {
  const [block] =
    parse(`<!-- wp:list {"ordered":true,"start":4,"reversed":true,"anchor":"passos","className":"custom-list"} -->
<ol start="4" reversed id="passos" class="wp-block-list custom-list">
<!-- wp:list-item --><li>Antes <strong>forte</strong>
<!-- wp:list --><ul class="wp-block-list"><!-- wp:list-item --><li>Dentro
<!-- wp:list {"ordered":true} --><ol class="wp-block-list"><!-- wp:list-item --><li>Fundo</li><!-- /wp:list-item --></ol><!-- /wp:list -->
</li><!-- /wp:list-item --></ul><!-- /wp:list -->Depois</li><!-- /wp:list-item -->
<!-- wp:list-item --><li>Último</li><!-- /wp:list-item --></ol><!-- /wp:list -->`);
  const { document } = await (await harnessPromise).render(block);
  const list = document.querySelector("ol");
  assert.ok(list);
  assert.equal(list.start, 4);
  assert.equal(list.reversed, true);
  assert.equal(list.id, "passos");
  assert.ok(list.classList.contains("custom-list"));
  assert.equal(list.children.length, 2);
  assert.equal(list.lastElementChild.textContent, "Último");
  const first = list.firstElementChild;
  assert.equal(first.tagName, "LI");
  assert.equal(first.querySelector("strong").textContent, "forte");
  assert.equal(first.lastChild.textContent, "Depois");
  const nested = first.querySelector(":scope > ul > li > ol > li");
  assert.equal(nested?.textContent, "Fundo");
  assert.equal(document.querySelectorAll("li").length, 4);
  assert.equal(document.querySelectorAll("ul, ol").length, 3);
});

test("mixed saved and parsed list pieces preserve outer ancestry", async () => {
  const [block] = parse(`<!-- wp:list -->
<ul class="wp-block-list"><li>Legacy before<ul><li>Nested before</li></ul></li>
<!-- wp:list-item --><li>Modern</li><!-- /wp:list-item -->
<li>Legacy after<ul><li>Nested after</li></ul></li></ul><!-- /wp:list -->`);
  const { document } = await (await harnessPromise).render(block);
  const list = document.querySelector("ul");
  assert.ok(list);
  assert.equal(list.children.length, 3);
  assert.equal(list.firstElementChild.textContent, "Legacy beforeNested before");
  assert.equal(
    list.firstElementChild.querySelector(":scope > ul > li")?.textContent,
    "Nested before",
  );
  assert.equal(list.children[1].textContent, "Modern");
  assert.equal(list.children[1].querySelector("ul"), null);
  assert.equal(list.lastElementChild.textContent, "Legacy afterNested after");
  assert.equal(
    list.lastElementChild.querySelector(":scope > ul > li")?.textContent,
    "Nested after",
  );
  assert.equal(document.querySelectorAll("li").length, 5);
});

test("reconstructed lists preserve saved wrapper and item attributes", async () => {
  const [block] = parse(`<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list saved-list" start="7" reversed id="saved-list">
<!-- wp:list-item --><li value="9" class="saved-item">Antes</li><!-- /wp:list-item -->
<!-- wp:list-item --><li>Último</li><!-- /wp:list-item --></ol>
<!-- /wp:list -->`);
  assert.deepEqual(block.attrs, { ordered: true });
  const { document } = await (await harnessPromise).render(block);
  const list = document.querySelector("ol");
  assert.equal(list?.id, "saved-list");
  assert.equal(list?.start, 7);
  assert.equal(list?.reversed, true);
  assert.ok(list?.classList.contains("saved-list"));
  assert.equal(list?.firstElementChild.value, 9);
  assert.ok(list?.firstElementChild.classList.contains("saved-item"));
  assert.equal(list?.children.length, 2);
  assert.equal(document.querySelectorAll("li").length, 2);
});

test("empty and wrapperless lists retain content without inventing list semantics", async () => {
  const harness = await harnessPromise;
  const [empty] = parse('<!-- wp:list --><ul class="wp-block-list"></ul><!-- /wp:list -->');
  const { document: emptyDocument } = await harness.render(empty);
  assert.equal(emptyDocument.querySelector("ul")?.children.length, 0);
  const [wrapperless] = parse(
    "<!-- wp:list --><!-- wp:paragraph --><p>Recuperável</p><!-- /wp:paragraph --><!-- /wp:list -->",
  );
  const { document } = await harness.render(wrapperless);
  assert.equal(document.querySelector("ul, ol"), null);
  assert.equal(document.querySelectorAll("p").length, 1);
  assert.equal(document.querySelector("p").textContent, "Recuperável");
  const [partial] = parse(
    '<!-- wp:list --><ul class="wp-block-list"><!-- wp:list-item --><li>Parcial</li><!-- /wp:list-item --><!-- /wp:list -->',
  );
  const { document: partialDocument } = await harness.render(partial);
  const partialList = partialDocument.querySelector("ul");
  assert.equal(partialList?.children.length, 1);
  assert.equal(partialList?.firstElementChild.textContent, "Parcial");
});

test("lists nested in Structured sections and quotes preserve sibling order", async () => {
  const [block] = parse(`<!-- wp:getquick/section -->
<!-- wp:paragraph --><p>Antes</p><!-- /wp:paragraph -->
<!-- wp:quote --><blockquote class="wp-block-quote"><!-- wp:list --><ul class="wp-block-list"><!-- wp:list-item --><li>Item</li><!-- /wp:list-item --></ul><!-- /wp:list --></blockquote><!-- /wp:quote -->
<!-- wp:paragraph --><p>Depois</p><!-- /wp:paragraph -->
<!-- /wp:getquick/section -->`);
  const { document } = await (await harnessPromise).render(block);
  assert.equal(document.querySelector("section blockquote > ul > li")?.textContent, "Item");
  assert.deepEqual(
    [...document.querySelectorAll("p, li")].map((element) => element.textContent),
    ["Antes", "Item", "Depois"],
  );
});

test("legacy saved HTML lists retain nested items and saved attributes without migration", async () => {
  const [block] = parse(`<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list legacy" start="7" reversed id="legado"><li value="9">Antes<ul><li>Dentro</li></ul>Depois</li><li>Último</li></ol>
<!-- /wp:list -->`);
  const { document } = await (await harnessPromise).render(block);
  const list = document.querySelector("ol");
  assert.equal(list?.id, "legado");
  assert.equal(list.start, 7);
  assert.equal(list.reversed, true);
  assert.ok(list.classList.contains("legacy"));
  assert.equal(list.children.length, 2);
  assert.equal(list.firstElementChild.value, 9);
  assert.equal(list.querySelector(":scope > li > ul > li")?.textContent, "Dentro");
  assert.equal(list.lastElementChild.textContent, "Último");
  assert.equal(document.querySelectorAll("li").length, 3);
});
