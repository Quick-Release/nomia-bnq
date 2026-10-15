/**
 * Per-field typography knowledge for `getquick/title-with-label`.
 *
 * Shared by the surfaces that have to agree on it: the structured block
 * registration (the `typography` attribute schema), the Astro renderer (inline
 * styles), the Gutenberg editor (controls, canvas preview) and the editor's
 * deprecation that migrates the retired per-field pixel attributes.
 *
 * Stored values are design-token slugs, never CSS: ADR 0013 keeps free-form CSS
 * out of post content, so an editor chooses "h4", and Astro owns what "h4" means.
 */

import { LINE_HEIGHT_TOKENS } from "./typography-tokens.ts";

export const TITLE_WITH_LABEL_FIELDS = ["label", "titleLine1", "titleLine2"] as const;

export type TitleWithLabelField = (typeof TITLE_WITH_LABEL_FIELDS)[number];

/**
 * Heading levels the title may take. h1 belongs to the page hero, and nothing
 * below h4 reads as a section title; the editor offers exactly this list.
 */
export const TITLE_WITH_LABEL_HEADING_LEVELS = [2, 3, 4] as const;

export type TitleWithLabelHeadingLevel = (typeof TITLE_WITH_LABEL_HEADING_LEVELS)[number];

export const TITLE_WITH_LABEL_DEFAULT_HEADING_LEVEL: TitleWithLabelHeadingLevel = 2;

export function normalizeTitleWithLabelHeadingLevel(value: unknown): TitleWithLabelHeadingLevel {
  const level = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return (
    TITLE_WITH_LABEL_HEADING_LEVELS.find((candidate) => candidate === level) ??
    TITLE_WITH_LABEL_DEFAULT_HEADING_LEVEL
  );
}

/**
 * The `--typography-font-size-*` tokens in apps/web/src/styles/global.css, in
 * ascending order, with the pixels each resolves to at the 16px root. The
 * pixels are only for the Gutenberg canvas (which does not load the site
 * stylesheet) and for mapping retired pixel values onto the nearest token.
 */
export const TITLE_WITH_LABEL_SIZE_TOKENS = [
  { slug: "extra", px: 12 },
  { slug: "notes", px: 14 },
  { slug: "body", px: 16 },
  { slug: "body-large", px: 20 },
  { slug: "subtitle", px: 24 },
  { slug: "h4", px: 32 },
  { slug: "h3", px: 40 },
  { slug: "h2", px: 56 },
  { slug: "h1", px: 64 },
  { slug: "large", px: 72 },
  { slug: "super", px: 88 },
] as const;

/** The `--typography-line-height-*` tokens, ascending. */
export const TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS = LINE_HEIGHT_TOKENS;

export type TitleWithLabelSizeToken = (typeof TITLE_WITH_LABEL_SIZE_TOKENS)[number]["slug"];
export type TitleWithLabelLineHeightToken =
  (typeof TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS)[number]["slug"];

export const TITLE_WITH_LABEL_SIZE_SLUGS: readonly TitleWithLabelSizeToken[] =
  TITLE_WITH_LABEL_SIZE_TOKENS.map((token) => token.slug);
export const TITLE_WITH_LABEL_LINE_HEIGHT_SLUGS: readonly TitleWithLabelLineHeightToken[] =
  TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS.map((token) => token.slug);

/**
 * One field's overrides. Every property is optional and absent means "inherit
 * the field's class-based design": an untouched field stores nothing.
 */
export type TitleWithLabelTypography = {
  size?: TitleWithLabelSizeToken;
  lineHeight?: TitleWithLabelLineHeightToken;
  bold?: true;
  italic?: true;
};

export type TitleWithLabelTypographies = Partial<
  Record<TitleWithLabelField, TitleWithLabelTypography>
>;

/**
 * Weight a bolded field takes. The title lines already sit at `font-semibold`
 * (600) and the eyebrow at `font-medium` (500), so bolding is a real step up
 * from either rather than a no-op on the headings.
 */
export const TITLE_WITH_LABEL_BOLD_FONT_WEIGHT = 700;

