import { describe, expect, it } from "vite-plus/test";
import { embedPdfFileBlocks } from "./wp-pdf-embeds";

const pdf = "https://nomia-media.bnq.pt/uploads/2026/11/agendas.pdf";
// As WordPress renders core/file: its hidden inline embed, the file's link and the download button.
const fileBlock = (href: string) =>
  `<div data-wp-interactive="core/file" class="wp-block-file"><object data-wp-bind--hidden="!state.hasPdfPreview" hidden class="wp-block-file__embed" data="${href}" type="application/pdf" style="width:100%;height:600px"></object><a id="f" href="${href}">agendas</a><a href="${href}" class="wp-block-file__button wp-element-button" download aria-describedby="f">Descarregar</a></div>`;

describe("embedPdfFileBlocks", () => {
  it("shows the PDF in an iframe in place of WordPress's hidden object, above Descarregar, its name for screen readers only", () => {
    const html = embedPdfFileBlocks(`<p>Texto</p>${fileBlock(pdf)}`);
    expect(html).toBe(
      `<p>Texto</p><div data-wp-interactive="core/file" class="wp-block-file"><iframe class="wp-block-file__embed" src="${pdf}" title="PDF: agendas" loading="lazy"></iframe><span id="f" class="sr-only">agendas</span><a href="${pdf}" class="wp-block-file__button wp-element-button" download aria-describedby="f">Descarregar</a></div>`,
    );
  });

  it("embeds a PDF whose block had no embed", () => {
    const html = embedPdfFileBlocks(
      `<div class="wp-block-file"><a href="${pdf}">agendas</a></div>`,
    );
    expect(html).toContain(
      `<iframe class="wp-block-file__embed" src="${pdf}" title="PDF: agendas"`,
    );
  });

  it("leaves other files, other blocks and unsafe links alone", () => {
    const docx = fileBlock("https://nomia-media.bnq.pt/uploads/a.docx");
    expect(embedPdfFileBlocks(docx)).toBe(docx);
    expect(embedPdfFileBlocks(`<p><a href="${pdf}">PDF</a></p>`)).toBe(
      `<p><a href="${pdf}">PDF</a></p>`,
    );
    const script = fileBlock("javascript:alert(1)//.pdf");
    expect(embedPdfFileBlocks(script)).toBe(script);
  });

  it("keeps a URL with $ sequences as it is, and embeds once", () => {
    const dollars = "https://nomia-media.bnq.pt/uploads/$&-$1.pdf";
    expect(embedPdfFileBlocks(fileBlock(dollars))).toContain(`src="${dollars}"`);
    const once = embedPdfFileBlocks(fileBlock(pdf));
    expect(embedPdfFileBlocks(once)).toBe(once);
  });
});
