import type { ContentExtension } from "@getquick/content/server";
import { readThematicColors, type ThematicColor } from "./thematic-area";
import { z } from "astro/zod";
import { parseWpBlocksJson, type WpParsedBlock } from "./wp-blocks";

/**
 * A page or post built with Nomia's blocks (`getquick/*`, the gq-bioeconomia
 * plugin), stored with it so it is rendered by the Nomia block components on
 * a visit, without reading WordPress.
 */
export interface NomiaContent {
  /** WordPress's parsed blocks (`parse_blocks()`), from the `wpBlocksJson` field. */
  blocks: WpParsedBlock[];
  /** Temáticas colors, snapshotted with this publication. */
  thematicColors?: ThematicColor[];
  /** The page's background colour (gq-bioeconomia's page setting), if it has one. */
  pageBackgroundColor: string | null;
}

/** Nomia's own blocks; GETQUICK Design's are `getquick-design/*`. */
const NOMIA_BLOCK_PREFIX = "getquick/";

/** PHP encodes a block without attributes as `"attrs": []`; renderers read an object. */
function normalizeBlock(block: WpParsedBlock): WpParsedBlock {
  return {
    ...block,
    attrs: Array.isArray(block.attrs) ? {} : block.attrs,
    innerBlocks: (block.innerBlocks ?? []).map(normalizeBlock),
  };
}

function containsNomiaBlock(blocks: WpParsedBlock[]): boolean {
  return blocks.some(
    (block) =>
      Boolean(block.blockName?.startsWith(NOMIA_BLOCK_PREFIX)) ||
      containsNomiaBlock(block.innerBlocks ?? []),
  );
}

/**
 * The Nomia content of an entry WordPress returned, or undefined when it
 * holds none of Nomia's blocks (or WordPress left the blocks out): such an
 * entry is served as WordPress rendered it, as before.
 */
export function nomiaContent(
  wpBlocksJson: string | null | undefined,
  pageBackgroundColor: string | null | undefined,
  thematicColors?: unknown,
): NomiaContent | undefined {
  const blocks = parseWpBlocksJson(wpBlocksJson).map(normalizeBlock);
  if (!containsNomiaBlock(blocks)) return undefined;
  return {
    blocks,
    pageBackgroundColor: pageBackgroundColor || null,
    thematicColors: readThematicColors(thematicColors),
  };
}

// The stored shape. A block is kept as WordPress parsed it; the renderers
// read it defensively, as they read WordPress's answer.
const parsedBlock: z.ZodType<WpParsedBlock> = z.lazy(() =>
  z.object({
    blockName: z.string().nullable(),
    attrs: z.record(z.string(), z.unknown()).nullable(),
    innerBlocks: z.array(parsedBlock),
    innerHTML: z.string(),
    innerContent: z.array(z.string().nullable()),
  }),
) as z.ZodType<WpParsedBlock>;

export const storedNomiaContent = z.object({
  blocks: z.array(parsedBlock),
  thematicColors: z.array(z.object({ slug: z.string(), color: z.string() })).optional(),
  pageBackgroundColor: z.string().nullable(),
});

const text = (value: unknown) => (typeof value === "string" ? value : null);

/**
 * Pages and posts built with Nomia's blocks, as the content runtime's
 * extension (src/lib/content.ts): their parsed blocks and the page's
 * background colour, read with each of them, stored with the publication and
 * served as its `extension`.
 */
export const nomiaExtension: ContentExtension<NomiaContent> = {
  fields: {
    page: "wpBlocksJson gqBioeconomiaPageBackgroundColor gqBioeconomiaThematicColors { slug color }",
    post: "wpBlocksJson gqBioeconomiaThematicColors { slug color }",
  },
  read: ({ fields }) =>
    nomiaContent(
      text(fields.wpBlocksJson),
      text(fields.gqBioeconomiaPageBackgroundColor),
      fields.gqBioeconomiaThematicColors,
    ),
  // As it was stored, so reconciliation compares it with new reads as it is.
  parse: (stored) =>
    storedNomiaContent.safeParse(stored).success ? (stored as NomiaContent) : undefined,
};
