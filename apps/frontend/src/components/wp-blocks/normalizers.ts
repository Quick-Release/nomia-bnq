export function wpText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  nbsp: " ",
};

/**
 * `wpText` for a field a renderer interpolates as text rather than as HTML.
 *
 * A RichText-backed attribute can hold markup — `<strong>`, a `<br>` from
 * shift+enter — even when the editor allows no formats today, because content
 * saved before that restriction is still in `post_content`. Astro escapes what
 * it interpolates, so that markup would reach the page as visible tags. The
 * editors are stopped from writing new markup at the source (see the RichText
 * fields in `PageHeroStatic.jsx`); this is what keeps the already-stored ones
 * from showing their tags.
 */
export function plainText(value: unknown): string {
  const text = wpText(value);
  if (!text.includes("<") && !text.includes("&")) return text;

  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&([a-z]+|#\d+);/gi, (entity, name: string) => {
      const decoded = HTML_ENTITIES[name.toLowerCase()];
      return decoded ?? entity;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * `plainText` for a RichText value whose line breaks are meaningful: each
 * `<br>` (or newline) ends a line, and every line comes back as plain text,
 * with empty lines dropped.
 */
export function plainTextLines(value: unknown): string[] {
  return wpText(value)
    .split(/<br\s*\/?>|\r?\n/i)
    .map((line) => plainText(line))
    .filter(Boolean);
}

export function wpNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string" || value.trim() === "") return Number.NaN;
  return Number(value);
}

export function wpBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

export function wpArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function wpObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/**
 * First non-empty trimmed string among the candidates; "" if none.
 *
 * Replaces `text(a) || text(b)` reads of legacy mirrored keys (e.g. an attr that
 * used to save both `imageSrc` and `imageUrl`). Returns a `string` so it composes
 * cleanly into required-field reads that are then guarded with `if (!x)`.
 */
export function textOr(...values: unknown[]): string {
  for (const value of values) {
    const next = wpText(value);
    if (next) return next;
  }
  return "";
}

/**
 * `textOr` that returns `undefined` when empty, for optional component props.
 *
 * The duplicate keys are no longer written by the editor (see T02), but old
 * `post_content` may still carry only the mirror key, so renderers keep this
 * fallback until that content ages out.
 */
export function optionalText(...values: unknown[]): string | undefined {
  const next = textOr(...values);
  return next || undefined;
}

/**
 * First candidate that is an array; `[]` if none. Replaces the
 * `Array.isArray(attrs.x) ? attrs.x : Array.isArray(attrs.y) ? attrs.y : []`
 * fallback used to read row lists that may be saved under a canonical key
 * (`cards`, `slices`, …) or a legacy `items` mirror.
 */
export function firstArray(...candidates: unknown[]): unknown[] {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

/**
 * Map + drop-nulls in one step: the `rows.map(validate).filter(non-null)` shape
 * used by every card/tile/slice/pane validator. `validate` receives the row index.
 */
export function mapValid<T>(
  rows: readonly unknown[],
  validate: (raw: unknown, index: number) => T | null,
): T[] {
  return rows.map(validate).filter((value): value is T => value !== null);
}

/**
 * Read a string union with a fallback. Trims the value first, so it matches
 * `text(value) === "x" ? "x" : fallback`. List every valid member in `allowed`.
 */
export function enumText<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const next = wpText(value);
  return (allowed as readonly string[]).includes(next) ? (next as T) : fallback;
}
