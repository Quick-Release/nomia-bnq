import { getCanonicalArchivePath } from "./cpt-archives";

/**
 * Paths to WordPress CPT archives (or listing pages), relative to the site origin.
 * The canonical paths are owned by the archive registry; this named map remains
 * for landing-section callers that need a small, stable subset.
 */
export const CONTENT_TYPE_ARCHIVE_PATHS = {
  infografias: getCanonicalArchivePath("infografias"),
  videos: getCanonicalArchivePath("videos"),
  podcasts: getCanonicalArchivePath("podcasts"),
  galeria: getCanonicalArchivePath("galeria"),
  plataformas: getCanonicalArchivePath("plataformas"),
  basesDeDados: getCanonicalArchivePath("basesDeDados"),
} as const;
