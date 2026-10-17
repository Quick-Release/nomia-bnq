import { HEADER_GUTTER_X } from "../../lib/site-gutters.ts";
import type { PageHeroTextAlign } from "../../lib/page-hero-typography.ts";

export type PageHeroCta = {
  label: string;
  href: string;
};

export type PageHeroContent = {
  title: string;
  subtitle: string;
  cta?: PageHeroCta;
};

export type PageHeroSpotlight = {
  imageSrc: string;
  title: string;
  body: string;
  href: string;
};

export type PageHeroSlide = PageHeroContent & {
  id: string;
  bgImage: string;
  cta: PageHeroCta;
  spotlight?: PageHeroSpotlight;
};

/**
 * Named height steps for the static hero, borrowed from Tailwind's size
 * vocabulary so editors pick an intent ("L") rather than a viewport unit. The
 * step is what gets stored; the classes each step resolves to stay owned here.
 */
export const PAGE_HERO_HEIGHT_STEPS = ["xs", "s", "m", "l", "xl"] as const;
export type PageHeroHeight = (typeof PAGE_HERO_HEIGHT_STEPS)[number];

/** Full-bleed remains the default, so heroes saved before the scale existed are unchanged. */
export const PAGE_HERO_HEIGHT_DEFAULT: PageHeroHeight = "xl";

/**
 * Pages written against the original two-value vocabulary still pass those
 * words; they map onto the steps with the same measurements.
 */
const LEGACY_PAGE_HERO_HEIGHTS: Record<string, PageHeroHeight> = {
  full: "xl",
  half: "s",
};

export function resolvePageHeroHeight(value: unknown): PageHeroHeight {
  if (typeof value !== "string") return PAGE_HERO_HEIGHT_DEFAULT;
  const step = value.trim().toLowerCase();
  if ((PAGE_HERO_HEIGHT_STEPS as readonly string[]).includes(step)) {
    return step as PageHeroHeight;
  }
  return LEGACY_PAGE_HERO_HEIGHTS[step] ?? PAGE_HERO_HEIGHT_DEFAULT;
}

export const pageHeroClasses = {
  section: "w-full",
  viewport: "relative min-h-[min(100svh,944px)] w-full overflow-hidden",
  mediaLayer: "pointer-events-none absolute inset-0",
  image: "absolute inset-0 size-full max-w-none object-cover",
  overlay: "bg-main-cinza-700/40 absolute inset-0",
  content:
    "font-primary relative z-10 mx-auto flex min-h-[min(100svh,944px)] w-full max-w-[1920px] flex-col justify-center px-4 pt-24 pb-40 md:px-16 md:pt-32 md:pb-48",
  /**
   * The slider keeps a lane for its previous-slide arrow left of the copy. The
   * lane is one 12-column grid column plus the arrow, capped at the 1920px frame
   * so the copy stays centred with the header on wider screens.
   */
  contentStyle: { paddingLeft: "max(1rem, calc(min(8.33%, 160px) + 3.5rem))" },
  copyStack: "flex w-full max-w-[728px] flex-col gap-6",
  title: "font-medium tracking-[var(--tracking-typography-0)] text-main-cinza-100",
  subtitle: "font-normal tracking-[var(--tracking-typography-0)] text-main-cinza-100",
  cta: "bg-neutral-bw-white text-body text-main-cinza-700 focus-visible:ring-main-teal-400 inline-flex w-fit items-center justify-center gap-2 rounded-[40px] px-4 py-2 font-medium tracking-[var(--tracking-typography-0)] transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-main-cinza-700 focus-visible:outline-none",
} as const;

/**
 * One literal class string per step — Tailwind only ships classes it can see in
 * the source, so these are never assembled from the step name.
 */
const HEIGHT_VIEWPORT_CLASSES: Record<PageHeroHeight, string> = {
  xs: "relative min-h-[max(35svh,280px)] w-full overflow-hidden",
  s: "relative min-h-[max(50svh,360px)] w-full overflow-hidden",
  m: "relative min-h-[max(65svh,440px)] w-full overflow-hidden",
  l: "relative min-h-[max(80svh,560px)] w-full overflow-hidden",
  xl: "relative h-[100svh] w-full overflow-hidden",
};

/**
 * Content gutters follow the site header (`HEADER_GUTTER_X`) so the hero title
 * lines up with the logo, and the column centres at 1920px like the header does.
 * Vertical padding is kept apart from the layout so a padding step can replace
 * one side without restating the rest.
 */
