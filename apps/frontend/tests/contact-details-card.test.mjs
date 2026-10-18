import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { contactDetailsLines, contactDetailsRichLines } from "../src/lib/contact-details-card.ts";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

test.after(async () => {
  await (await harnessPromise).close();
});

function contactCard(attrs) {
  const [block] = parse(`<!-- wp:getquick/contact-details-card ${JSON.stringify(attrs)} /-->`);
  return block;
}

test("contact details split RichText line breaks into plain lines", () => {
  assert.deepEqual(
    contactDetailsLines(
      "Rua da Murgueira, 9<br>Zambujal &amp; Alfragide<br />\n<strong>2610-124</strong> Amadora",
    ),
    ["Rua da Murgueira, 9", "Zambujal & Alfragide", "2610-124 Amadora"],
  );
  assert.deepEqual(contactDetailsLines("Linha 1\n\n  Linha&nbsp;2  <br><br>"), [
    "Linha 1",
    "Linha 2",
  ]);
  assert.deepEqual(contactDetailsLines("&#x41;&#66;&bogus;"), ["AB&bogus;"]);
  assert.deepEqual(contactDetailsLines(undefined), []);
});

test("the contact details card renders icon, lines and an external button", async () => {
  const { document } = await (
    await harnessPromise
  ).render(
    contactCard({
      iconUrl: "https://example.test/icon.png",
      iconAlt: "",
      title: "Morada",
      details: "Rua da Murgueira, 9<br>2610-124 Amadora",
      buttonLabel: "Direções",
      buttonHref: "https://maps.example.test/",
    }),
  );

  const icon = document.querySelector("img");
  assert.equal(icon?.getAttribute("src"), "https://example.test/icon.png");
  assert.equal(icon?.getAttribute("alt"), "");
  const paragraphs = [...document.querySelectorAll("p")];
  assert.equal(paragraphs[0].textContent, "Morada");
  assert.equal(paragraphs[1].querySelectorAll("br").length, 1);
  assert.equal(paragraphs[1].textContent, "Rua da Murgueira, 92610-124 Amadora");
  const button = document.querySelector("a");
  assert.equal(button?.getAttribute("href"), "https://maps.example.test/");
  assert.equal(button?.getAttribute("target"), "_blank");
  assert.equal(button?.firstChild?.textContent.trim(), "Direções");
  assert.equal(button?.querySelector(".sr-only")?.textContent, "(abre numa nova janela)");
  assert.ok(button?.querySelector("svg"));
});

test("the contact details card drops an incomplete button and a missing icon", async () => {
  const { document } = await (
    await harnessPromise
  ).render(contactCard({ title: "Telefone", buttonLabel: "Ligar" }));

  assert.equal(document.querySelector("p")?.textContent, "Telefone");
  assert.equal(document.querySelector("a"), null);
  assert.equal(document.querySelector("img"), null);
});

test("an empty contact details card renders nothing", async () => {
  const { document } = await (
    await harnessPromise
  ).render(contactCard({ buttonLabel: "Direções" }));

  assert.equal(document.body.textContent.trim(), "");
});

test("the contact details card hides the icon and button when toggled off", async () => {
  const { document } = await (
    await harnessPromise
  ).render(
    contactCard({
      iconUrl: "https://example.test/icon.png",
      hideIcon: true,
      title: "Morada",
      buttonLabel: "Direções",
      buttonHref: "https://maps.example.test/",
      hideButton: true,
    }),
  );

  assert.equal(document.querySelector("p")?.textContent, "Morada");
  assert.equal(document.querySelector("img"), null);
  assert.equal(document.querySelector("a"), null);
});

test("a contact details card with only a linked button still renders", async () => {
  const { document } = await (
    await harnessPromise
  ).render(contactCard({ buttonLabel: "Enviar Email", buttonHref: "mailto:geral@apambiente.pt" }));
  const button = document.querySelector("a");

  assert.equal(button?.getAttribute("href"), "mailto:geral@apambiente.pt");
  assert.equal(button?.getAttribute("target"), null);
  assert.equal(button?.textContent.trim(), "Enviar Email");
  assert.equal(button?.querySelector(".sr-only"), null);
});

test("the contact details card drops a button whose link a browser would run as script", async () => {
  for (const buttonHref of [
    "javascript:alert(1)",
    " JavaScript:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,x",
  ]) {
    const { document } = await (
      await harnessPromise
    ).render(contactCard({ title: "Morada", buttonLabel: "Direções", buttonHref }));

    assert.equal(document.querySelector("a"), null, buttonHref);
    assert.equal(document.querySelector("p")?.textContent, "Morada");
  }
});

test("contact details keep bold and italic as runs and drop every other tag", () => {
  const plain = (text) => ({ text, bold: false, italic: false });
  assert.deepEqual(
    contactDetailsRichLines(
      "Rua <strong>da</strong> Murgueira<br><b><em>Zambujal</em> &amp;</b> <i>Alfragide</i>\n2610-124",
    ),
    [
      [plain("Rua "), { text: "da", bold: true, italic: false }, plain(" Murgueira")],
      [
        { text: "Zambujal", bold: true, italic: true },
        { text: " &", bold: true, italic: false },
        plain(" "),
        { text: "Alfragide", bold: false, italic: true },
      ],
      [plain("2610-124")],
    ],
  );
  assert.deepEqual(
    contactDetailsRichLines('<a href="javascript:x"><img src=x onerror=y>Link</a>'),
    [[plain("Link")]],
  );
  assert.deepEqual(contactDetailsRichLines("  <strong> </strong><br>"), []);
  assert.deepEqual(contactDetailsRichLines(undefined), []);
});

test("the contact details card renders bold and italic as elements and escapes the rest", async () => {
  const { document } = await (
    await harnessPromise
  ).render(
    contactCard({
      title: "<em>Morada</em> principal",
      details: 'Rua <strong>da Murgueira</strong><br><img src=x onerror="alert(1)">&lt;script&gt;',
    }),
  );

  const [title, details] = document.querySelectorAll("p");
  assert.equal(title.textContent, "Morada principal");
  assert.equal(title.querySelector("em")?.textContent, "Morada");
  assert.equal(details.querySelector("strong")?.textContent, "da Murgueira");
  assert.equal(details.querySelectorAll("br").length, 1);
  assert.equal(details.querySelector("img, script"), null);
  assert.equal(details.textContent, "Rua da Murgueira<script>");
});
