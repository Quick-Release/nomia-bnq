/**
 * Per-text typography overrides for `getquick/page-hero-static`.
 *
 * The registration, Gutenberg canvas and Astro renderer all use this module so
 * an editor sees the same bounded values that the public page will render.
 * Overrides are optional: when unset, the hero keeps its design-token styles.
 */

import {
  LINE_HEIGHT_SLUGS,
  isLineHeightToken,
  lineHeightTokenPx,
  type LineHeightToken,
} from "./typography-tokens.ts";

export const PAGE_HERO_TEXT_FIELDS = ["title", "subtitle"] as const;
export type PageHeroTextField = (typeof PAGE_HERO_TEXT_FIELDS)[number];

export type PageHeroTextTypography = {
  fontSize?: number;
  color?: string;
  /** A `--typography-line-height-*` token slug; only the subtitle offers it. */
  lineHeight?: LineHeightToken;
};

/**
 * `subtitleLineHeight` stores "default" or a line-height token slug. "default"
 * keeps the line height of the subtitle's `text-subtitle` class.
 */
export const PAGE_HERO_LINE_HEIGHT_DEFAULT = "default";
export const PAGE_HERO_LINE_HEIGHTS = [
  PAGE_HERO_LINE_HEIGHT_DEFAULT,
  ...LINE_HEIGHT_SLUGS,
] as const;

/** The token `text-subtitle` resolves to, named by the editor's "default" option. */
export const PAGE_HERO_SUBTITLE_LINE_HEIGHT_TOKEN: LineHeightToken = "g";

export const PAGE_HERO_FONT_SIZE_BOUNDS = {
  min: 8,
  max: 160,
} as const;

/**
 * Horizontal placement of the hero copy. It is one block-level choice, not a
 * per-text one: the title, the subtitle and the CTA move together so the hero
 * keeps reading as a single stack.
 */
export const PAGE_HERO_TEXT_ALIGNS = ["left", "center", "right"] as const;
export type PageHeroTextAlign = (typeof PAGE_HERO_TEXT_ALIGNS)[number];

/** Left is where every hero saved before this control existed already sits. */
export const PAGE_HERO_TEXT_ALIGN_DEFAULT: PageHeroTextAlign = "left";

export const PAGE_HERO_TEXT_ALIGN_ATTRIBUTE = "textAlign";

export function resolvePageHeroTextAlign(value: unknown): PageHeroTextAlign {
  const candidate = typeof value === "string" ? value.trim().toLowerCase() : "";
  return (PAGE_HERO_TEXT_ALIGNS as readonly string[]).includes(candidate)
    ? (candidate as PageHeroTextAlign)
    : PAGE_HERO_TEXT_ALIGN_DEFAULT;
}

export function readPageHeroTextAlign(attrs: unknown): PageHeroTextAlign {
  const source =
    attrs && typeof attrs === "object" && !Array.isArray(attrs)
      ? (attrs as Record<string, unknown>)
      : {};
  return resolvePageHeroTextAlign(source[PAGE_HERO_TEXT_ALIGN_ATTRIBUTE]);
}

/** The current values resolved by the hero's `text-h2` and `text-subtitle` classes. */
export const PAGE_HERO_TYPOGRAPHY_DEFAULTS: Record<
  PageHeroTextField,
  Required<Pick<PageHeroTextTypography, "fontSize" | "color">>
> = {
  title: { fontSize: 56, color: "#f0f0f0" },
  subtitle: { fontSize: 24, color: "#f0f0f0" },
};

const PAGE_HERO_COLOR_PATTERN = /^#[\da-f]{6}$/i;

export function pageHeroTextFontSizeAttribute(field: PageHeroTextField): string {
  return `${field}TextFontSize`;
}

export function pageHeroTextColorAttribute(field: PageHeroTextField): string {
  return `${field}TextColor`;
}

export function pageHeroTextLineHeightAttribute(field: PageHeroTextField): string {
  return `${field}LineHeight`;
}

/** A token slug, or `undefined` for "default" and anything unrecognised. */
export function normalizePageHeroLineHeight(value: unknown): LineHeightToken | undefined {
  return isLineHeightToken(value) ? value : undefined;
}

/** Whole pixels inside the supported range; invalid values keep the design default. */
export function normalizePageHeroFontSize(value: unknown): number | undefined {
  const raw =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(raw)) return undefined;
  const pixels = Math.round(raw);
  if (pixels < PAGE_HERO_FONT_SIZE_BOUNDS.min || pixels > PAGE_HERO_FONT_SIZE_BOUNDS.max) {
    return undefined;
  }
  return pixels;
}

/** Only opaque six-digit hex colours are allowed into the inline style. */
export function normalizePageHeroColor(value: unknown): string | undefined {
  const candidate = typeof value === "string" ? value.trim() : "";
  return PAGE_HERO_COLOR_PATTERN.test(candidate) ? candidate.toLowerCase() : undefined;
}

export function readPageHeroTextTypography(
  attrs: unknown,
  field: PageHeroTextField,
): PageHeroTextTypography {
  const source =
    attrs && typeof attrs === "object" && !Array.isArray(attrs)
      ? (attrs as Record<string, unknown>)
      : {};
  const fontSize = normalizePageHeroFontSize(source[pageHeroTextFontSizeAttribute(field)]);
  const color = normalizePageHeroColor(source[pageHeroTextColorAttribute(field)]);
  const lineHeight = normalizePageHeroLineHeight(source[pageHeroTextLineHeightAttribute(field)]);
  return {
    ...(fontSize === undefined ? {} : { fontSize }),
    ...(color === undefined ? {} : { color }),
    ...(lineHeight === undefined ? {} : { lineHeight }),
  };
}

export function readPageHeroTextTypographies(
  attrs: unknown,
): Record<PageHeroTextField, PageHeroTextTypography> {
  return {
    title: readPageHeroTextTypography(attrs, "title"),
    subtitle: readPageHeroTextTypography(attrs, "subtitle"),
  };
}

/** Inline declarations for one text, or `undefined` when it keeps its classes. */
export function pageHeroTextStyle(
  typography: PageHeroTextTypography | undefined,
): string | undefined {
  const fontSize = normalizePageHeroFontSize(typography?.fontSize);
  const color = normalizePageHeroColor(typography?.color);
  const lineHeight = normalizePageHeroLineHeight(typography?.lineHeight);
  const declarations: string[] = [];
  if (fontSize !== undefined) declarations.push(`font-size: ${fontSize}px`);
  if (color !== undefined) declarations.push(`color: ${color}`);
  if (lineHeight !== undefined) {
    declarations.push(`line-height: var(--typography-line-height-${lineHeight})`);
  }
  return declarations.length > 0 ? declarations.join("; ") : undefined;
}

/** The same safe overrides as a React style object for the Gutenberg canvas. */
export function pageHeroTextStyleProperties(
  typography: PageHeroTextTypography | undefined,
): { fontSize?: string; color?: string; lineHeight?: string } | undefined {
  const fontSize = normalizePageHeroFontSize(typography?.fontSize);
  const color = normalizePageHeroColor(typography?.color);
  const lineHeight = normalizePageHeroLineHeight(typography?.lineHeight);
  if (fontSize === undefined && color === undefined && lineHeight === undefined) return undefined;
  return {
    ...(fontSize === undefined ? {} : { fontSize: `${fontSize}px` }),
    ...(color === undefined ? {} : { color }),
    ...(lineHeight === undefined ? {} : { lineHeight: `${lineHeightTokenPx(lineHeight)}px` }),
  };
}
