import { safeHref } from "./safe-href";

const WP_FILE_BLOCK_RE =
  /<(?<tag>figure|div)\b(?<attrs>[^>]*)class=(["'])[^"']*\bwp-block-file\b[^"']*\3[^>]*>(?<body>[\s\S]*?)<\/\k<tag>>/gi;
const PDF_LINK_RE = /<a\b[^>]*\bhref=(["'])(?<href>[^"']+\.pdf(?:[?#][^"']*)?)\1[^>]*>/i;
const PDF_LINK_WITH_TEXT_RE =
  /<a\b[^>]*\bhref=(["'])(?<href>[^"']+\.pdf(?:[?#][^"']*)?)\1[^>]*>(?<label>[\s\S]*?)<\/a>/i;
const EXISTING_EMBED_RE = /<(object|iframe|embed)\b/i;
const EMBED_OPEN_TAG_RE = /<(object|iframe|embed)\b[^>]*>/gi;
const PDF_EMBED_HINT_RE = /\bwp-block-file__embed\b|application\/pdf|\.pdf(?:[?#][^"'\s>]*)?/i;
const WP_INTERACTIVITY_HIDDEN_RE = /\s+data-wp-bind--hidden=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const HIDDEN_ATTR_RE = /\s+hidden(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi;

function pdfEmbedMarkup(href: string): string {
  return `<object class="wp-block-file__embed" data="${href}" type="application/pdf" aria-label="PDF incorporado"><p><a href="${href}">Abrir PDF</a></p></object>`;
}

function pdfButtonMarkup(href: string): string {
  return `<p class="cpt-pdf-action"><a class="cpt-pdf-action__button" href="${href}" target="_blank" rel="noopener noreferrer">Descarregar PDF</a></p>`;
}

function revealExistingPdfEmbeds(blockHtml: string): string {
  return blockHtml.replace(EMBED_OPEN_TAG_RE, (tag) => {
    if (!PDF_EMBED_HINT_RE.test(tag)) return tag;

    return tag.replace(WP_INTERACTIVITY_HIDDEN_RE, "").replace(HIDDEN_ATTR_RE, "");
  });
}

export function addDefaultPdfEmbeds(contentHtml: string | null): string | null {
  if (!contentHtml?.trim()) return contentHtml;

  return contentHtml.replace(
    WP_FILE_BLOCK_RE,
    (block, _tag, _attrs, _quote, _body, _offset, _string, groups) => {
      const body = typeof groups?.body === "string" ? groups.body : "";
      if (EXISTING_EMBED_RE.test(body)) return revealExistingPdfEmbeds(block);

      const href = body.match(PDF_LINK_RE)?.groups?.href;
      if (!href) return block;

      return block.replace(body, `${pdfEmbedMarkup(href)}${body}`);
    },
  );
}

export function replacePdfFileBlocksWithButtons(contentHtml: string | null): string | null {
  if (!contentHtml?.trim()) return contentHtml;

  return contentHtml.replace(
    WP_FILE_BLOCK_RE,
    (block, _tag, _attrs, _quote, _body, _offset, _string, groups) => {
      const body = typeof groups?.body === "string" ? groups.body : "";
      const href = body.match(PDF_LINK_WITH_TEXT_RE)?.groups?.href;
      if (!href) return block;

      return pdfButtonMarkup(href);
    },
  );
}

const EMBED_ELEMENT_RE = /<(object|iframe|embed)\b[^>]*>(?:[\s\S]*?<\/\1>)?/gi;
const FILE_LINK_TEXT_RE = /<a\b(?![^>]*\bwp-block-file__button\b)[^>]*>(?<text>[^<]*)<\/a>/i;
const HAS_FILE_BUTTON_RE = /\bwp-block-file__button\b/i;
const ID_ATTR_RE = /\bid=(["'])(?<id>[^"']+)\1/i;

function pdfFrameMarkup(href: string, name: string): string {
  const title = `PDF: ${name || "documento"}`.replace(/"/g, "&quot;");
  return `<iframe class="wp-block-file__embed" src="${href}" title="${title}" loading="lazy"></iframe>`;
}

/**
 * Shows a PDF's file block in the page: the PDF opens in the browser's own
 * viewer in an iframe, above the download button, which stays as the
 * fallback where a browser can't show it (most phones). The file's name is
 * no longer shown: it stays for screen readers only, as the download
 * button's description (its `aria-describedby`). A block without a download
 * button keeps the name's link, its only way to the file. WordPress's
 * own embed is an <object> its script unhides; the proxy's CSP allows frames
 * from the media host and no <object> (object-src 'none'), so it is replaced.
 * A link whose scheme isn't safe (`javascript:…pdf`) gets no frame.
 */
export function embedPdfFileBlocks(contentHtml: string): string {
  if (!contentHtml.trim()) return contentHtml;

  return contentHtml.replace(
    WP_FILE_BLOCK_RE,
    (block, _tag, _attrs, _quote, _body, _offset, _string, groups) => {
      const body = typeof groups?.body === "string" ? groups.body : "";
      const href = safeHref(body.match(PDF_LINK_RE)?.groups?.href);
      if (!href || /<iframe\b[^>]*\bwp-block-file__embed\b/i.test(body)) return block;

      let links = body.replace(EMBED_ELEMENT_RE, "");
      const nameLink = links.match(FILE_LINK_TEXT_RE);
      const name = nameLink?.groups?.text?.trim() ?? "";
      if (nameLink && HAS_FILE_BUTTON_RE.test(links)) {
        const id = nameLink[0].match(ID_ATTR_RE)?.groups?.id;
        const hidden = id ? `<span id="${id}" class="sr-only">${name}</span>` : "";
        links = links.replace(nameLink[0], () => hidden);
      }
      return block.replace(body, () => `${pdfFrameMarkup(href, name)}${links}`);
    },
  );
}
