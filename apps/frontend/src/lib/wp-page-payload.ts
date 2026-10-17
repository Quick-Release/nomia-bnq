import type { WpParsedBlock } from "./wp-blocks";

/** A page as the block renderers see it: its parsed block tree and page-level data. */
export type WpPagePayload = {
  title: string;
  content: string | null;
  blocks: WpParsedBlock[];
  pageBackgroundColor: string | null;
  featuredImage: {
    sourceUrl: string;
    altText: string;
  } | null;
};
