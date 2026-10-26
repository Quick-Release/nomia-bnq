import type { CollectionConfig } from "@getquick/content";

/**
 * Nomia's collections: the gq-bioeconomia content types gq-content stores, so their
 * items are served and listed from the publication store, never by reading
 * WordPress on a visit. A collection's key is its post type's name, and the
 * Listing and Filters blocks choose one by it. The editor reads the same table
 * (`window.gqBioeconomiaFrontendRules`), so its choices match what renders.
 */

/** A taxonomy a collection is filtered by, and the query parameter that carries it. */
export interface CollectionTaxonomy {
  taxonomy: string;
  /** The query parameter the Filters block writes and the Listing reads. */
  param: string;
  label: string;
}

export interface ContentCollection {
  label: string;
  /** Its WPGraphQL type, gq-bioeconomia's `graphql_single_name`. */
  graphqlType: string;
  /** In the Filters block's order; the first is the collection's category. */
  taxonomies: readonly CollectionTaxonomy[];
}

const TEMATICAS: CollectionTaxonomy = {
  taxonomy: "tematicas",
  param: "tematica",
  label: "Temática",
};
const SETORES: CollectionTaxonomy = {
  taxonomy: "setor_atividade",
  param: "setor",
  label: "Setor de atividade",
};
const GLOBAL_TAXONOMIES = [TEMATICAS, SETORES] as const;

export const CONTENT_COLLECTIONS = {
  gq_bio_gallery: { label: "Galerias", graphqlType: "Galeria", taxonomies: [] },
  biblioteca: {
    label: "Biblioteca",
    graphqlType: "Biblioteca",
    taxonomies: [
      { taxonomy: "categoria_biblioteca", param: "categoria", label: "Categoria" },
      ...GLOBAL_TAXONOMIES,
    ],
  },
  eventos: {
    label: "Eventos",
    graphqlType: "Evento",
    taxonomies: [
      { taxonomy: "tipo_evento", param: "tipo", label: "Tipo de evento" },
      ...GLOBAL_TAXONOMIES,
    ],
  },
  oportunidades: {
    label: "Oportunidades",
    graphqlType: "Oportunidade",
    taxonomies: [
      { taxonomy: "categoria_oportunidade", param: "categoria", label: "Categoria" },
      ...GLOBAL_TAXONOMIES,
    ],
  },
  recursos_educativos: {
    label: "Recursos educativos",
    graphqlType: "RecursoEducativo",
    taxonomies: GLOBAL_TAXONOMIES,
  },
  glossario: { label: "Glossário", graphqlType: "Glossario", taxonomies: GLOBAL_TAXONOMIES },
  indicadores: { label: "Indicadores", graphqlType: "Indicador", taxonomies: GLOBAL_TAXONOMIES },
  infografias: { label: "Infografias", graphqlType: "Infografia", taxonomies: GLOBAL_TAXONOMIES },
  videos: { label: "Vídeos", graphqlType: "Video", taxonomies: GLOBAL_TAXONOMIES },
  podcasts: { label: "Podcasts", graphqlType: "Podcast", taxonomies: GLOBAL_TAXONOMIES },
  ferramentas: { label: "Ferramentas", graphqlType: "Ferramenta", taxonomies: GLOBAL_TAXONOMIES },
  plataformas: { label: "Plataformas", graphqlType: "Plataforma", taxonomies: GLOBAL_TAXONOMIES },
  bases_de_dados: {
    label: "Bases de dados",
    graphqlType: "BaseDeDados",
    taxonomies: GLOBAL_TAXONOMIES,
  },
} as const satisfies Record<string, ContentCollection>;

/**
 * The runtime's `collections` setting (@getquick/content's `CollectionConfig`):
 * which gq-bioeconomia types gq-content stores, and the taxonomies their items keep
 * (src/lib/content.ts). Every taxonomy must be in WPGraphQL: gq-bioeconomia shows
 * them all.
 */
export const RUNTIME_COLLECTIONS: Record<string, CollectionConfig> = Object.fromEntries(
  Object.entries(CONTENT_COLLECTIONS).map(([postType, collection]) => [
    postType,
    {
      postType,
      graphqlType: collection.graphqlType,
      taxonomies: collection.taxonomies.map(({ taxonomy }) => taxonomy),
    },
  ]),
);

