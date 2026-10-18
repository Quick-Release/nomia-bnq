/**
 * Presentation rules for the `getquick/section` container block.
 *
 * The block stores intent (a background colour, a named padding step), never
 * layout classes, so the responsive rhythm and the text and header contrast stay
 * owned here rather than frozen into post content. The class maps are literal
 * strings on purpose: Tailwind only ships classes it can see in the source.
 */

export const SECTION_PADDING_STEPS = ["none", "small", "medium", "large"] as const;
export type SectionPaddingStep = (typeof SECTION_PADDING_STEPS)[number];

export const SECTION_HORIZONTAL_PADDINGS = ["none", "small", "default"] as const;
export type SectionHorizontalPadding = (typeof SECTION_HORIZONTAL_PADDINGS)[number];

export const SECTION_PADDING_TOP_DEFAULT: SectionPaddingStep = "medium";
export const SECTION_PADDING_BOTTOM_DEFAULT: SectionPaddingStep = "medium";
export const SECTION_PADDING_X_DEFAULT: SectionHorizontalPadding = "default";

const PADDING_TOP_CLASSES: Record<SectionPaddingStep, string> = {
  none: "",
  small: "pt-8 md:pt-12",
  medium: "pt-16 md:pt-24",
  large: "pt-24 md:pt-32",
};

const PADDING_BOTTOM_CLASSES: Record<SectionPaddingStep, string> = {
  none: "",
  small: "pb-8 md:pb-12",
  medium: "pb-16 md:pb-24",
  large: "pb-24 md:pb-32",
};

const PADDING_X_CLASSES: Record<SectionHorizontalPadding, string> = {
  none: "",
  small: "px-4 md:px-8",
  default: "px-4 md:px-16",
};

function readStep<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function readSectionPaddingStep(value: unknown, fallback: SectionPaddingStep) {
  return readStep(value, SECTION_PADDING_STEPS, fallback);
}

export function readSectionHorizontalPadding(value: unknown) {
  return readStep(value, SECTION_HORIZONTAL_PADDINGS, SECTION_PADDING_X_DEFAULT);
}

export function sectionPaddingClasses(attrs: {
  paddingTop?: unknown;
  paddingBottom?: unknown;
  paddingX?: unknown;
}): string[] {
  return [
    PADDING_TOP_CLASSES[readSectionPaddingStep(attrs.paddingTop, SECTION_PADDING_TOP_DEFAULT)],
    PADDING_BOTTOM_CLASSES[
      readSectionPaddingStep(attrs.paddingBottom, SECTION_PADDING_BOTTOM_DEFAULT)
    ],
    PADDING_X_CLASSES[readSectionHorizontalPadding(attrs.paddingX)],
  ].filter(Boolean);
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** `null` means "inherit the page background", which is the unset default. */
export function normalizeSectionBackground(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const color = value.trim().toLowerCase();
  return HEX_COLOR.test(color) ? color : null;
}

/** Body copy, links and emphasis for a section whose background is set. */
export function sectionContrastClasses(isLight: boolean): string {
  return isLight
    ? "text-neutral-bw-black [&_a]:text-main-ciano-500 [&_a]:underline [&_a]:decoration-main-ciano-500/70 [&_a]:underline-offset-4 [&_strong]:text-neutral-bw-black"
    : "text-neutral-bw-white [&_a]:text-neutral-bw-white [&_a]:underline [&_a]:decoration-neutral-bw-white/70 [&_a]:underline-offset-4 [&_strong]:text-neutral-bw-white";
}

/**
 * An optional background image, drawn above the background colour and behind
 * the section's content. Position and size are named choices; each resolves
 * to fixed CSS values here, never to anything read from post content.
 */
export const SECTION_BACKGROUND_POSITIONS = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
] as const;
export type SectionBackgroundPosition = (typeof SECTION_BACKGROUND_POSITIONS)[number];
export const SECTION_BACKGROUND_POSITION_DEFAULT: SectionBackgroundPosition = "center";

/** `cover` fills and crops, `contain` shows the whole image, `none` keeps its natural size. */
export const SECTION_BACKGROUND_SIZES = ["cover", "contain", "none"] as const;
export type SectionBackgroundSize = (typeof SECTION_BACKGROUND_SIZES)[number];
export const SECTION_BACKGROUND_SIZE_DEFAULT: SectionBackgroundSize = "cover";

const BACKGROUND_POSITION_CSS: Record<SectionBackgroundPosition, string> = {
  "top-left": "left top",
  top: "center top",
  "top-right": "right top",
  left: "left center",
  center: "center center",
  right: "right center",
  "bottom-left": "left bottom",
  bottom: "center bottom",
  "bottom-right": "right bottom",
};

const BACKGROUND_SIZE_CLASSES: Record<SectionBackgroundSize, string> = {
  cover: "object-cover",
  contain: "object-contain",
  none: "object-none",
};

export function readSectionBackgroundPosition(value: unknown): SectionBackgroundPosition {
  return readStep(value, SECTION_BACKGROUND_POSITIONS, SECTION_BACKGROUND_POSITION_DEFAULT);
}

export function readSectionBackgroundSize(value: unknown): SectionBackgroundSize {
  return readStep(value, SECTION_BACKGROUND_SIZES, SECTION_BACKGROUND_SIZE_DEFAULT);
}

export function sectionBackgroundPositionCss(position: SectionBackgroundPosition): string {
  return BACKGROUND_POSITION_CSS[position];
}

export function sectionBackgroundSizeClass(size: SectionBackgroundSize): string {
  return BACKGROUND_SIZE_CLASSES[size];
}

/** An image URL the section may draw: a path or an http(s) URL, nothing else. */
export function normalizeSectionBackgroundImage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const src = value.trim();
  if (!src) return null;
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  return /^https?:\/\//i.test(src) ? src : null;
}
