import type { CollectionTermCount, NotServed } from "@getquick/content";
import type { CollectionKey, ListingQuery } from "./content-collections";
import { content, type ContentRuntime } from "./content";

/*
 * The Listing and Filters blocks' seam onto gq-content's collections: the
 * runtime's `list` and `terms`, both answered from the publication store. The
 * blocks list the Page they sit on, so they don't need its `archiveUri`.
 */

export type CollectionListing = Awaited<ReturnType<ContentRuntime["list"]>>;

const notListed: NotServed = {
  kind: "unavailable",
  failure: { reason: "not-ready", message: "The collection couldn't be listed" },
};

/**
 * A page of a collection's items, from the publication store. The runtime
 * throws on a collection or taxonomy it wasn't configured with; the block
 * then shows its unavailable state rather than failing the whole Page.
 */
export async function listCollection(query: ListingQuery): Promise<CollectionListing> {
  try {
    return await content().list(query);
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
  try {
    const answer = await content().terms(collection, taxonomy);
    return answer.kind === "found" ? answer.terms : [];
  } catch (error) {
    console.error("[content-listing] terms failed", error);
    return [];
  }
}
