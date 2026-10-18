/**
 * The Gutenberg presets core blocks store by slug (`backgroundColor:
 * "ciano-500"`, `fontSize: "lead"`), as the CSS variables WordPress names
 * them by. The colors are GQ Design's palette (GETQUICK → Design → Branding →
 * Colors), whose `--wp--preset--color--<slug>` values the Nomia block renderer defines from
 * the stored design presets; a slug the palette lacks resolves to nothing, as
 * it would in WordPress.
 */
const validSlug = (slug: unknown): slug is string =>
  typeof slug === "string" && /^[a-z0-9][a-z0-9-]*$/.test(slug);

/** A palette colour for a stored slug, or `undefined` for anything else. */
export function wpThemeColor(slug: unknown): string | undefined {
  return validSlug(slug) ? `var(--wp--preset--color--${slug})` : undefined;
}

/** A preset font size for a stored slug, or `undefined` for anything else. */
export function wpThemeFontSize(slug: unknown): string | undefined {
  return validSlug(slug) ? `var(--wp--preset--font-size--${slug})` : undefined;
}
