import type { CollectionMembership } from "@getquick/content";

/**
 * Collections whose items never show their publication date: a Biblioteca
 * document's date is when it was added to the site, not when it was published.
 */
const UNDATED_COLLECTIONS: ReadonlySet<string> = new Set(["biblioteca"]);

/** Whether a dated entry's page shows its publication date. */
export function showsPublicationDate(collection: CollectionMembership | undefined): boolean {
  return !collection || !UNDATED_COLLECTIONS.has(collection.name);
}
