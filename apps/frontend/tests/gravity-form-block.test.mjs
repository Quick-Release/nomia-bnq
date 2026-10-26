import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { CONTACT_FORM, assertAccessibleForm } from "@getquick/content/forms/testing";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

test.after(async () => {
  await (await harnessPromise).close();
});

const legal = {
  roles: [{ role: "privacy", url: "/politica-de-privacidade/", title: "Política de Privacidade" }],
};

test("a Gravity Forms block in a column renders its published form, posting to the Site", async () => {
  const [block] = parse(`<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:getquick/contact-details-card {"title":"Morada","details":"Rua 1"} /--></div>
<!-- /wp:column --><!-- wp:column -->
<div class="wp-block-column"><!-- wp:gravityforms/form {"formId":"${CONTACT_FORM.id}","title":false} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->`);
  const { document, html } = await (
    await harnessPromise
  ).renderAt("https://nomia.test/contactos/", block, {
    forms: { forms: [CONTACT_FORM], language: "pt-PT", legal },
  });

  const right = document.querySelectorAll(".wp-block-column")[1];
  const form = right.querySelector("form.gq-form__form");
  assert.ok(form, "the form renders in the right column");
  assert.equal(form.getAttribute("method"), "post");
  assert.equal(form.getAttribute("action"), `/gq/forms/${CONTACT_FORM.id}`);
  assert.equal(form.querySelector('input[name="gq_source"]').value, "/contactos/");
  assert.equal(right.querySelector(".gq-form__title"), null, "the block's title setting is kept");
  assertAccessibleForm(html);
});

test("without the page's descriptor, the block says the form is unavailable instead of rendering one", async () => {
  const [block] = parse(`<!-- wp:gravityforms/form {"formId":"${CONTACT_FORM.id}"} /-->`);
  const { document } = await (
    await harnessPromise
  ).renderAt("https://nomia.test/contactos/", block);

  assert.equal(document.querySelector("form"), null);
  assert.ok(document.querySelector(".gq-form--unavailable"));
});