/** The tokens each field's classes use when nothing is overridden. */
export const TITLE_WITH_LABEL_TYPOGRAPHY_DEFAULTS: Record<
  TitleWithLabelField,
  { size: TitleWithLabelSizeToken; lineHeight: TitleWithLabelLineHeightToken }
> = {
  label: { size: "body", lineHeight: "i" },
  titleLine1: { size: "h4", lineHeight: "f" },
  titleLine2: { size: "h4", lineHeight: "f" },
};

/** JSON schema of one field's overrides, as the block contract declares it. */
export const TITLE_WITH_LABEL_FIELD_TYPOGRAPHY_SCHEMA = {
  type: "object",
  properties: {
    size: { type: "string", enum: TITLE_WITH_LABEL_SIZE_SLUGS },
    lineHeight: { type: "string", enum: TITLE_WITH_LABEL_LINE_HEIGHT_SLUGS },
    bold: { type: "boolean" },
    italic: { type: "boolean" },
  },
  additionalProperties: false,
} as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function tokenPx(
  tokens: readonly { slug: string; px: number }[],
  slug: string,
): number | undefined {
  return tokens.find((token) => token.slug === slug)?.px;
}

export function titleWithLabelSizePx(slug: TitleWithLabelSizeToken): number {
  return tokenPx(TITLE_WITH_LABEL_SIZE_TOKENS, slug) ?? 0;
}

export function titleWithLabelLineHeightPx(slug: TitleWithLabelLineHeightToken): number {
  return tokenPx(TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS, slug) ?? 0;
}

/**
 * The token closest to `px`. A tie resolves to the larger token, so a value
 * half-way between two steps never shrinks the copy it styled.
 */
function nearestToken<const T extends readonly { slug: string; px: number }[]>(
  tokens: T,
  px: number,
): T[number]["slug"] {
  let best = tokens[0];
  for (const token of tokens) {
    if (Math.abs(token.px - px) <= Math.abs(best.px - px)) best = token;
  }
  return best.slug;
}

function legacyPx(value: unknown): number | undefined {
  const raw =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(raw) && raw > 0 ? raw : undefined;
}

function legacyFlag(value: unknown): boolean {
  return value === true || value === "true";
}

/**
 * The retired schema stored free pixel values per field:
 * `<field>FontSize`, `<field>LineHeight`, `<field>Bold`, `<field>Italic`.
 */
export const TITLE_WITH_LABEL_LEGACY_ATTRIBUTES: Record<string, "number" | "boolean"> =
  Object.fromEntries(
    TITLE_WITH_LABEL_FIELDS.flatMap((field) => [
      [`${field}FontSize`, "number"],
      [`${field}LineHeight`, "number"],
      [`${field}Bold`, "boolean"],
      [`${field}Italic`, "boolean"],
    ]),
  );

export function hasTitleWithLabelLegacyTypography(attrs: unknown): boolean {
  return (
    isPlainObject(attrs) &&
    Object.keys(TITLE_WITH_LABEL_LEGACY_ATTRIBUTES).some((name) => name in attrs)
  );
}

/**
 * Map the retired pixel attributes onto tokens: each value moves to the
 * nearest step of the scale. Returns only the fields that carried something.
 */
export function migrateTitleWithLabelLegacyTypography(attrs: unknown): TitleWithLabelTypographies {
  if (!isPlainObject(attrs)) return {};
  const migrated: TitleWithLabelTypographies = {};
  for (const field of TITLE_WITH_LABEL_FIELDS) {
    const fontSize = legacyPx(attrs[`${field}FontSize`]);
    const lineHeight = legacyPx(attrs[`${field}LineHeight`]);
    const typography: TitleWithLabelTypography = {
      ...(fontSize === undefined
        ? {}
        : { size: nearestToken(TITLE_WITH_LABEL_SIZE_TOKENS, fontSize) }),
      ...(lineHeight === undefined
        ? {}
        : { lineHeight: nearestToken(TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS, lineHeight) }),
      ...(legacyFlag(attrs[`${field}Bold`]) ? { bold: true as const } : {}),
      ...(legacyFlag(attrs[`${field}Italic`]) ? { italic: true as const } : {}),
    };
    if (Object.keys(typography).length > 0) migrated[field] = typography;
  }
  return migrated;
}

