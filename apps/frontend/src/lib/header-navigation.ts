import { safeHref } from "./safe-href";
import { menuItemHref, type WordPressMenuItem } from "@getquick/content";
import { thematicAreaSlug } from "./thematic-area";

/**
 * The navigation block's menu (`menuItems`, filled by gq-bioeconomia's
 * `wpBlocksJson` from the menu the editor picked) as a tree: WordPress lists
 * the items flat, in menu order, each pointing at its parent. An item whose
 * parent is missing from the list is shown at the top level, and links into
 * this site become frontend paths, as the site menu's do. A placeholder item
 * (a custom link to "#", or none) has an empty `href`: it only groups its
 * subitems, and is drawn as their toggle rather than a link.
 */
export function headerNavigationTree(
  items: unknown,
  internalOrigins: string[],
): WordPressMenuItem[] {
  if (!Array.isArray(items)) return [];

  const rows = items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const id = String(row.id ?? "");
    const label = typeof row.label === "string" ? row.label.trim() : "";
    if (!id || !label) return [];
    const url = safeHref(row.url);
    const placeholder = !url || url === "#";
    return [
      {
        parentId: String(row.parentId ?? ""),
        node: {
          id,
          label,
          href: placeholder ? "" : menuItemHref(url, internalOrigins),
          target: typeof row.target === "string" && row.target ? row.target : null,
          children: [],
        } satisfies WordPressMenuItem,
      },
    ];
  });

  const byId = new Map(rows.map((row) => [row.node.id, row.node]));
  const roots: WordPressMenuItem[] = [];
  for (const { parentId, node } of rows) {
    const parent = parentId !== node.id ? byId.get(parentId) : undefined;
    (parent ? parent.children : roots).push(node);
  }
  return roots;
}

/**
 * The thematic area a navigation item is colored by: its own link's, else,
 * for an item that only groups others (Economia Circular → its pages), the
 * one area its subitems with an area share. Null for any other item.
 */
export function headerNavigationArea(
  item: WordPressMenuItem,
  internalOrigins: string[],
): string | null {
  const own = item.href ? thematicAreaSlug(item.href, internalOrigins) : null;
  if (own || !item.children.length) return own;
  const areas = new Set(
    item.children.flatMap((child) => headerNavigationArea(child, internalOrigins) ?? []),
  );
  const [area] = areas;
  return areas.size === 1 ? area : null;
}
