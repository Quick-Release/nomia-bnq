/** Nomia's page adapter for the supported gq-content site-wide search API. */
export interface SiteSearchQuery {
  search: string;
  page: number;
  perPage: number;
  language?: string;
}
export interface SiteSearchPage {
  items: Array<{ uri: string; title: string; excerpt: string }>;
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
export type SearchResult = { kind: "found"; content: SiteSearchPage } | { kind: "unavailable" };
interface SearchRuntime {
  search(query: SiteSearchQuery): Promise<SearchResult>;
}

function supportsSearch(runtime: object): runtime is SearchRuntime {
  return "search" in runtime && typeof runtime.search === "function";
}

/** The currently pinned 0.3.2 has no search API; keep that a visible unavailable state. */
export async function siteSearch(runtime: object, query: SiteSearchQuery): Promise<SearchResult> {
  if (!supportsSearch(runtime)) return { kind: "unavailable" };
  try {
    return await runtime.search(query);
  } catch (error) {
    console.error("[nomia-search] Search unavailable", error);
    return { kind: "unavailable" };
  }
}

export function siteSearchQuery(params: URLSearchParams): SiteSearchQuery {
  const page = Number(params.get("pagina") || 1);
  return {
    search: (params.get("q") || "").trim().slice(0, 200),
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    perPage: 12,
  };
}
