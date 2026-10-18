/**
 * The Gutenberg theme presets (`apps/cms/web/app/themes/nomia-black/theme.json`)
 * that core blocks store by slug — `backgroundColor: "main-teal-500"`,
 * `fontSize: "lead"` — resolved to the values the editor shows for them.
 *
 * Astro does not load WordPress's generated preset stylesheet, so a core block
 * renderer reads these instead. `wp-theme-presets.test.mjs` fails when this
 * copy drifts from theme.json.
 */
export const WP_THEME_COLORS: Readonly<Record<string, string>> = {
  "main-cinza-100": "#f0f0f0",
  "main-cinza-200": "#e1e1e1",
  "main-cinza-400": "#878787",
  "main-cinza-500": "#777777",
  "main-cinza-600": "#666666",
  "main-cinza-700": "#444444",
  "main-ciano-100": "#e5faf9",
  "main-ciano-200": "#caf4f2",
  "main-ciano-400": "#2ad2c9",
  "main-ciano-500": "#209e97",
  "main-ciano-600": "#156965",
  "main-ciano-700": "#104f4c",
  "main-teal-100": "#e0f4f3",
  "main-teal-200": "#c0e9e6",
  "main-teal-400": "#00a499",
  "main-teal-500": "#007b73",
  "main-teal-600": "#00524d",
  "main-teal-700": "#003333",
  "main-botanico-100": "#f4faec",
  "main-botanico-200": "#e9f5d8",
  "main-botanico-400": "#a4d663",
  "main-botanico-500": "#90bc57",
  "main-botanico-600": "#7ba14b",
  "main-botanico-700": "#67863f",
  "main-laranja-100": "#fef4e0",
  "main-laranja-200": "#fde9c0",
  "main-laranja-400": "#f7a600",
  "main-laranja-500": "#d99200",
  "main-laranja-600": "#ba7d00",
  "main-laranja-700": "#7c5300",
  "monochorme-light-100": "#eeeeee",
  "monochorme-light-200": "#eaeaea",
  "monochorme-light-400": "#dddddd",
  "monochorme-light-500": "#d5d5d5",
  "monochorme-light-600": "#cccccc",
  "monochorme-grey-100": "#969696",
  "monochorme-grey-200": "#939393",
  "monochorme-grey-400": "#878787",
  "monochorme-grey-500": "#808080",
  "monochorme-grey-600": "#787878",
  "monochorme-dark-100": "#323232",
  "monochorme-dark-200": "#2d2d2d",
  "monochorme-dark-400": "#282828",
  "monochorme-dark-500": "#232323",
  "monochorme-dark-600": "#1e1e1e",
};

export const WP_THEME_FONT_SIZES: Readonly<Record<string, string>> = {
  body: "1rem",
  lead: "1.125rem",
  "heading-sm": "1.5rem",
  "heading-md": "2rem",
  "heading-lg": "2.75rem",
};

/** A palette colour for a stored slug, or `undefined` for anything else. */
export function wpThemeColor(slug: unknown): string | undefined {
  return typeof slug === "string" ? WP_THEME_COLORS[slug] : undefined;
}

/** A preset font size for a stored slug, or `undefined` for anything else. */
export function wpThemeFontSize(slug: unknown): string | undefined {
  return typeof slug === "string" ? WP_THEME_FONT_SIZES[slug] : undefined;
}
