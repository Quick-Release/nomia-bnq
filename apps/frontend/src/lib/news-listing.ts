import { listingPagination } from "./content-collections";

export interface NewsPage {
  items: Array<{ uri: string; title: string; excerpt: string; language: string }>;
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
export type NewsResult = { kind: "found"; content: NewsPage } | { kind: "unavailable" };
interface NewsRuntime {
  listPosts(query: { page: number; perPage: number; language: string }): Promise<NewsResult>;
}

export const NEWS_PATH = "/noticias/";

function supportsNewsRuntime(runtime: unknown): runtime is NewsRuntime {
  return (
    typeof runtime === "object" &&
    runtime !== null &&
    "listPosts" in runtime &&
    typeof runtime.listPosts === "function"
  );
}

/** Use only the runtime's public, store-backed standard post listing. */
export async function readNews(runtime: unknown, url: URL, language: string): Promise<NewsResult> {
  if (!supportsNewsRuntime(runtime)) {
    return { kind: "unavailable" };
  }
  const page = Number(url.searchParams.get("pagina"));
  try {
    return await runtime.listPosts({
      page: Number.isSafeInteger(page) && page > 0 ? page : 1,
      perPage: 12,
      language,
    });
  } catch (error) {
    console.error("[nomia-news] Listing unavailable", error);
    return { kind: "unavailable" };
  }
}

/** Empty pages after the last page still belong to a nonempty news archive. */
export function newsPresentation(news: NewsResult, url: URL) {
  if (news.kind !== "found") return { state: "unavailable" as const, status: 503 as const };
  if (news.content.total === 0) return { state: "empty" as const, status: 200 as const };
  return {
    state: "published" as const,
    status: 200 as const,
    rows: news.content.items.map((item) => ({
      href: item.uri,
      title: item.title.trim() || "Sem título",
      imageSrc: null,
      imageAlt: "",
    })),
    pagination: listingPagination(url, news.content.page, news.content.totalPages),
  };
}
