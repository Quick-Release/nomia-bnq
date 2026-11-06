/**
 * The interactive images the Interactive image block can show. Each one is a
 * site-owned graphic shipped with the Frontend; the block stores its key and
 * the editor's replacements for its texts and icons. A field left empty keeps
 * the graphic's own text or icon, exactly as drawn.
 */
export const INTERACTIVE_IMAGE_KEYS = ["economia-circular"] as const;

export type InteractiveImageKey = (typeof INTERACTIVE_IMAGE_KEYS)[number];

/** A known key, or null for anything else (a removed or mistyped image). */
export function readInteractiveImageKey(value: unknown): InteractiveImageKey | null {
  return typeof value === "string" && (INTERACTIVE_IMAGE_KEYS as readonly string[]).includes(value)
    ? (value as InteractiveImageKey)
    : null;
}

/**
 * Replacements by slot name; a slot that isn't listed keeps the graphic's own.
 * `title` and `subtitle` aren't slots: they edit the HTML heading.
 */
export interface InteractiveImageContent {
  texts: Record<string, string>;
  icons: Record<string, string>;
}

/** One slot's layout in the graphic, from the generator's manifest. */
export interface TextSlot {
  x: number;
  baseline: number;
  width: number;
  lines: number;
  size: number;
  weight: number;
  fill: string;
  lineHeight: number;
  align: "left" | "center";
  default: string;
}

export interface IconSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SlotManifest {
  ascent: number;
  descent: number;
  texts: Record<string, TextSlot>;
  icons: Record<string, IconSlot>;
  /** The graphic's title and subtitle, shown as HTML above it, not drawn. */
  heading: { title: string; subtitle: string };
}

/** The heading above the graphic: the editor's title and subtitle, or the graphic's own. */
export function readInteractiveImageHeading(
  manifest: SlotManifest,
  content: InteractiveImageContent,
): { title: string; subtitle: string } {
  return {
    title: content.texts.title ?? manifest.heading.title,
    subtitle: content.texts.subtitle ?? manifest.heading.subtitle,
  };
}

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/** An image URL the page may load: https, or a path on the site. */
function iconUrl(value: unknown): string {
  const url = text(value);
  return /^https:\/\/[^\s"'<>]+$/i.test(url) || /^\/(?!\/)[^\s"'<>]*$/.test(url) ? url : "";
}

const rows = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.map((row) => (row && typeof row === "object" ? (row as Record<string, unknown>) : {}))
    : [];

/**
 * The Economia Circular block attributes as slot replacements. Rows are read
 * by position: the n-th step row edits step n. Empty values are left out.
 */
export function readEconomiaCircularContent(
  attrs: Record<string, unknown>,
): InteractiveImageContent {
  const texts: Record<string, string> = {};
  const icons: Record<string, string> = {};
  const setText = (slot: string, value: unknown) => {
    const v = text(value);
    if (v) texts[slot] = v;
  };
  const setIcon = (slot: string, value: unknown) => {
    const v = iconUrl(value);
    if (v) icons[slot] = v;
  };

  setText("title", attrs.title);
  setText("subtitle", attrs.subtitle);
  setText("linear-heading", attrs.linearHeading);
  setText("linear-info", attrs.linearInfo);
  setText("circular-heading", attrs.circularHeading);
  setText("center-label", attrs.centerLabel);
  setIcon("center", attrs.centerIconSrc);
  setText("regeneration-heading", attrs.regenerationHeading);
  setText("regeneration-text", attrs.regenerationText);
  setText("regeneration-info", attrs.regenerationInfo);
  setText("hint", attrs.hint);
  rows(attrs.linearSteps)
    .slice(0, 4)
    .forEach((row, i) => {
      setText(`linear-${i + 1}`, row.label);
      setIcon(`linear-${i + 1}`, row.iconSrc);
    });
  rows(attrs.steps)
    .slice(0, 6)
    .forEach((row, i) => {
      setText(`step-${i + 1}-title`, row.title);
      setText(`step-${i + 1}-description`, row.description);
      setText(`step-${i + 1}-info`, row.info);
      setIcon(`step-${i + 1}`, row.iconSrc);
    });
  rows(attrs.regenerationItems)
    .slice(0, 5)
    .forEach((row, i) => {
      setText(`regeneration-${i + 1}`, row.label);
      setIcon(`regeneration-${i + 1}`, row.iconSrc);
    });
  return { texts, icons };
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/**
 * An edited text, laid out like the slot it replaces: same font, size, colour
 * and line height, its first baseline where the original's is, wrapping in
 * the original's width. Line breaks the editor typed are kept.
 */
function textMarkup(name: string, slot: TextSlot, value: string, manifest: SlotManifest): string {
  const contentHeight = (manifest.ascent + manifest.descent) * slot.size;
  const top = slot.baseline - ((slot.lineHeight - contentHeight) / 2 + manifest.ascent * slot.size);
  const height = (slot.lines + 4) * slot.lineHeight;
  const style = [
    "margin:0",
    "font-family:'II Montserrat',sans-serif",
    `font-size:${slot.size}px`,
    `font-weight:${slot.weight}`,
    `line-height:${slot.lineHeight}px`,
    `color:${slot.fill}`,
    `text-align:${slot.align}`,
    "white-space:pre-line",
    "overflow-wrap:break-word",
  ].join(";");
  return (
    `<g data-slot="${name}" data-edited=""><foreignObject x="${slot.x}" y="${top.toFixed(2)}" ` +
    `width="${slot.width}" height="${height.toFixed(2)}" style="overflow:visible;pointer-events:none">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="${style}">${escapeHtml(value)}</div>` +
    `</foreignObject></g>`
  );
}

function iconMarkup(name: string, slot: IconSlot, url: string): string {
  return (
    `<g data-icon="${name}" data-edited=""><image href="${escapeHtml(url)}" x="${slot.x}" y="${slot.y}" ` +
    `width="${slot.width}" height="${slot.height}" preserveAspectRatio="xMidYMid meet"/></g>`
  );
}

/**
 * The graphic's SVG for one instance: per-instance IDs, its icon image, the
 * step buttons' labels, and the editor's replacements in place of their slots.
 * The SVG is labelled by the heading the caller renders as `<id>-title`.
 * Slot groups hold only `<text>` (texts) or a clip path and a `<use>` (icons),
 * so each ends at its first `</g>`.
 */
export function renderInteractiveSvg(
  svg: string,
  manifest: SlotManifest,
  content: InteractiveImageContent,
  options: { id: string; icons: string },
): string {
  // Fill the graphic's own placeholders first, so the editor's texts and URLs
  // inserted below are never rewritten (a text may contain "__ID__").
  const label = (slot: string) =>
    (content.texts[slot] ?? manifest.texts[slot]?.default ?? "").replace(/\s+/g, " ");
  const base = svg
    .replaceAll("__ID__", options.id)
    .replaceAll("__ICONS__", options.icons)
    .replace(/__LABEL_(\d+)__/g, (_m, step: string) => escapeHtml(label(`step-${step}-title`)));
  return base
    .replace(/<g data-slot="([^"]+)">[\s\S]*?<\/g>/g, (group, name: string) => {
      const value = content.texts[name];
      const slot = manifest.texts[name];
      return value && slot ? textMarkup(name, slot, value, manifest) : group;
    })
    .replace(/<g data-icon="([^"]+)">[\s\S]*?<\/g>/g, (group, name: string) => {
      const url = content.icons[name];
      const slot = manifest.icons[name];
      return url && slot ? iconMarkup(name, slot, url) : group;
    });
}
