/**
 * The design system's `--typography-line-height-*` tokens (`src/styles/nomia-theme.css`),
 * ascending, with their pixel value at a 16px root.
 *
 * Blocks store the slug, never a measurement (ADR 0013): Astro emits
 * `var(--typography-line-height-<slug>)`, and the Gutenberg canvas, which cannot
 * read the site's stylesheet, previews the pixel value.
 */
export const LINE_HEIGHT_TOKENS = [
  { slug: "j", px: 16 },
  { slug: "i", px: 24 },
  { slug: "h", px: 32 },
  { slug: "g", px: 40 },
  { slug: "f", px: 48 },
  { slug: "e", px: 64 },
  { slug: "d", px: 80 },
  { slug: "c", px: 88 },
  { slug: "b", px: 96 },
  { slug: "a", px: 112 },
] as const;

export type LineHeightToken = (typeof LINE_HEIGHT_TOKENS)[number]["slug"];

export const LINE_HEIGHT_SLUGS: readonly LineHeightToken[] = LINE_HEIGHT_TOKENS.map(
  (token) => token.slug,
);

export function isLineHeightToken(value: unknown): value is LineHeightToken {
  return typeof value === "string" && (LINE_HEIGHT_SLUGS as readonly string[]).includes(value);
}

export function lineHeightTokenPx(slug: LineHeightToken): number {
  return LINE_HEIGHT_TOKENS.find((token) => token.slug === slug)?.px ?? 0;
}
