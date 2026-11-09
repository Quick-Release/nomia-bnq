import type { CollectionMembership } from "@getquick/content";
import type { WpParsedBlock } from "./wp-blocks";

/**
 * Oportunidades categories whose items are shown under their category page's
 * hero, by the category's slug: the page that lists them. Editors change the
 * hero's image on that page, and its items follow.
 */
const CATEGORY_HERO_PAGES: Readonly<Record<string, string>> = {
  formacao: "/oportunidades/formacao/",
};

const HERO_BLOCK = "getquick/page-hero-static";

/**
 * The URI of the page whose hero an entry is shown under, or null when it is
 * not an Oportunidade in one of those categories.
 */
export function categoryHeroPage(collection: CollectionMembership | undefined): string | null {
  if (collection?.name !== "oportunidades") return null;
  for (const term of collection.terms.categoria_oportunidade ?? []) {
    const page = CATEGORY_HERO_PAGES[term.slug];
    if (page) return page;
  }
  return null;
}

/**
 * The category page's first static page hero, titled with the item's title.
 * Its subtitle and button describe the category page, so the item's hero
 * leaves them out; its image, height, spacing and typography stay.
 */
export function categoryHeroBlock(
  pageBlocks: readonly WpParsedBlock[],
  title: string,
): WpParsedBlock | null {
  const hero = pageBlocks.find((block) => block.blockName === HERO_BLOCK);
  if (!hero || !title.trim()) return null;
  return {
    ...hero,
    attrs: { ...hero.attrs, title, showSubtitle: false, showCta: false },
    innerBlocks: [],
  };
}
