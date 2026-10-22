/**
 * Whether black body copy reads better than white on a hex surface.
 *
 * `0.1791` is the WCAG relative-luminance crossover where black and white text
 * reach equal contrast, so the brighter of the two is always chosen. An absent
 * or malformed colour means "no surface of our own", which inherits the page's
 * white default and is therefore light.
 *
 * The Gutenberg editor mirrors this in
 * `apps/cms/web/app/plugins/gq-bioeconomia/src/lib/colors.jsx` so the section
 * block previews the contrast the frontend will pick. Keep the two in step.
 */
export function isLightHexColor(color: string | null | undefined): boolean {
  if (typeof color !== "string") return true;
  const match = color.trim().match(/^#([0-9a-fA-F]{6})$/);
  if (!match) return true;

  const hex = match[1];
  const channel = (offset: number) => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return luminance > 0.1791;
}
