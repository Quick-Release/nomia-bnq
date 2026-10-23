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
 * Published term colors and derived contrast/hover, inherited by every Nomia
 * block inside `scope` (the page's blocks, or the header navigation, which
 * sits outside them). A term without a color publishes nothing, so each
 * consumer falls back to its own uncolored style.
 */
export function thematicColorStyles(value: unknown, scope = ".nomia-blocks"): string {
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
  return declarations.length ? `${scope} { ${declarations.join("; ")}; }` : "";
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

/**
 * The thematic term an internal link belongs to, by its path: identity
 * follows an internal area's term slug, never the link's position. Null for
 * any other link.
 */
export function thematicAreaSlug(href: string, internalOrigins: string[]): string | null {
  const path = menuItemHref(href, internalOrigins).split(/[?#]/, 1)[0];
  const segments = path.split("/");
  let slug = path.startsWith("/") ? segments[1] : "";
  if (slug === "tematica-indicadores") slug = segments[2];
  // Existing editorial links still use this older route for the same term.
  if (slug === "bioeconomia") slug = "bioeconomia-sustentavel";
  return slug && /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

/** A thematic term's published colors, else the uncolored style. */
export function thematicSlugColors(slug: string | null, uncolored: Uncolored = "neutral") {
  const fallback = uncolored === "transparent" ? transparent : neutral;
  if (!slug) return fallback;
  return {
    background: `var(--nomia-tematica-${slug}-background, ${fallback.background})`,
    hoverBackground: `var(--nomia-tematica-${slug}-hover-background, ${fallback.hoverBackground})`,
    foreground: `var(--nomia-tematica-${slug}-foreground, ${fallback.foreground})`,
  };
}

export function thematicAreaColors(
  href: string,
  internalOrigins: string[],
  uncolored: Uncolored = "neutral",
) {
  return thematicSlugColors(thematicAreaSlug(href, internalOrigins), uncolored);
}

/** The `--nomia-area-*` properties `.nomia-area-link` reads, for a term. */
export function thematicSlugStyle(slug: string | null, uncolored: Uncolored = "neutral") {
  const colors = thematicSlugColors(slug, uncolored);
  return `--nomia-area-background: ${colors.background}; --nomia-area-hover-background: ${colors.hoverBackground}; --nomia-area-foreground: ${colors.foreground};`;
}

export function thematicAreaStyle(
  href: string,
  internalOrigins: string[],
  uncolored: Uncolored = "neutral",
) {
  return thematicSlugStyle(thematicAreaSlug(href, internalOrigins), uncolored);
}
