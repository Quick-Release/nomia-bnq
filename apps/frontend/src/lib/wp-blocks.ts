import { parse } from "@wordpress/block-serialization-default-parser";

export type WpParsedBlock = ReturnType<typeof parse>[number];

/** One segment when walking `innerContent` (null placeholders = child blocks). */
export type WpInnerPiece = { type: "html"; html: string } | { type: "block"; block: WpParsedBlock };

/**
 * Parses the block-editor serialization from WP (`post_content`), including `attrs` and
 * `innerBlocks`. Requires `content(format: RAW)` from WPGraphQL (often needs JWT).
 */
export function parseSerializedWpBlocks(raw: string | null | undefined): WpParsedBlock[] {
  if (raw == null || !String(raw).trim()) return [];
  try {
    return parse(String(raw));
  } catch {
    return [];
  }
}

export function parseWpBlocksJson(raw: string | null | undefined): WpParsedBlock[] {
  if (raw == null || !String(raw).trim()) return [];
  try {
    const blocks = JSON.parse(String(raw));
    return Array.isArray(blocks) ? (blocks as WpParsedBlock[]) : [];
  } catch {
    return [];
  }
}

/**
 * Recovers Getquick/Nomia blocks from the debug comments emitted by the WP
 * render_callback. This is a fallback for endpoints where `content(format: RAW)`
 * is not available but `content(format: RENDERED)` still exposes attributes.
 */
export function parseRenderedGetquickBlocks(raw: string | null | undefined): WpParsedBlock[] {
  if (raw == null || !String(raw).trim()) return [];

  const blocks: WpParsedBlock[] = [];
  const pattern =
    /<!--\s*getquick\/([a-z0-9-]+)\s+rendered by Astro \((?:Bioeconomia\.pt|nomia-fe)\)\.\s+attributes:\s*([\s\S]*?)\s*-->/g;

  for (const match of String(raw).matchAll(pattern)) {
    const [, catalogId, attrsJson] = match;
    try {
      const attrs = JSON.parse(attrsJson.trim());
      blocks.push({
        blockName: `getquick/${catalogId}`,
        attrs: attrs && typeof attrs === "object" && !Array.isArray(attrs) ? attrs : {},
        innerBlocks: [],
        innerHTML: "",
        innerContent: [],
      } as WpParsedBlock);
    } catch {
      // Ignore malformed debug comments and continue parsing later blocks.
    }
  }

  return blocks;
}

/** Flattens `innerContent` + `innerBlocks` into an ordered list for rendering. */
export function flattenInnerContent(block: WpParsedBlock): WpInnerPiece[] {
  const hasNull = block.innerContent?.some((p) => p === null) ?? false;
  if (hasNull && block.innerContent?.length) {
    const out: WpInnerPiece[] = [];
    let i = 0;
    for (const part of block.innerContent) {
      if (part === null) {
        const child = block.innerBlocks[i++];
        if (child) out.push({ type: "block", block: child });
      } else if (part) {
        out.push({ type: "html", html: part });
      }
    }
    return out;
  }
  if (block.innerBlocks.length > 0) {
    return block.innerBlocks.map((b) => ({ type: "block", block: b }));
  }
  return [];
}

function escapedRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containerTagPattern(tagName: string, closing = false) {
  const escapedTagName = escapedRegExp(tagName);
  return closing
    ? new RegExp(`</${escapedTagName}\\s*>`, "i")
    : new RegExp(`<${escapedTagName}(?=\\s|>)[^>]*>`, "i");
}

function findContainerTag(html: string, pattern: RegExp, fromEnd = false) {
  const matches = [...html.matchAll(new RegExp(pattern.source, `${pattern.flags}g`))];
  return fromEnd ? matches.at(-1) : matches[0];
}

function removeContainerTag(html: string, pattern: RegExp, fromEnd = false) {
  const match = findContainerTag(html, pattern, fromEnd);
  if (!match || match.index === undefined) return html;
  return html.slice(0, match.index) + html.slice(match.index + match[0].length);
}

function stripContainerTags(
  pieces: WpInnerPiece[],
  openingPattern: RegExp,
  closingPattern: RegExp,
  openingIndex: number,
  closingIndex: number,
) {
  const out: WpInnerPiece[] = [];
  for (const [index, piece] of pieces.entries()) {
    if (piece.type === "block") {
      out.push(piece);
      continue;
    }

    let html = piece.html;
    if (index === openingIndex) html = removeContainerTag(html, openingPattern);
    if (index === closingIndex) html = removeContainerTag(html, closingPattern, true);
    out.push({ type: "html", html });
  }
  return out;
}

/**
 * Splits a serialized container's boundary tags from its ordered pieces so a renderer can emit
 * them around a slot. It returns the exact saved tags for fidelity; the last matching close is
 * the outer boundary when legacy nested markup is present. Incomplete wrappers fall back to
 * unwrapped content.
 */
export function splitWpContainerInnerContent(block: WpParsedBlock, tagName: string) {
  const flattened = flattenInnerContent(block);
  const pieces: WpInnerPiece[] =
    flattened.length > 0
      ? flattened
      : block.innerHTML.trim()
        ? [{ type: "html", html: block.innerHTML }]
        : [];
  const openingPattern = containerTagPattern(tagName);
  const closingPattern = containerTagPattern(tagName, true);
  const openingIndex = pieces.findIndex(
    (piece) => piece.type === "html" && openingPattern.test(piece.html),
  );
  const closingIndex = pieces.findLastIndex(
    (piece, index) =>
      index >= (openingIndex === -1 ? 0 : openingIndex) &&
      piece.type === "html" &&
      closingPattern.test(piece.html),
  );
  const openingTag =
    openingIndex !== -1 && pieces[openingIndex].type === "html"
      ? findContainerTag(pieces[openingIndex].html, openingPattern)?.[0]
      : undefined;
  const closingTag =
    closingIndex !== -1 && pieces[closingIndex].type === "html"
      ? findContainerTag(pieces[closingIndex].html, closingPattern, true)?.[0]
      : undefined;
  const wrapped = openingTag !== undefined && closingTag !== undefined;

  return {
    pieces: wrapped
      ? stripContainerTags(pieces, openingPattern, closingPattern, openingIndex, closingIndex)
      : pieces,
    wrapped,
    openingTag,
    closingTag,
  };
}

export function blockHasNestedChildren(block: WpParsedBlock): boolean {
  return flattenInnerContent(block).some((p) => p.type === "block");
}

export function blockIsLeaf(block: WpParsedBlock): boolean {
  return !blockHasNestedChildren(block);
}
