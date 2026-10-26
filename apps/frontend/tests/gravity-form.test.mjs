import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { formStateCookie } from "@getquick/content/forms";
import {
  assertAccessibleForm,
  CONTACT_FORM,
  UNAVAILABLE_FORM,
} from "@getquick/content/forms/testing";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

test.after(async () => {
  await (await harnessPromise).close();
});

const LEGAL = {
  roles: [
    { role: "privacy_policy", url: "/politica-de-privacidade/", title: "Política de Privacidade" },
  ],
};

// /contactos/ (page 897) as saved: the contact cards beside form 1, whose
// formId Gravity Forms' block stores as a string.
const CONTACTOS = parse(
  `<!-- wp:columns --><div class="wp-block-columns"><!-- wp:column --><div class="wp-block-column">` +
    `<!-- wp:getquick/contact-details-card {"title":"Email","details":"geral@apambiente.pt"} /--></div><!-- /wp:column -->` +
    `<!-- wp:column --><div class="wp-block-column"><!-- wp:gravityforms/form {"formId":"1","title":false,"description":false} /--></div><!-- /wp:column --></div><!-- /wp:columns -->`,
);

async function pageForms(url, cookie = null, descriptors = [CONTACT_FORM]) {
  const harness = await harnessPromise;
  const { pageForms } = await harness.loadModule("/src/lib/forms.ts");
  return pageForms({ descriptors, url: new URL(url), cookie, language: "pt-PT", legal: LEGAL });
}

async function renderContactos(forms) {
  return (await harnessPromise).renderComponent("/src/components/wp-blocks/WpBlock.astro", {
    block: CONTACTOS[0],
    forms,
  });
}

test("form 1 renders beside the contact cards as a plain form posting to the Site", async () => {
  const { forms, setCookies } = await pageForms("https://nomia.test/contactos/");
  assert.deepEqual(setCookies, []);
  const { document, html } = await renderContactos(forms);

  const [cards, formColumn] = document.querySelectorAll(".wp-block-column");
  assert.ok(cards.textContent.includes("geral@apambiente.pt"));
  const form = formColumn.querySelector(".nomia-form form.gq-form__form");
  assert.ok(form, "the form renders server-side");
  assert.equal(form.getAttribute("method"), "post");
  assert.equal(form.getAttribute("action"), "/gq/forms/1");
  assert.equal(form.querySelector('input[name="gq_source"]').value, "/contactos/");
  for (const name of ["input_1_3", "input_2", "input_3", "input_4", "input_5_1"]) {
    assert.ok(form.querySelector(`[name="${name}"]`), `${name} renders`);
  }
  // Gravity Forms' honeypot, kept out of sight and out of the tab order.
  const honeypot = form.querySelector('.gq-form__hp[aria-hidden="true"] input[name="input_6"]');
  assert.equal(honeypot?.getAttribute("tabindex"), "-1");
  // The block hides the title and description, as Gravity Forms' own render would.
  assert.equal(formColumn.querySelector(".gq-form__title"), null);
  assert.equal(formColumn.querySelector(".gq-form__intro"), null);
  // The consent links to the page language's privacy policy (LEGAL-1).
  assert.equal(
    form.querySelector(".gq-form__policy").getAttribute("href"),
    "/politica-de-privacidade/",
  );
  // Nothing from Gravity Forms or any other origin: no script, stylesheet or absolute URL.
  assert.equal(formColumn.querySelectorAll("script, link, style, iframe").length, 0);
  assert.doesNotMatch(formColumn.innerHTML, /https?:\/\/|gform|gravityforms/);
  assertAccessibleForm(html);
});

test("the redirect back after a post shows the outcome once and clears it", async () => {
  const state = {
    formId: 1,
    status: "invalid",
    errors: { 2: "email" },
    messages: {},
    values: { input_2: "nope" },
  };
  const cookie = formStateCookie(state, { secure: true }).split(";")[0];
  const { forms, setCookies } = await pageForms("https://nomia.test/contactos/?gq-form=1", cookie);
  assert.equal(setCookies.length, 1);
  assert.match(setCookies[0], /Max-Age=0/i);

  const { document, html } = await renderContactos(forms);
  assert.ok(document.querySelector('.gq-form__errors[role="alert"]'));
  assert.equal(document.querySelector('[name="input_2"]').getAttribute("aria-invalid"), "true");
  assert.equal(document.querySelector('[name="input_2"]').value, "nope");
  assertAccessibleForm(html);
});

test("without the form's descriptor the block shows a status, not a form that can't be sent", async () => {
  for (const descriptors of [[], [{ ...UNAVAILABLE_FORM, id: 1 }]]) {
    const { forms } = await pageForms("https://nomia.test/contactos/", null, descriptors);
    const { document } = await renderContactos(forms);
    assert.equal(document.querySelector("form"), null);
    assert.ok(document.querySelector('.gq-form--unavailable [role="status"]'));
  }
  const { document } = await renderContactos(null);
  assert.equal(document.querySelector("form"), null);
  assert.ok(document.querySelector('.gq-form--unavailable [role="status"]'));
});
