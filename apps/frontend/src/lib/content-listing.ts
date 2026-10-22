import type { WordPressImage } from "@getquick/content";
import type { CollectionKey, ListingQuery } from "./content-collections";
import { content } from "./content";

/*
 * The Listing and Filters blocks' seam onto gq-content's collections: the
 * listing query and the terms with their counts, both answered from the
 * publication store. The blocks list the Page they sit on, so they don't need
 * the runtime's `archiveUri`. @getquick/content 0.2.0 has neither yet
 * (gq-content's archive-pages work adds them), so until the Site is on that
 * release every call answers `unavailable` and the blocks render their empty
 * state. The types below are the provisional API; replace them with the
 * package's own when it ships.
 */

export interface ListingItem {
  uri: string;
  title: string;
  date: string;
  modifiedAt?: string;
  excerpt: string;
  featuredImage: WordPressImage | null;
  terms?: Record<string, Array<{ slug: string; name: string }>>;
  extension?: unknown;
}

export type ListingResult =
  | { kind: "found"; items: ListingItem[]; total: number; page: number; pages: number }
  | { kind: "unavailable" };

export interface CollectionTerm {
  slug: string;
  name: string;
  count: number;
}

interface CollectionsRuntime {
  list(query: {
    collection: string;
    terms?: Record<string, string[]>;
    search?: string;
    page?: number;
    perPage?: number;
  }): Promise<ListingResult>;
  terms(
    collection: string,
    taxonomy: string,
  ): Promise<
    CollectionTerm[] | { kind: "found"; terms: CollectionTerm[] } | { kind: "unavailable" }
  >;
}

function collectionsRuntime(): Partial<CollectionsRuntime> {
  return content() as unknown as Partial<CollectionsRuntime>;
}

/** A page of a collection's items, from the publication store. */
export async function listCollection(query: ListingQuery): Promise<ListingResult> {
  const runtime = collectionsRuntime();
  if (typeof runtime.list !== "function") return { kind: "unavailable" };
  try {
    return await runtime.list(query);
  } catch (error) {
    console.error("[content-listing] list failed", error);
    return { kind: "unavailable" };
  }
}

/** A collection's terms in a taxonomy, with their item counts; none when unavailable. */
export async function collectionTerms(
  collection: CollectionKey,
  taxonomy: string,
): Promise<CollectionTerm[]> {
  const runtime = collectionsRuntime();
  if (typeof runtime.terms !== "function") return [];
  try {
    const answer = await runtime.terms(collection, taxonomy);
    if (Array.isArray(answer)) return answer;
    return answer.kind === "found" ? answer.terms : [];
  } catch (error) {
    console.error("[content-listing] terms failed", error);
    return [];
  }
}
