import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { readWpButtonWidth } from "../src/lib/wp-buttons.ts";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

test.after(async () => {
  await (await harnessPromise).close();
});

/** Serialized exactly as WordPress 7.1's editor saves it. */
function buttons(groupAttrs, buttonAttrs, link, wrapperClass = "wp-block-button") {
  const group = groupAttrs ? ` ${JSON.stringify(groupAttrs)}` : "";
  const button = buttonAttrs ? ` ${JSON.stringify(buttonAttrs)}` : "";
  const [block] = parse(
    `<!-- wp:buttons${group} -->\n<div class="wp-block-buttons"><!-- wp:button${button} -->\n<div class="${wrapperClass}">${link}</div>\n<!-- /wp:button --></div>\n<!-- /wp:buttons -->`,
  );
  return block;
}

async function render(block) {
  return (await (await harnessPromise).render(block)).document;
}

test("a default button is a teal pill link", async () => {
  const document = await render(
    buttons(
      null,
      null,
      '<a class="wp-block-button__link wp-element-button" href="/x/">Saber mais</a>',
    ),
  );

  const group = document.querySelector(".wp-block-buttons");
  assert.ok(group.classList.contains("justify-start"));
  const link = group.querySelector("a");
  assert.equal(link.getAttribute("href"), "/x/");
  assert.equal(link.textContent, "Saber mais");
  assert.ok(link.classList.contains("bg-main-teal-500"));
  assert.ok(link.classList.contains("rounded-[40px]"));
  assert.equal(link.getAttribute("style"), null);
  assert.equal(link.getAttribute("target"), null);
});

test("palette colours, preset font size and justification render as chosen", async () => {
  const document = await render(
    buttons(
      { layout: { type: "flex", justifyContent: "center" } },
      { backgroundColor: "main-teal-400", textColor: "main-cinza-700", fontSize: "lead" },
      '<a class="wp-block-button__link has-main-cinza-700-color has-main-teal-400-background-color has-text-color has-background has-lead-font-size has-custom-font-size wp-element-button" href="/x/">Saber mais</a>',
    ),
  );

  assert.ok(document.querySelector(".wp-block-buttons").classList.contains("justify-center"));
  assert.equal(
    document.querySelector("a").getAttribute("style"),
    "background-color: #00a499; color: #444444; font-size: 1.125rem",
  );
});

test("the Bioeconomia variation renders the prototype as a native button", async () => {
  const document = await render(
    buttons(
      null,
      { className: "is-style-bioeconomia" },
      '<a class="wp-block-button__link wp-element-button" href="">Explora a Bionomia</a>',
      "wp-block-button is-style-bioeconomia",
    ),
  );

  const button = document.querySelector(".nomia-bioeconomia-button");
  assert.ok(document.querySelector(".nomia-bioeconomia-button-wrapper"));
  assert.equal(button?.tagName, "BUTTON");
  assert.equal(button?.getAttribute("type"), "button");
  assert.equal(button?.textContent, "Explora a Bionomia");
  assert.equal(
    document.querySelector("[data-button-variant]")?.dataset.buttonVariant,
    "bioeconomia",
  );
});

test("an outline button in a vertical, right-aligned group", async () => {
  const document = await render(
    buttons(
      { layout: { type: "flex", orientation: "vertical", justifyContent: "right" } },
      { textColor: "main-ciano-700", className: "is-style-outline" },
      '<a class="wp-block-button__link has-main-ciano-700-color has-text-color wp-element-button" href="/x/">Saber mais</a>',
      "wp-block-button is-style-outline",
    ),
  );

  const group = document.querySelector(".wp-block-buttons");
  assert.ok(group.classList.contains("flex-col") && group.classList.contains("items-end"));
  const link = document.querySelector("a");
  assert.ok(link.classList.contains("bg-transparent") && link.classList.contains("border-current"));
  // The palette text colour replaces the default rather than fighting it.
  assert.ok(!link.classList.contains("text-main-teal-500!"));
  assert.equal(link.getAttribute("style"), "color: #104f4c");
  assert.equal(document.querySelector("[data-button-variant]").dataset.buttonVariant, "outline");
});

test("width presets size the button and anything else keeps its natural width", async () => {
  assert.equal(
    readWpButtonWidth({ style: { dimensions: { width: "var:preset|dimension|50" } } }),
    50,
  );
  assert.equal(readWpButtonWidth({ style: { dimensions: { width: "25%" } } }), 25);
  assert.equal(readWpButtonWidth({ style: { dimensions: { width: "320px" } } }), undefined);
  assert.equal(readWpButtonWidth({ style: { dimensions: { width: "40%" } } }), undefined);

  const document = await render(
    buttons(
      null,
      { style: { dimensions: { width: "50%" } } },
      '<a class="wp-block-button__link wp-element-button" href="/x/">Saber mais</a>',
    ),
  );
  assert.equal(
    document.querySelector(".wp-block-button").getAttribute("style"),
    "width: calc(50% - 0.75rem * 0.5)",
  );
  assert.ok(document.querySelector("a").classList.contains("w-full"));
});

test("a new-tab link keeps its target and rel", async () => {
  const document = await render(
    buttons(
      null,
      null,
      '<a class="wp-block-button__link wp-element-button" href="https://example.test/?a=1&amp;b=2" target="_blank" rel="noreferrer noopener">Abrir</a>',
    ),
  );

  const link = document.querySelector("a");
  assert.equal(link.getAttribute("href"), "https://example.test/?a=1&b=2");
  assert.equal(link.getAttribute("target"), "_blank");
  assert.equal(link.getAttribute("rel"), "noreferrer noopener");
});

test("unsafe links, stray markup and colours outside the palette are dropped", async () => {
  const document = await render(
    buttons(
      null,
      { backgroundColor: "white", textColor: "not-a-slug" },
      '<a class="wp-block-button__link wp-element-button" href="javascript:alert(1)" onclick="x()"><strong>Saber</strong> <img src=x onerror=y>mais</a>',
    ),
  );

  assert.equal(document.querySelector("a"), null);
  const label = document.querySelector(".wp-block-button span");
  assert.equal(label.innerHTML, "<strong>Saber</strong> mais");
  assert.equal(label.getAttribute("style"), null);
});

test("a button without a label renders nothing", async () => {
  const document = await render(
    buttons(null, null, '<a class="wp-block-button__link wp-element-button" href="/x/"></a>'),
  );
  assert.equal(document.querySelector(".wp-block-button"), null);
});
