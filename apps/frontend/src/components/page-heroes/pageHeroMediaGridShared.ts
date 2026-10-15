const CSS_COLOR_PATTERN =
  /^(?:#[\da-f]{3,8}|var\(--[a-z\d-]+\)|(?:rgb|hsl)a?\([\d\s.,%+-]+\)|[a-z]+)$/i;
const BORDER_RADIUS_PATTERN = /^(\d+(?:\.\d+)?)(px|rem|em|%|vw|vh)?$/i;

export const PAGE_HERO_MEDIA_GRID_DEFAULTS = {
  heading: "Destaques e video",
  firstBackgroundColor: "#ffffff",
  firstHoverBackgroundColor: "#f2a900",
  firstTitleColor: "#ffffff",
  firstTextColor: "#ffffff",
  firstBorderRadius: "40px",
  secondBackgroundColor: "#ffffff",
  secondHoverBackgroundColor: "#f2a900",
  secondTitleColor: "#ffffff",
  secondTextColor: "#ffffff",
  secondBorderRadius: "40px",
  textVerticalAlign: "bottom",
  videoBorderRadius: "40px",
  shareHref: "https://nomia.getquick.io/partilhar/",
  shareLabel: "Partilhar",
} as const;

export type PageHeroMediaGridTextVerticalAlign = "top" | "bottom";

export function normalizeCssColor(value: unknown, fallback: string): string {
  const candidate = typeof value === "string" ? value.trim() : "";
  return CSS_COLOR_PATTERN.test(candidate) ? candidate : fallback;
}

export function normalizeBorderRadius(value: unknown, fallback: string): string {
  const candidate =
    typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
  const match = candidate.match(BORDER_RADIUS_PATTERN);
  if (!match) return fallback;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount > 200) return fallback;
  return `${amount}${match[2] ?? "px"}`;
}

export function normalizeTextVerticalAlign(value: unknown): PageHeroMediaGridTextVerticalAlign {
  return value === "top" ? "top" : "bottom";
}