/** One field's stored overrides, keeping only values the contract allows. */
export function normalizeTitleWithLabelTypography(value: unknown): TitleWithLabelTypography {
  if (!isPlainObject(value)) return {};
  const size = TITLE_WITH_LABEL_SIZE_SLUGS.find((slug) => slug === value.size);
  const lineHeight = TITLE_WITH_LABEL_LINE_HEIGHT_SLUGS.find((slug) => slug === value.lineHeight);
  return {
    ...(size === undefined ? {} : { size }),
    ...(lineHeight === undefined ? {} : { lineHeight }),
    ...(value.bold === true ? { bold: true as const } : {}),
    ...(value.italic === true ? { italic: true as const } : {}),
  };
}

/**
 * Every field's overrides from block attributes. A block that still carries the
 * retired pixel attributes (saved before the token schema and not edited since)
 * is read through the same migration the editor applies, so the published page
 * and the migrated editor always agree.
 */
export function readTitleWithLabelTypographies(
  attrs: unknown,
): Record<TitleWithLabelField, TitleWithLabelTypography> {
  const source = isPlainObject(attrs) ? attrs : {};
  const stored = isPlainObject(source.typography)
    ? source.typography
    : migrateTitleWithLabelLegacyTypography(source);
  return {
    label: normalizeTitleWithLabelTypography(stored.label),
    titleLine1: normalizeTitleWithLabelTypography(stored.titleLine1),
    titleLine2: normalizeTitleWithLabelTypography(stored.titleLine2),
  };
}

/**
 * Write one field's overrides into the block's `typography` attribute. Empty
 * fields are dropped and an empty map becomes `undefined`, which removes the
 * attribute from the serialized block instead of storing `{}`.
 */
export function withTitleWithLabelTypography(
  current: unknown,
  field: TitleWithLabelField,
  typography: TitleWithLabelTypography,
): TitleWithLabelTypographies | undefined {
  const next: TitleWithLabelTypographies = {};
  for (const name of TITLE_WITH_LABEL_FIELDS) {
    const value = normalizeTitleWithLabelTypography(
      name === field ? typography : isPlainObject(current) ? current[name] : undefined,
    );
    if (Object.keys(value).length > 0) next[name] = value;
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

/**
 * Inline declarations for one field, or `undefined` to keep the design tokens.
 * Values are `var()` references to token names from a closed list, so nothing
 * stored can reach CSS as text.
 */
export function titleWithLabelFieldStyle(
  typography: TitleWithLabelTypography | undefined,
): string | undefined {
  const { size, lineHeight, bold, italic } = normalizeTitleWithLabelTypography(typography);
  const declarations: string[] = [];
  if (size) declarations.push(`font-size: var(--typography-font-size-${size})`);
  if (lineHeight) declarations.push(`line-height: var(--typography-line-height-${lineHeight})`);
  if (bold) declarations.push(`font-weight: ${TITLE_WITH_LABEL_BOLD_FONT_WEIGHT}`);
  if (italic) declarations.push("font-style: italic");
  return declarations.length > 0 ? declarations.join("; ") : undefined;
}

/**
 * The same overrides as a React style object for the Gutenberg canvas, which
 * does not load the site stylesheet and so gets the tokens' resolved pixels.
 * Kept next to `titleWithLabelFieldStyle` so the editor preview and the
 * published page can never drift on which fields are overridden.
 */
export function titleWithLabelFieldStyleProperties(
  typography: TitleWithLabelTypography | undefined,
): { fontSize?: string; lineHeight?: string; fontWeight?: number; fontStyle?: string } | undefined {
  const { size, lineHeight, bold, italic } = normalizeTitleWithLabelTypography(typography);
  if (!size && !lineHeight && !bold && !italic) return undefined;
  return {
    ...(size ? { fontSize: `${titleWithLabelSizePx(size)}px` } : {}),
    ...(lineHeight ? { lineHeight: `${titleWithLabelLineHeightPx(lineHeight)}px` } : {}),
    ...(bold ? { fontWeight: TITLE_WITH_LABEL_BOLD_FONT_WEIGHT } : {}),
    ...(italic ? { fontStyle: "italic" } : {}),
  };
}
