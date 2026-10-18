const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

// Browsers drop tabs and newlines inside a URL and ignore leading control
// characters and spaces, so "java\tscript:" and " javascript:" still run.
// eslint-disable-next-line no-control-regex -- matching control characters is the point.
const IGNORED_URL_CHARACTERS = /[\u0000- \u007f]/g;

/**
 * Returns an editor-supplied link when a browser can follow it safely, or ""
 * when it cannot.
 *
 * WordPress runs `esc_url()` over links it renders; Astro renders these blocks
 * instead, so block attributes reach `href` without that filter. Relative paths,
 * `?query` and `#fragment` links pass; absolute URLs pass only for http(s),
 * `mailto:` and `tel:`, which rejects `javascript:`, `data:` and `vbscript:`.
 */
export function safeHref(value: unknown): string {
  if (typeof value !== "string") return "";
  const href = value.trim();
  if (!href) return "";

  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(href.replace(IGNORED_URL_CHARACTERS, ""));
  if (!scheme) return href;
  return SAFE_SCHEMES.has(`${scheme[1].toLowerCase()}:`) ? href : "";
}

function safeLinkValues(value: unknown, keys: ReadonlySet<string>): unknown {
  if (Array.isArray(value)) return value.map((item) => safeLinkValues(item, keys));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      keys.has(key) && typeof item === "string" ? safeHref(item) : safeLinkValues(item, keys),
    ]),
  );
}

/**
 * Returns the block with every string under one of `keys`, at any depth of its
 * attributes, passed through `safeHref`, so an unsafe link reaches the renderer
 * as "" — the same as a link nobody filled in. Matching by key name rather than
 * path also covers the legacy arrays a renderer still reads under another name.
 */
export function withSafeLinks<Block extends { attrs?: unknown }>(
  block: Block,
  keys: readonly string[] | undefined,
): Block {
  if (!keys?.length || !block.attrs || typeof block.attrs !== "object") return block;
  return { ...block, attrs: safeLinkValues(block.attrs, new Set(keys)) };
}
