/**
 * Gutenberg block alignment.
 *
 * The align button stores its choice in the block's `align` attribute and, in
 * the markup WordPress saves, as an `align*` class on the block element. The
 * layout each class stands for lives in `src/styles/nomia-theme.css`; this module
 * only turns the stored attribute back into that class, for the renderers that
 * build their own element instead of passing the saved markup through.
 */
export const WP_ALIGNMENTS = ["left", "center", "right", "wide", "full"] as const;
export type WpAlignment = (typeof WP_ALIGNMENTS)[number];

/** `null` for no alignment, which is the unset default and needs no class. */
export function wpAlignmentClass(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const alignment = value.trim().toLowerCase();
  return (WP_ALIGNMENTS as readonly string[]).includes(alignment) ? `align${alignment}` : null;
}
