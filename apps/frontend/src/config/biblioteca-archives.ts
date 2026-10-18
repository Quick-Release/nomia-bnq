/**
 * Biblioteca section — card targets (CPT / listing paths), relative to site origin.
 * The category pages filter the `biblioteca` CPT by `categoria_biblioteca` terms.
 */
export const BIBLIOTECA_ARCHIVE_PATHS = {
  /** Main library listing (`bibliotecas` in WPGraphQL). */
  biblioteca: "/biblioteca/",
  legislacao: "/biblioteca/legislacao/",
  publicacoes: "/biblioteca/publicacoes/",
  boasPraticas: "/biblioteca/boas-praticas/",
  newsletters: "/biblioteca/newsletters/",
  glossario: "/biblioteca/glossario/",
} as const;

export const BIBLIOTECA_CATEGORY_ARCHIVES = [
  {
    title: "Legislação",
    path: BIBLIOTECA_ARCHIVE_PATHS.legislacao,
    termSlug: "legislacao",
  },
  {
    title: "Publicações",
    path: BIBLIOTECA_ARCHIVE_PATHS.publicacoes,
    termSlug: "publicacoes",
  },
  {
    title: "Boas práticas",
    path: BIBLIOTECA_ARCHIVE_PATHS.boasPraticas,
    termSlug: "boas-praticas",
  },
  {
    title: "Newsletters",
    path: BIBLIOTECA_ARCHIVE_PATHS.newsletters,
    termSlug: "newsletters",
  },
] as const;
