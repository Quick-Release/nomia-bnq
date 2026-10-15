interface Preset {
  slug: string;
}

const validSlug = (slug: string) => /^[a-z0-9][a-z0-9-]*$/.test(slug);
/** A CSS value safe inside a stylesheet: a color or length, nothing that ends a rule. */
const safeValue = (value: string) => /^[#(),.%\w\s-]+$/.test(value);

/**
 * WordPress preset classes need the CMS palette as well as CSS variables.
 * `scope` is the content's container (`.prose-wp`, or `.nomia-blocks` for
 * content built with Nomia's blocks).
 */
export function blockPresetStyles(
  spacingSizes: Array<Preset & { size: string }>,
  colors: Array<Preset & { color: string }>,
  scope = ".prose-wp",
) {
  const vars: Record<string, string> = {};
  const colorRules: string[] = [];

  for (const { slug, size } of spacingSizes) {
    if (validSlug(slug)) vars[`--wp--preset--spacing--${slug}`] = size;
  }

  for (const { slug, color } of colors) {
    if (!validSlug(slug)) continue;
    vars[`--wp--preset--color--${slug}`] = color;
    colorRules.push(
      `${scope} .has-${slug}-color{color:var(--wp--preset--color--${slug})}`,
      `${scope} .has-${slug}-background-color{background-color:var(--wp--preset--color--${slug})}`,
      `${scope} .has-${slug}-color.has-link-color a{color:var(--wp--preset--color--${slug})}`,
    );
  }

  return { vars, colorRules: colorRules.join("\n") };
}

/**
 * GQ Design's presets as WordPress defines them, on `:root`: every page's
 * styles (Nomia's design tokens among them) read the palette from these
 * variables.
 */
export function presetRootStyle(
  spacingSizes: Array<Preset & { size: string }>,
  colors: Array<Preset & { color: string }>,
) {
  const declarations = [
    ...spacingSizes
      .filter(({ slug, size }) => validSlug(slug) && safeValue(size))
      .map(({ slug, size }) => `--wp--preset--spacing--${slug}:${size}`),
    ...colors
      .filter(({ slug, color }) => validSlug(slug) && safeValue(color))
      .map(({ slug, color }) => `--wp--preset--color--${slug}:${color}`),
  ];
  return declarations.length ? `:root{${declarations.join(";")}}` : "";
}
