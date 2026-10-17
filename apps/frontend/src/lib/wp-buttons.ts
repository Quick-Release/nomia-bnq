/**
 * `core/buttons` and `core/button` as Astro renders them.
 *
 * Gutenberg offers a curated set of button controls (theme.json): palette text
 * and background colours, preset font sizes, the Fill/Outline styles, the
 * 25/50/75/100% width presets, and the group's justification and orientation.
 * Each is read from the block's attributes and resolved through the same theme
 * presets the editor uses, so the page shows what the editor showed. Nothing
 * else in the saved markup is trusted as style: the link, its target and rel,
 * and the label are all this renderer takes from the HTML.
 */
import { safeHref } from "./safe-href.ts";
import { wpThemeColor, wpThemeFontSize } from "./wp-theme-presets.ts";

export type WpButtonsJustify = "left" | "center" | "right" | "space-between";
export type WpButtonsOrientation = "horizontal" | "vertical";

export type WpButtonsLayout = {
  justify: WpButtonsJustify;
  orientation: WpButtonsOrientation;
};

const JUSTIFY_VALUES: readonly WpButtonsJustify[] = ["left", "center", "right", "space-between"];

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function readWpButtonsLayout(attrs: unknown): WpButtonsLayout {
  const layout = record(record(attrs).layout);
  const justify = JUSTIFY_VALUES.find((value) => value === layout.justifyContent) ?? "left";
  return {
    justify,
    orientation: layout.orientation === "vertical" ? "vertical" : "horizontal",
  };
}

/**
 * Literal class strings, because Tailwind only ships classes it can see. A
 * vertical group stacks its buttons and aligns them along the cross axis;
 * "space-between" has no vertical meaning, so it falls back to the left.
 */
const HORIZONTAL_CLASSES: Record<WpButtonsJustify, string> = {
  left: "flex flex-wrap items-center justify-start gap-3",
  center: "flex flex-wrap items-center justify-center gap-3",
  right: "flex flex-wrap items-center justify-end gap-3",
  "space-between": "flex flex-wrap items-center justify-between gap-3",
};

const VERTICAL_CLASSES: Record<WpButtonsJustify, string> = {
  left: "flex flex-col items-start gap-3",
  center: "flex flex-col items-center gap-3",
  right: "flex flex-col items-end gap-3",
  "space-between": "flex flex-col items-start gap-3",
};

export function wpButtonsClass(layout: WpButtonsLayout): string {
  return (layout.orientation === "vertical" ? VERTICAL_CLASSES : HORIZONTAL_CLASSES)[
    layout.justify
  ];
}

export type WpButtonWidth = 25 | 50 | 75 | 100;

const WIDTH_PRESETS: readonly WpButtonWidth[] = [25, 50, 75, 100];

/**
 * The width presets are stored either as a preset reference
 * (`var:preset|dimension|50`) or as the preset's value (`50%`). Any other
 * width is not one the editor offers, so the button keeps its natural width.
 */
export function readWpButtonWidth(attrs: unknown): WpButtonWidth | undefined {
  const width = record(record(record(attrs).style).dimensions).width;
  if (typeof width !== "string") return undefined;
  const match = /^(?:var:preset\|[a-z-]+\|(\d+)|(\d+)%)$/.exec(width.trim());
  const percent = Number(match?.[1] ?? match?.[2]);
  return WIDTH_PRESETS.find((preset) => preset === percent);
}

/**
 * The group's 0.75rem gap (`gap-3`, and `styles.blocks.core/buttons` in
 * theme.json) is shared between buttons on one row, as core does, so four 25%
 * buttons still fit a single line.
 */
export function wpButtonWidthStyle(width: WpButtonWidth | undefined): string | undefined {
  if (!width) return undefined;
  if (width === 100) return "width: 100%";
  return `width: calc(${width}% - 0.75rem * ${(100 - width) / 100})`;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#039": "'",
  "#39": "'",
};

