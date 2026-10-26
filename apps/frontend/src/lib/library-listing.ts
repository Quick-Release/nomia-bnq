import type { CollectionItem } from "@getquick/content";
import type { NomiaExtension } from "./nomia-content";
import type { ListingQuery, ListingSettings } from "./content-collections";
import { listCollection } from "./content-listing";
import { contactDetailsLines } from "./contact-details-card";
import { safeHref } from "./safe-href";

export const LIBRARY_PARAMS = { year: "ano", publisher: "fonte" } as const;

export interface LibraryRow {
  href: string;
  title: string;
  imageSrc: string | null;
  imageAlt: string;
  year: number | null;
  publisher: string;
  description: string;
  fileUrl: string;
  pageUrl: string;
}

export function isLegislationListing(settings: ListingSettings | null): boolean {
  return (
    settings?.collection === "biblioteca" &&
    settings.taxonomy === "categoria_biblioteca" &&
    settings.term === "legislacao"
  );
}

export function libraryRow(item: CollectionItem<NomiaExtension>): LibraryRow {
  const document =
    item.extension && "kind" in item.extension && item.extension.kind === "library-document"
      ? item.extension
      : null;
  return {
    href: item.uri,
    title: item.title.trim() || "Sem título",
    imageSrc: item.featuredImage?.sourceUrl || null,
    imageAlt: item.featuredImage?.altText || "",
    year: document?.year ?? null,
    publisher: document?.publisher ?? "",
    description: contactDetailsLines(item.excerpt).join(" "),
    fileUrl: safeHref(document?.fileUrl),
    pageUrl: safeHref(document?.pageUrl),
  };
}

/**
 * Read all matching documents before deriving year/source facets or paginating.
 * Only the runtime's public listing API is used, never a live CMS request.
 * Both blocks share this result for one request, as the Indicador blocks do.
 */
export async function readLibraryRows(
  query: ListingQuery,
  list: typeof listCollection = listCollection,
): Promise<LibraryRow[] | null> {
  const rows: LibraryRow[] = [];
  for (let page = 1, pages = 1; page <= pages; page++) {
    const result = await list({ ...query, search: undefined, page, perPage: 100 });
    if (result.kind !== "found") return null;
    rows.push(...result.items.map(libraryRow));
    pages = result.pages;
  }
  return rows;
}

const perRequest = new WeakMap<Request, Map<string, Promise<LibraryRow[] | null>>>();

export function libraryRows(request: Request, query: ListingQuery): Promise<LibraryRow[] | null> {
  let queries = perRequest.get(request);
  if (!queries) {
    queries = new Map();
    perRequest.set(request, queries);
  }
  const key = JSON.stringify([query.collection, query.terms]);
  let rows = queries.get(key);
  if (!rows) {
    rows = readLibraryRows(query);
    queries.set(key, rows);
  }
  return rows;
}

export function libraryChoices(rows: LibraryRow[], params: URLSearchParams) {
  return [
    {
      param: LIBRARY_PARAMS.year,
      label: "Ano",
      values: rows.flatMap((r) => (r.year ? [String(r.year)] : [])),
    },
    {
      param: LIBRARY_PARAMS.publisher,
      label: "Publicado por",
      values: rows.flatMap((r) => (r.publisher ? [r.publisher] : [])),
    },
  ].map(({ param, label, values }) => {
    const counts = new Map<string, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    const options = [...counts].map(([name, count]) => ({ slug: name, name, count }));
    options.sort((a, b) =>
      param === LIBRARY_PARAMS.year
        ? Number(b.name) - Number(a.name)
        : a.name.localeCompare(b.name, "pt"),
    );
    return { param, label, selected: params.get(param) ?? "", options };
  });
}

const normalize = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** Filter the whole collection, then paginate: a match may be on a later store page. */
export function libraryPage(rows: LibraryRow[], query: ListingQuery, params: URLSearchParams) {
  const year = params.get(LIBRARY_PARAMS.year)?.trim();
  const publisher = params.get(LIBRARY_PARAMS.publisher)?.trim();
  const search = normalize(query.search ?? "");
  const matching = rows.filter(
    (row) =>
      (!year || (row.year !== null && String(row.year) === year)) &&
      (!publisher || row.publisher === publisher) &&
      (!search || normalize(`${row.title} ${row.description} ${row.publisher}`).includes(search)),
  );
  const pages = Math.ceil(matching.length / query.perPage);
  const page = Math.min(query.page, Math.max(1, pages));
  return {
    kind: "found" as const,
    items: matching.slice((page - 1) * query.perPage, page * query.perPage),
    total: matching.length,
    pages,
    page,
  };
}
