import { menuItemHref } from "@getquick/content";

/** Shared identity for navigation links and homepage cards, independent of order. */
export function thematicAreaColors(href: string, internalOrigins: string[]) {
  const path = menuItemHref(href, internalOrigins).split(/[?#]/, 1)[0];
  const family = /^\/economia-circular(?:\/|$)/.test(path)
    ? "botanico"
    : /^\/(?:bioeconomia-sustentavel|bioeconomia)(?:\/|$)/.test(path)
      ? "ciano"
      : "cinza";
  const thematic = family !== "cinza";
  return {
    background: `var(--wp--preset--color--${family}-${thematic ? 400 : 600})`,
    hoverBackground: `var(--wp--preset--color--${family}-${thematic ? 300 : 700})`,
    foreground: `var(--wp--preset--color--${thematic ? "cinza-700" : "branco"})`,
  };
}

export function thematicAreaStyle(href: string, internalOrigins: string[]) {
  const colors = thematicAreaColors(href, internalOrigins);
  return `--nomia-area-background: ${colors.background}; --nomia-area-hover-background: ${colors.hoverBackground}; --nomia-area-foreground: ${colors.foreground};`;
}