function decodeAttribute(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, name: string) => {
    const lower = name.toLowerCase();
    if (NAMED_ENTITIES[lower]) return NAMED_ENTITIES[lower];
    if (lower.startsWith("#x")) return String.fromCodePoint(Number.parseInt(lower.slice(2), 16));
    if (lower.startsWith("#")) return String.fromCodePoint(Number.parseInt(lower.slice(1), 10));
    return entity;
  });
}

function readAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const match of tag.matchAll(/([a-z][a-z0-9-]*)\s*=\s*"([^"]*)"/gi)) {
    attributes[match[1].toLowerCase()] = decodeAttribute(match[2]);
  }
  return attributes;
}

export type WpButton = {
  /** A followable link, or "" when the button has none (or an unsafe one). */
  href: string;
  target?: string;
  rel?: string;
  title?: string;
  id?: string;
  /** The label as RichText saved it: inline formatting only. */
  labelHtml: string;
  variant: "fill" | "outline" | "bioeconomia";
  width?: WpButtonWidth;
  /** Preset overrides for the link, as declarations. */
  style?: string;
  /** Whether a palette text / background colour overrides the default look. */
  hasTextColor: boolean;
  hasBackgroundColor: boolean;
};

/** Inline formatting RichText may leave in a button label; anything else is text. */
const LABEL_TAGS = new Set([
  "strong",
  "b",
  "em",
  "i",
  "s",
  "sub",
  "sup",
  "br",
  "mark",
  "code",
  "kbd",
]);

function sanitizeLabel(html: string): string {
  return html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (tag, name: string) => {
    const lower = name.toLowerCase();
    if (!LABEL_TAGS.has(lower)) return "";
    return tag.startsWith("</") ? `</${lower}>` : `<${lower}>`;
  });
}

export function readWpButton(block: { attrs?: unknown; innerHTML?: string }): WpButton {
  const attrs = record(block.attrs);
  const html = block.innerHTML ?? "";
  const wrapperTag = /<div\b[^>]*>/i.exec(html)?.[0] ?? "";
  const wrapper = readAttributes(wrapperTag);
  const link = /<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/i.exec(html);
  const linkAttributes = readAttributes(link?.[2] ? `<x ${link[2]}>` : "");
  const classNames = `${wrapper.class ?? ""} ${typeof attrs.className === "string" ? attrs.className : ""}`;
  const variant = /(?:^|\s)is-style-bioeconomia(?:\s|$)/.test(classNames)
    ? "bioeconomia"
    : /(?:^|\s)is-style-outline(?:\s|$)/.test(classNames)
      ? "outline"
      : "fill";

  // WordPress's palette classes are `!important`, so a chosen background shows
  // on an Outline button too; the renderer matches the editor.
  const background = wpThemeColor(attrs.backgroundColor);
  const text = wpThemeColor(attrs.textColor);
  const fontSize = wpThemeFontSize(attrs.fontSize);
  const declarations = [
    background ? `background-color: ${background}` : null,
    text ? `color: ${text}` : null,
    fontSize ? `font-size: ${fontSize}` : null,
  ].filter(Boolean);

  const href = link?.[1].toLowerCase() === "a" ? safeHref(linkAttributes.href) : "";
  const target = linkAttributes.target === "_blank" ? "_blank" : undefined;
  return {
    href,
    target: href ? target : undefined,
    rel: href ? linkAttributes.rel || (target ? "noopener" : undefined) : undefined,
    title: linkAttributes.title || undefined,
    id: wrapper.id || undefined,
    labelHtml: sanitizeLabel(link?.[3] ?? "").trim(),
    variant,
    width: readWpButtonWidth(attrs),
    style: declarations.length > 0 ? declarations.join("; ") : undefined,
    hasTextColor: Boolean(text),
    hasBackgroundColor: Boolean(background),
  };
}
