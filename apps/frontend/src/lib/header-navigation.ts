import { safeHref } from "./safe-href";
import { menuItemHref, type WordPressMenuItem } from "@getquick/content";

/**
 * The navigation block's menu (`menuItems`, filled by nomia-blocks'
 * `wpBlocksJson` from the menu the editor picked) as a tree: WordPress lists
 * the items flat, in menu order, each pointing at its parent. An item whose
 * parent is missing from the list is shown at the top level, and links into
 * this site become frontend paths, as the site menu's do.
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
    return [
      {
        parentId: String(row.parentId ?? ""),
        node: {
          id,
          label,
          href: url ? menuItemHref(url, internalOrigins) : "#",
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
