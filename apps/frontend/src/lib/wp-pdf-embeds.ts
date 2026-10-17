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
