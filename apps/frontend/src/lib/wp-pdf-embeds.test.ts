import { describe, expect, it } from "vite-plus/test";
import { addPdfPreviewButtons } from "./wp-pdf-embeds";

const pdf = "https://nomia-media.bnq.pt/uploads/2026/11/agendas.pdf";
// As WordPress renders core/file with its inline embed and download button.
const fileBlock = (href: string, button = true) =>
  `<div data-wp-interactive="core/file" class="wp-block-file"><object data-wp-bind--hidden="!state.hasPdfPreview" hidden class="wp-block-file__embed" data="${href}" type="application/pdf"></object><a id="f" href="${href}">agendas</a>${
    button
      ? `<a href="${href}" class="wp-block-file__button wp-element-button" download aria-describedby="f">Descarregar</a>`
      : ""
  }</div>`;

describe("addPdfPreviewButtons", () => {
  it("puts a Pré-visualizar button, opening the PDF in a new tab, before Descarregar", () => {
    const html = addPdfPreviewButtons(`<p>Texto</p>${fileBlock(pdf)}`);
    expect(html).toContain(
      `<a id="f" href="${pdf}">agendas</a><a class="wp-block-file__button wp-block-file__preview wp-element-button" href="${pdf}" target="_blank" rel="noopener noreferrer" aria-describedby="f">Pré-visualizar</a><a href="${pdf}" class="wp-block-file__button`,
    );
    expect(html.startsWith("<p>Texto</p>")).toBe(true);
  });

  it("adds it after the file's link when the block has no download button", () => {
    expect(addPdfPreviewButtons(fileBlock(pdf, false))).toContain(
      `agendas</a><a class="wp-block-file__button wp-block-file__preview`,
    );
  });

  it("leaves other files, other blocks and an already-previewed block alone", () => {
    const docx = fileBlock("https://nomia-media.bnq.pt/uploads/a.docx");
    expect(addPdfPreviewButtons(docx)).toBe(docx);
    expect(addPdfPreviewButtons(`<p><a href="${pdf}">PDF</a></p>`)).toBe(
      `<p><a href="${pdf}">PDF</a></p>`,
    );
    const script = fileBlock("javascript:alert(1)//.pdf");
    expect(addPdfPreviewButtons(script)).toBe(script);
    const dollars = fileBlock("https://nomia-media.bnq.pt/uploads/$&-$1.pdf");
    expect(addPdfPreviewButtons(dollars)).toContain(
      `href="https://nomia-media.bnq.pt/uploads/$&-$1.pdf" target="_blank"`,
    );
    const once = addPdfPreviewButtons(fileBlock(pdf));
    expect(addPdfPreviewButtons(once)).toBe(once);
  });
});
