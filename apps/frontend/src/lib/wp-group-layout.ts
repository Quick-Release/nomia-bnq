/**
 * `core/group` stores its row / stack / grid choice only as a `layout`
 * attribute; WordPress turns it into `is-layout-*` classes when it renders, so
 * the saved markup carries none. Astro adds the equivalent classes to the
 * group's opening tag, and `wp-core-blocks.css` gives them their layout.
 */

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

const JUSTIFICATIONS = new Set(["center", "right", "space-between"]);

export function wpGroupLayoutClasses(attrs: unknown): string[] {
  const layout = record(record(attrs).layout);
  if (layout.type === "grid") return ["is-layout-grid"];
  if (layout.type !== "flex") return [];

  const classes = ["is-layout-flex"];
  if (layout.orientation === "vertical") classes.push("is-vertical");
  if (layout.flexWrap === "nowrap") classes.push("is-nowrap");
  if (typeof layout.justifyContent === "string" && JUSTIFICATIONS.has(layout.justifyContent)) {
    classes.push(`is-content-justification-${layout.justifyContent}`);
  }
  return classes;
}

/** Adds classes to the `wp-block-group` element that opens a saved HTML piece. */
export function withWpGroupLayoutClasses(html: string, classes: readonly string[]): string {
  if (classes.length === 0) return html;
  return html.replace(
    /(<[a-z][a-z0-9]*\b[^>]*\bclass=")((?:[^"]*\s)?wp-block-group(?:\s[^"]*)?)(")/i,
    (_match, open: string, value: string, close: string) =>
      `${open}${value} ${classes.join(" ")}${close}`,
  );
}
