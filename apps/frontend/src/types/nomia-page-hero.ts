import type {
  PageHeroContent,
  PageHeroPadding,
  PageHeroSlide,
} from "../components/page-heroes/pageHeroShared";
import type { PageHeroTextAlign, PageHeroTextTypography } from "../lib/page-hero-typography";

/**
 * Page hero payload — homepage uses the carousel; inner pages typically use a static image from WordPress.
 */
export type NomiaPageHeroSlider = { variant: "slider"; slides?: readonly PageHeroSlide[] };

export type NomiaPageHeroStatic = PageHeroContent & {
  variant: "static";
  /** Optional decorative hero background. */
  imageSrc?: string;
  /** Alternative text for the decorative hero background. */
  imageAlt?: string;
  /** Astro-only layout choice for page-level hero placements. */
  heroHeight?: string;
  /** Optional per-text typography overrides from the Gutenberg block. */
  titleTypography?: PageHeroTextTypography;
  subtitleTypography?: PageHeroTextTypography;
  /** Horizontal placement of the whole copy stack. */
  textAlign?: PageHeroTextAlign;
  /** Named vertical padding steps; "default" keeps the height step's padding. */
  paddingTop?: PageHeroPadding;
  paddingBottom?: PageHeroPadding;
};

export type NomiaPageHeroProps = NomiaPageHeroSlider | NomiaPageHeroStatic;
