import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { wpColumnWrapper, wpColumnsWrapper } from "../src/lib/wp-columns.ts";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

test.after(async () => {
  await (await harnessPromise).close();
});

test("column wrappers keep supported choices and drop everything else", () => {
  assert.deepEqual(
    wpColumnsWrapper({
      verticalAlignment: "center",
      isStackedOnMobile: false,
      anchor: "contactos",
    }),
    {
      classNames: [
        "wp-block-columns",
        "are-vertically-aligned-center",
        "is-not-stacked-on-mobile",
        undefined,
      ],
      id: "contactos",
    },
  );
  assert.deepEqual(wpColumnsWrapper({ verticalAlignment: "stretch" }).classNames, [
    "wp-block-columns",
    null,
    null,
    undefined,
  ]);
  assert.equal(wpColumnWrapper({ width: "33.33%" }).style, "flex-basis:33.33%");
  assert.equal(wpColumnWrapper({ width: "50%;background:red" }).style, undefined);
  assert.equal(wpColumnWrapper({ width: 50 }).style, undefined);
});

test("columns own their columns and each column owns its blocks", async () => {
  const [block] = parse(`<!-- wp:columns {"verticalAlignment":"center"} -->
<div class="wp-block-columns are-vertically-aligned-center"><!-- wp:column {"width":"66.66%"} -->
<div class="wp-block-column" style="flex-basis:66.66%"><!-- wp:paragraph -->
<p>Esquerda</p>
<!-- /wp:paragraph --><!-- wp:heading -->
<h2 class="wp-block-heading">Título</h2>
<!-- /wp:heading --></div>
<!-- /wp:column --><!-- wp:column -->
<div class="wp-block-column"><!-- wp:getquick/contact-details-card {"title":"Morada","details":"Rua 1"} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->`);
  const { document } = await (await harnessPromise).render(block);
  const columns = document.querySelector(".wp-block-columns");

  assert.ok(columns);
  assert.ok(columns.classList.contains("are-vertically-aligned-center"));
  assert.equal(columns.children.length, 2);
  const [left, right] = columns.children;
  assert.ok(left.classList.contains("wp-block-column"));
  assert.equal(left.getAttribute("style"), "flex-basis:66.66%");
  assert.deepEqual(
    [...left.querySelectorAll("p, h2")].map((element) => element.textContent),
    ["Esquerda", "Título"],
  );
  assert.ok(right.classList.contains("wp-block-column"));
  assert.equal(right.getAttribute("style"), null);
  assert.equal(right.querySelector("p")?.textContent, "Morada");
});

test("wrapperless columns keep their content without inventing a layout", async () => {
  const [block] = parse(
    "<!-- wp:columns --><!-- wp:paragraph --><p>Recuperável</p><!-- /wp:paragraph --><!-- /wp:columns -->",
  );
  const { document } = await (await harnessPromise).render(block);

  assert.equal(document.querySelector(".wp-block-columns"), null);
  assert.equal(document.querySelector("p")?.textContent, "Recuperável");
});
