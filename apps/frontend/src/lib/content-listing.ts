import type { WordPressImage } from "@getquick/content";
import type { CollectionKey, ListingQuery } from "./content-collections";
import { content } from "./content";

/*
 * The Listing and Filters blocks' seam onto gq-content's collections: the
 * runtime's `list` and `terms`, both answered from the publication store. The
 * blocks list the Page they sit on, so they don't need its `archiveUri`.
 *
 * @getquick/content 0.2.0 has neither, so until the Site is on the release
 * that adds them (gq-content#38) every call answers `unavailable` and the
 * blocks render their empty state. The types below copy that release's
 * (`CollectionListing`, `CollectionTermListing`); on the bump, import them
 * from @getquick/content and drop the feature detection.
 */

/** Why the store didn't answer (the runtime's `NotServed`). */
type Unavailable = { kind: "unavailable"; failure: { reason: string; message: string } };

export interface CollectionItem {
  uri: string;
  title: string;
  date: string;
  modifiedAt: number | null;
  excerpt: string;
  featuredImage: WordPressImage | null;
  terms: Record<string, Array<{ slug: string; name: string }>>;
  extension?: unknown;
  language?: string;
}

export type CollectionListing =
  | { kind: "found"; items: CollectionItem[]; total: number; page: number; pages: number }
  | Unavailable;

export interface CollectionTermCount {
  slug: string;
  name: string;
  count: number;
}

type CollectionTermListing = { kind: "found"; terms: CollectionTermCount[] } | Unavailable;

interface CollectionsRuntime {
  list(query: {
    collection: string;
    terms?: Record<string, readonly string[]>;
    search?: string;
    page?: number;
    perPage?: number;
  }): Promise<CollectionListing>;
  terms(collection: string, taxonomy: string): Promise<CollectionTermListing>;
}

const notListed: Unavailable = {
  kind: "unavailable",
  failure: { reason: "not-ready", message: "This @getquick/content doesn't list collections" },
};

function collectionsRuntime(): Partial<CollectionsRuntime> {
  return content() as unknown as Partial<CollectionsRuntime>;
}

/**
 * A page of a collection's items, from the publication store. The runtime
 * throws on a collection or taxonomy it wasn't configured with; the block
 * then shows its unavailable state rather than failing the whole Page.
 */
export async function listCollection(query: ListingQuery): Promise<CollectionListing> {
  const runtime = collectionsRuntime();
  if (typeof runtime.list !== "function") return notListed;
  try {
    return await runtime.list(query);
  } catch (error) {
    console.error("[content-listing] list failed", error);
    return notListed;
  }
}

/** A collection's terms in a taxonomy that its items have, with their counts; none when unavailable. */
export async function collectionTerms(
  collection: CollectionKey,
  taxonomy: string,
): Promise<CollectionTermCount[]> {
  const runtime = collectionsRuntime();
  if (typeof runtime.terms !== "function") return [];
  try {
    const answer = await runtime.terms(collection, taxonomy);
    return answer.kind === "found" ? answer.terms : [];
  } catch (error) {
    console.error("[content-listing] terms failed", error);
    return [];
  }
}
