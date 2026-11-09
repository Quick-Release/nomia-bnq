import type { CollectionItem } from "@getquick/content";
import { contactDetailsLines } from "./contact-details-card";
import { listCollection } from "./content-listing";
import { libraryRow, type LibraryRow } from "./library-listing";
import type { NomiaExtension } from "./nomia-content";
import { nutsCodeOfSlug, nutsMemberships } from "./nuts";

/*
 * The NUTS map block's seam onto gq-content's `biblioteca` collection: the
 * published Boas práticas (the `boas-praticas` Biblioteca category), with
 * their NUTS regions, from the publication store alone.
 * Those tagged Internacional are kept apart: the map leaves them out, and the
 * block lists them under Boas Práticas internacionais.
 */

export const BOAS_PRATICAS_TERM = {
  taxonomy: "categoria_biblioteca",
  slug: "boas-praticas",
} as const;
export const NUTS_TAXONOMY = "regiao_nuts";
/** The `regiao_nuts` term for an entry outside Portugal (gq-bioeconomia's `Nuts::INTERNATIONAL_SLUG`). */
export const INTERNATIONAL_SLUG = "internacional";

export interface BoaPratica {
  href: string;
  title: string;
  excerpt: string;
  /** The NUTS codes it is tagged with and every region above them. */
  regions: string[];
}

export function boaPratica(item: CollectionItem<NomiaExtension>): BoaPratica {
  const tagged = (item.terms[NUTS_TAXONOMY] ?? [])
    .map((term) => nutsCodeOfSlug(term.slug))
    .filter((code): code is string => code !== null);
  return {
    href: item.uri,
    title: item.title.trim() || "Sem título",
    excerpt: contactDetailsLines(item.excerpt).join(" "),
    regions: nutsMemberships(tagged),
  };
}

export function isInternational(item: CollectionItem<NomiaExtension>): boolean {
  return (item.terms[NUTS_TAXONOMY] ?? []).some((term) => term.slug === INTERNATIONAL_SLUG);
}

export interface BoasPraticas {
  /** The entries on the map: every one not tagged Internacional. */
  items: BoaPratica[];
  /** The entries tagged Internacional, as the Listing block's rows. */
  international: LibraryRow[];
}

/** Every published Boa prática, newest first; null when the store can't be read. */
async function readAll(list: typeof listCollection): Promise<BoasPraticas | null> {
  const all: CollectionItem<NomiaExtension>[] = [];
  for (let page = 1, pages = 1; page <= pages; page++) {
    const result = await list({
      collection: "biblioteca",
      terms: { [BOAS_PRATICAS_TERM.taxonomy]: [BOAS_PRATICAS_TERM.slug] },
      page,
      perPage: 100,
    });
    if (result.kind !== "found") return null;
    all.push(...(result.items as CollectionItem<NomiaExtension>[]));
    pages = result.pages;
  }
  const national = all.filter((item) => !isInternational(item));
  return {
    items: national.map(boaPratica),
    international: all.filter(isInternational).map(libraryRow),
  };
}

// A page with two map blocks lists the entries once.
const perRequest = new WeakMap<Request, Promise<BoasPraticas | null>>();

export function publishedBoasPraticas(
  request: Request,
  list: typeof listCollection = listCollection,
): Promise<BoasPraticas | null> {
  let answer = perRequest.get(request);
  if (!answer) {
    answer = readAll(list);
    perRequest.set(request, answer);
  }
  return answer;
}
