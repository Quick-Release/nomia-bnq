/**
 * Horizontal gutters of the fixed site header. Blocks that sit directly under
 * the header and must line up with the logo and nav (the page heroes) use the
 * same steps; they are intentionally narrower than the 64px body gutters
 * between `md` and `2xl` so the desktop nav keeps its room.
 */
export const HEADER_GUTTER_X = "px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16";

/**
 * Page frame for blocks without one of their own: the site's 16px / 64px side
 * gutters (`.nomia-page-gutter` in global.css, which steps aside inside columns
 * and Section blocks), centred at 1920px.
 */
export const PAGE_FRAME = "nomia-page-gutter mx-auto w-full max-w-[1920px]";
