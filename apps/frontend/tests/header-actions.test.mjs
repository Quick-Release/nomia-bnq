import assert from "node:assert/strict";
import { test } from "node:test";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const block = (name, attrs = {}) => ({
  blockName: `getquick/header-${name}`,
  attrs,
  innerBlocks: [],
  innerHTML: "",
  innerContent: [],
});

test("header actions render from the real site dispatcher with safe links and accessible forms", async (t) => {
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const contact = await harness.render(block("contact"));
  assert.equal(contact.document.querySelector("a").getAttribute("href"), "/contactos/");
  assert.equal(contact.document.querySelector("a").getAttribute("aria-label"), "Contactos");
  const phone = await harness.render(
    block("contact", { href: "tel:+351210000000", label: "Telefonar" }),
  );
  assert.equal(phone.document.querySelector("a").getAttribute("href"), "tel:+351210000000");
  const unsafe = await harness.render(block("contact", { href: "javascript:alert(1)" }));
  assert.equal(unsafe.document.querySelector("a"), null);
  const search = await harness.renderBlocks(
    [
      block("search", { resultsHref: "/biblioteca/?categoria=guias&pagina=5&q=old" }),
      block("search"),
    ],
    { bare: true },
  );
  const forms = [...search.document.querySelectorAll("form")];
  assert.equal(forms.length, 2);
  assert.notEqual(forms[0].id, forms[1].id);
  assert.equal(forms[0].getAttribute("action"), "/biblioteca/");
  assert.equal(forms[1].getAttribute("action"), "/pesquisa/");
  assert.equal(forms[0].hidden, false, "form works without JavaScript");
  assert.equal(forms[0].querySelector('[name="categoria"]').value, "guias");
  assert.equal(forms[0].querySelector('[name="pagina"]'), null);
  assert.equal(forms[0].querySelectorAll('[name="q"]').length, 1);
  assert.equal(forms[0].querySelector('[name="q"]').type, "search");
  assert.equal(
    search.document.querySelector("label").htmlFor,
    forms[0].querySelector('[type="search"]').id,
  );
  const badSearch = await harness.render(block("search", { resultsHref: "tel:+351210000000" }));
  assert.equal(badSearch.document.querySelector("form"), null);
});

test("the results view renders matches, pagination, empty and unavailable states", async (t) => {
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const props = {
    query: "água",
    url: new URL("https://nomia.test/pesquisa/?q=%C3%A1gua&pagina=2"),
    result: {
      kind: "found",
      content: {
        items: [
          {
            title: "Água <script>alert(1)</script>",
            excerpt: "Recurso hídrico",
            uri: "/agua/",
            language: "pt",
          },
        ],
        total: 25,
        page: 2,
        perPage: 12,
        totalPages: 3,
      },
    },
  };
  const { document } = await harness.renderComponent(
    "/src/components/search/SearchResults.astro",
    props,
  );
  assert.equal(document.querySelector("h2 a").getAttribute("href"), "/agua/");
  assert.equal(document.querySelector("h2 script"), null);
  assert.match(document.querySelector('[role="status"]').textContent, /25 resultados/);
  assert.equal(document.querySelector('[aria-current="page"]').textContent, "2");
  assert.match(document.querySelector("nav a").getAttribute("href"), /q=%C3%A1gua/);
  const empty = await harness.renderComponent("/src/components/search/SearchResults.astro", {
    ...props,
    result: {
      kind: "found",
      content: { items: [], total: 0, page: 1, perPage: 12, totalPages: 0 },
    },
  });
  assert.match(empty.document.body.textContent, /Não foram encontrados resultados/);
  const unavailable = await harness.renderComponent("/src/components/search/SearchResults.astro", {
    ...props,
    result: { kind: "unavailable" },
  });
  assert.match(
    unavailable.document.querySelector('[role="status"]').textContent,
    /temporariamente indisponível/,
  );
});