export type CollectionKey = keyof typeof CONTENT_COLLECTIONS;

export const COLLECTION_KEYS = Object.keys(CONTENT_COLLECTIONS) as CollectionKey[];

/** The Listing's presentations, ported from bioeconomia.pt's archive shells. */
export const LISTING_DISPLAYS = [
  "list",
  "thumbnail-grid",
  "titled-thumbnail-grid",
  "document-grid",
] as const;
export type ListingDisplay = (typeof LISTING_DISPLAYS)[number];

export const LISTING_PER_PAGE_DEFAULT = 12;
export const LISTING_PER_PAGE_MAX = 48;

/** The query parameters every Listing reads besides its collection's taxonomies. */
export const LISTING_PARAMS = { search: "q", page: "pagina" } as const;

export function readCollection(value: unknown): CollectionKey | null {
  return typeof value === "string" && value in CONTENT_COLLECTIONS
    ? (value as CollectionKey)
    : null;
}

export function readListingDisplay(value: unknown): ListingDisplay {
  return LISTING_DISPLAYS.includes(value as ListingDisplay) ? (value as ListingDisplay) : "list";
}

export function readPerPage(value: unknown): number {
  const count = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(count) || count < 1) return LISTING_PER_PAGE_DEFAULT;
  return Math.min(count, LISTING_PER_PAGE_MAX);
}

/** The Listing block's settings, as the renderer reads them. */
export interface ListingSettings {
  collection: CollectionKey;
  /** A term the editor fixed: a category Page lists only its category. */
  taxonomy: string | null;
  term: string | null;
  perPage: number;
}

/** The query a Listing asks the publication store, from its settings and the visit's URL. */
export interface ListingQuery {
  collection: CollectionKey;
  terms: Record<string, string[]>;
  search?: string;
  page: number;
  perPage: number;
}

/**
 * The query for a visit. A term fixed in the block always applies; the
 * Filters block's parameters narrow it further. A parameter for a taxonomy
 * the editor already fixed is ignored, so a category Page can't be widened.
 */
export function listingQuery(settings: ListingSettings, params: URLSearchParams): ListingQuery {
  const collection = CONTENT_COLLECTIONS[settings.collection];
  const terms: Record<string, string[]> = {};
  const fixed = settings.taxonomy && settings.term ? settings.taxonomy : null;
  if (fixed) terms[fixed] = [settings.term!];
  for (const { taxonomy, param } of collection.taxonomies) {
    if (taxonomy === fixed) continue;
    const slugs = params
      .getAll(param)
      .map((slug) => slug.trim())
      .filter(Boolean);
    if (slugs.length > 0) terms[taxonomy] = [...new Set(slugs)];
  }
  const search = params.get(LISTING_PARAMS.search)?.trim();
  const page = Number(params.get(LISTING_PARAMS.page));
  return {
    collection: settings.collection,
    terms,
    ...(search ? { search } : {}),
    page: Number.isInteger(page) && page > 1 ? page : 1,
    perPage: settings.perPage,
  };
}

/** Whether the visitor narrowed the listing, beyond the term the editor fixed. */
export function isFilteredByVisitor(settings: ListingSettings, query: ListingQuery): boolean {
  const fixed = settings.taxonomy && settings.term ? settings.taxonomy : null;
  return Boolean(query.search) || Object.keys(query.terms).some((taxonomy) => taxonomy !== fixed);
}

/** The same address on another page of the listing, keeping its filters. */
export function listingPageHref(url: URL, page: number): string {
  const params = new URLSearchParams(url.search);
  if (page > 1) params.set(LISTING_PARAMS.page, String(page));
  else params.delete(LISTING_PARAMS.page);
  const query = params.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
}

/** The Listing's pagination links for a visit: every page, and the previous and next. */
export function listingPagination(url: URL, page: number, pages: number) {
  return {
    pages: Array.from({ length: pages }, (_, index) => ({
      page: index + 1,
      href: listingPageHref(url, index + 1),
      current: index + 1 === page,
    })),
    previous: page > 1 ? listingPageHref(url, page - 1) : null,
    next: page < pages ? listingPageHref(url, page + 1) : null,
  };
}
