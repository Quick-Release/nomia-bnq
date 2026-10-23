import { menuItemHref } from "@getquick/content";
import { isLightHexColor } from "./color-contrast";

export interface ThematicColor {
  slug: string;
  color: string;
}

/** Only safe term slugs and hex colors may enter the published stylesheet. */
export function readThematicColors(value: unknown): ThematicColor[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((term) => {
    if (!term || typeof term !== "object") return [];
    const { slug, color } = term;
    if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) return [];
    if (typeof color !== "string" || (color !== "" && !/^#[0-9a-f]{6}$/i.test(color))) return [];
    return [{ slug, color: color.toLowerCase() }];
  });
}

const neutral = {
  background: "var(--wp--preset--color--cinza-600)",
  hoverBackground: "var(--wp--preset--color--cinza-700)",
  foreground: "var(--wp--preset--color--branco)",
};

/**
 * Published term colors and derived contrast/hover, inherited by all Nomia
 * blocks. A term without a color publishes nothing, so each consumer falls
 * back to its own uncolored style.
 */
export function thematicColorStyles(value: unknown): string {
  const declarations = readThematicColors(value).flatMap(({ slug, color }) => {
    if (!color) return [];
    const light = isLightHexColor(color);
    // Light surfaces move toward white; dark surfaces toward black. Both keep
    // the chosen black/white text readable when hovered or keyboard-focused.
    const hover = `#${[1, 3, 5]
      .map((offset) => {
        const channel = Number.parseInt(color.slice(offset, offset + 2), 16);
        return Math.round(channel * 0.85 + (light ? 255 : 0) * 0.15)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")}`;
    return [
      `--nomia-tematica-${slug}-background: ${color}`,
      `--nomia-tematica-${slug}-hover-background: ${hover}`,
      `--nomia-tematica-${slug}-foreground: ${light ? "#000000" : "#ffffff"}`,
    ];
  });
  return declarations.length ? `.nomia-blocks { ${declarations.join("; ")}; }` : "";
}

/**
 * Navigation links draw a pill only for an area with a color: any other link
 * keeps the surrounding text color on no background.
 */
const transparent = {
  background: "transparent",
  hoverBackground: "color-mix(in srgb, currentColor 12%, transparent)",
  foreground: "currentColor",
};

type Uncolored = "neutral" | "transparent";

/** Identity follows an internal area's term slug, never the link's position. */
export function thematicAreaColors(
  href: string,
  internalOrigins: string[],
  uncolored: Uncolored = "neutral",
) {
  const fallback = uncolored === "transparent" ? transparent : neutral;
  const path = menuItemHref(href, internalOrigins).split(/[?#]/, 1)[0];
  const segments = path.split("/");
  let slug = path.startsWith("/") ? segments[1] : "";
  if (slug === "tematica-indicadores") slug = segments[2];
  // Existing editorial links still use this older route for the same term.
  if (slug === "bioeconomia") slug = "bioeconomia-sustentavel";
  if (!/^[a-z0-9-]+$/.test(slug ?? "")) return fallback;
  return {
    background: `var(--nomia-tematica-${slug}-background, ${fallback.background})`,
    hoverBackground: `var(--nomia-tematica-${slug}-hover-background, ${fallback.hoverBackground})`,
    foreground: `var(--nomia-tematica-${slug}-foreground, ${fallback.foreground})`,
  };
}

export function thematicAreaStyle(
  href: string,
  internalOrigins: string[],
  uncolored: Uncolored = "neutral",
) {
  const colors = thematicAreaColors(href, internalOrigins, uncolored);
  return `--nomia-area-background: ${colors.background}; --nomia-area-hover-background: ${colors.hoverBackground}; --nomia-area-foreground: ${colors.foreground};`;
}
