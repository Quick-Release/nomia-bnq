import type { CollectionMembership } from "@getquick/content";

/**
 * Collections whose items never show their WordPress date: it is when the
 * item was added to the site, which says nothing about a Biblioteca document
 * or a Plataforma.
 */
const UNDATED_COLLECTIONS: ReadonlySet<string> = new Set(["biblioteca", "plataformas"]);

/** Whether a dated entry's page shows its date. */
export function showsEntryDate(collection: CollectionMembership | undefined): boolean {
  return !collection || !UNDATED_COLLECTIONS.has(collection.name);
}
