import assert from "node:assert/strict";
import { after, test } from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();
after(async () => (await harnessPromise).close());

const row = {
  href: "/biblioteca/documento/plasticos/",
  title: "Estratégia Europeia para os Plásticos",
  imageSrc: null,
  imageAlt: "",
  year: 2018,
  publisher: "Comissão Europeia",
  description: "A primeira estratégia europeia para os plásticos.",
  fileUrl: "https://example.org/document.pdf",
  pageUrl: "https://example.org/document/",
};

test("document cards show metadata, independent PDF/page actions, and the exact image fallback", async () => {
  const harness = await harnessPromise;
  const { document } = await harness.renderComponent(
    "/src/components/content-lists/listing/NomiaContentListing.astro",
    {
      display: "document-grid",
      rows: [row, { ...row, imageSrc: "https://example.org/cover.jpg", imageAlt: "Capa" }],
      empty: "none",
    },
  );
  const cards = [...document.querySelectorAll("article")];
  assert.equal(cards.length, 2);
  assert.equal(cards[0].querySelector("h2").textContent.trim(), row.title);
  assert.match(cards[0].textContent, /2018/);
  assert.match(cards[0].textContent, /Publicado por: Comissão Europeia/);
  assert.match(cards[0].textContent, /A primeira estratégia europeia/);
  assert.match(cards[0].textContent, /image not available/);
  assert.equal(cards[0].querySelector("img"), null);
  assert.ok(cards[0].querySelector(`a[href='${row.fileUrl}']`));
  assert.ok(cards[0].querySelector(`a[href='${row.pageUrl}']`));
  assert.equal(cards[1].querySelector("img").alt, "Capa");
  assert.doesNotMatch(cards[1].textContent, /image not available/);
  assert.ok(document.querySelector("ul.lg\\:grid-cols-3"));
});

test("document cards escape descriptions and omit unsafe attachment links", async () => {
  const { document } = await (
    await harnessPromise
  ).renderComponent("/src/components/content-lists/listing/NomiaContentListing.astro", {
    display: "document-grid",
    rows: [
      {
        ...row,
        description: "<script>alert(1)</script>",
        fileUrl: "javascript:alert(1)",
        pageUrl: "data:text/html,bad",
      },
    ],
    empty: "none",
  });
  assert.equal(document.querySelector("script"), null);
  assert.equal(document.querySelectorAll("article a").length, 1);
});

test("the document editor uses a year selector and saves description and independent links", async () => {
  let render;
  const edits = {};
  const components = Object.fromEntries(
    ["Button", "SelectControl", "TextControl", "TextareaControl"].map((name) => [name, name]),
  );
  const meta = { year: 2018, author: "Comissão Europeia", fileUrl: "old.pdf", pageUrl: "old-page" };
  const script = await readFile(
    new URL("../../cms/web/app/plugins/gq-bioeconomia/assets/library-details.js", import.meta.url),
    "utf8",
  );
  vm.runInNewContext(script, {
    window: {
      gqBioeconomiaLibraryDetails: {
        metaKeys: { year: "year", author: "author", fileUrl: "fileUrl", pageUrl: "pageUrl" },
        yearMin: 1000,
        yearMax: 2027,
      },
      wp: {
        blockEditor: { MediaUpload: "MediaUpload", MediaUploadCheck: "MediaUploadCheck" },
        components,
        coreData: {
          useEntityProp: (_kind, _type, property) => [
            property === "meta" ? meta : "Descrição antiga",
            (value) => {
              edits[property] = value;
            },
          ],
        },
        data: { useSelect: () => "biblioteca" },
        editor: { PluginDocumentSettingPanel: "Panel" },
        element: {
          Fragment: "Fragment",
          createElement: (type, props, ...children) => ({ type, props, children }),
        },
        i18n: { __: (text) => text },
        plugins: {
          registerPlugin: (_name, plugin) => {
            render = plugin.render;
          },
        },
      },
    },
  });
  const panel = render();
  const year = panel.children.find((node) => node.type === "SelectControl");
  assert.equal(year.props.value, "2018");
  assert.ok(year.props.options.some((option) => option.value === "2018"));
  assert.ok(
    year.props.options.every((option) => option.value === "" || /^\d{4}$/.test(option.value)),
  );
  year.props.onChange("2020");
  assert.equal(edits.meta.year, 2020);
  panel.children.find((node) => node.type === "TextareaControl").props.onChange("Nova descrição");
  assert.equal(edits.excerpt, "Nova descrição");
  panel.children
    .find((node) => node.props?.label === "Ligação para a página")
    .props.onChange("https://example.org/new/");
  assert.equal(edits.meta.pageUrl, "https://example.org/new/");
  assert.equal(edits.meta.fileUrl, "old.pdf");
  const upload = panel.children.find((node) => node.type === "MediaUploadCheck").children[0];
  assert.equal(upload.props.allowedTypes[0], "application/pdf");
  upload.props.onSelect({ url: "https://example.org/new.pdf" });
  assert.equal(edits.meta.fileUrl, "https://example.org/new.pdf");
  assert.equal(edits.meta.pageUrl, "old-page");
});
