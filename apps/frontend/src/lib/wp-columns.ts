/**
 * Presentation classes for `core/columns` and `core/column`.
 *
 * WordPress's block-library stylesheet is not loaded (ADR 0013), so the Astro
 * renderers rebuild each wrapper from the block attributes instead of echoing
 * the saved tag: only the choices styled in `src/styles/global.css` reach the
 * page, and anything else an editor might have stored is dropped.
 */

const COLUMNS_VERTICAL_ALIGNMENTS = ["top", "center", "bottom"] as const;
const COLUMN_VERTICAL_ALIGNMENTS = ["top", "center", "bottom", "stretch"] as const;
const WIDTH_PATTERN = /^\d{1,4}(?:\.\d{1,4})?(?:%|px|em|rem|vw)$/;

type Attrs = Record<string, unknown> | null | undefined;

function stringAttr(attrs: Attrs, name: string): string | undefined {
  const value = attrs?.[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.find((candidate) => candidate === value);
}

export function wpColumnsWrapper(attrs: Attrs) {
  const verticalAlignment = oneOf(
    stringAttr(attrs, "verticalAlignment"),
    COLUMNS_VERTICAL_ALIGNMENTS,
  );
  return {
    classNames: [
      "wp-block-columns",
      verticalAlignment ? `are-vertically-aligned-${verticalAlignment}` : null,
      attrs?.isStackedOnMobile === false ? "is-not-stacked-on-mobile" : null,
      stringAttr(attrs, "className"),
    ],
    id: stringAttr(attrs, "anchor"),
  };
}

export function wpColumnWrapper(attrs: Attrs) {
  const verticalAlignment = oneOf(
    stringAttr(attrs, "verticalAlignment"),
    COLUMN_VERTICAL_ALIGNMENTS,
  );
  const width = stringAttr(attrs, "width");
  return {
    classNames: [
      "wp-block-column",
      verticalAlignment ? `is-vertically-aligned-${verticalAlignment}` : null,
      stringAttr(attrs, "className"),
    ],
    id: stringAttr(attrs, "anchor"),
    style: width && WIDTH_PATTERN.test(width) ? `flex-basis:${width}` : undefined,
  };
}