const HEIGHT_CONTENT_CLASSES: Record<PageHeroHeight, string> = {
  xs: `font-primary relative z-10 mx-auto flex min-h-[max(35svh,280px)] w-full max-w-[1920px] flex-col justify-center ${HEADER_GUTTER_X}`,
  s: `font-primary relative z-10 mx-auto flex min-h-[max(50svh,360px)] w-full max-w-[1920px] flex-col justify-center ${HEADER_GUTTER_X}`,
  m: `font-primary relative z-10 mx-auto flex min-h-[max(65svh,440px)] w-full max-w-[1920px] flex-col justify-center ${HEADER_GUTTER_X}`,
  l: `font-primary relative z-10 mx-auto flex min-h-[max(80svh,560px)] w-full max-w-[1920px] flex-col justify-center ${HEADER_GUTTER_X}`,
  xl: `font-primary relative z-10 mx-auto flex h-[100svh] w-full max-w-[1920px] flex-col justify-center ${HEADER_GUTTER_X}`,
};

/** The padding each height step brings; what the "default" padding step keeps. */
const HEIGHT_PADDING_TOP_CLASSES: Record<PageHeroHeight, string> = {
  xs: "pt-16",
  s: "pt-24",
  m: "pt-24 md:pt-28",
  l: "pt-24 md:pt-32",
  xl: "pt-24 md:pt-32",
};

const HEIGHT_PADDING_BOTTOM_CLASSES: Record<PageHeroHeight, string> = {
  xs: "pb-16",
  s: "pb-24",
  m: "pb-32 md:pb-40",
  l: "pb-40 md:pb-48",
  xl: "pb-40 md:pb-48",
};

/**
 * Named vertical padding for the static hero's copy. "default" keeps what the
 * height step brings, so heroes saved before these controls are unchanged; the
 * other steps match the Section block's rhythm.
 */
export const PAGE_HERO_PADDING_STEPS = ["default", "none", "small", "medium", "large"] as const;
export type PageHeroPadding = (typeof PAGE_HERO_PADDING_STEPS)[number];
export const PAGE_HERO_PADDING_DEFAULT: PageHeroPadding = "default";

const PADDING_TOP_CLASSES: Record<Exclude<PageHeroPadding, "default">, string> = {
  none: "pt-0",
  small: "pt-8 md:pt-12",
  medium: "pt-16 md:pt-24",
  large: "pt-24 md:pt-32",
};

const PADDING_BOTTOM_CLASSES: Record<Exclude<PageHeroPadding, "default">, string> = {
  none: "pb-0",
  small: "pb-8 md:pb-12",
  medium: "pb-16 md:pb-24",
  large: "pb-24 md:pb-32",
};

export function resolvePageHeroPadding(value: unknown): PageHeroPadding {
  return typeof value === "string" && (PAGE_HERO_PADDING_STEPS as readonly string[]).includes(value)
    ? (value as PageHeroPadding)
    : PAGE_HERO_PADDING_DEFAULT;
}

export type PageHeroPaddingChoice = { top?: unknown; bottom?: unknown };

/**
 * The copy stack keeps its 728px measure and moves inside the content column, so
 * "right" reads as right of the hero rather than ragged text in a left column.
 * Literal strings again: Tailwind only ships classes it can see in the source.
 */
const COPY_STACK_ALIGN_CLASSES: Record<PageHeroTextAlign, string> = {
  left: "flex w-full max-w-[728px] flex-col items-start gap-6 text-left",
  center: "mx-auto flex w-full max-w-[728px] flex-col items-center gap-6 text-center",
  right: "ml-auto flex w-full max-w-[728px] flex-col items-end gap-6 text-right",
};

export function pageHeroCopyStackClass(align: PageHeroTextAlign): string {
  return COPY_STACK_ALIGN_CLASSES[align];
}

export function pageHeroViewportClass(height: PageHeroHeight): string {
  return HEIGHT_VIEWPORT_CLASSES[height];
}

export function pageHeroContentClass(
  height: PageHeroHeight,
  padding: PageHeroPaddingChoice = {},
): string {
  const top = resolvePageHeroPadding(padding.top);
  const bottom = resolvePageHeroPadding(padding.bottom);
  return [
    HEIGHT_CONTENT_CLASSES[height],
    top === "default" ? HEIGHT_PADDING_TOP_CLASSES[height] : PADDING_TOP_CLASSES[top],
    bottom === "default" ? HEIGHT_PADDING_BOTTOM_CLASSES[height] : PADDING_BOTTOM_CLASSES[bottom],
  ].join(" ");
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function externalLinkAttrs(href: string) {
  return isExternalHref(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}
