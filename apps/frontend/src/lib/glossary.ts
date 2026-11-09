import { BIBLIOTECA_ARCHIVE_PATHS } from "../config/biblioteca-archives";

/**
 * The Glossário has no pages of its own: its terms are read on the Glossário
 * page, as an accordion of every term (title and definition). A term's old
 * address, and a search result for it, lead to the term on that page.
 */
export const GLOSSARY_COLLECTION = "glossario";

const TERM_URI = /^\/glossario\/([^/?#]+)\/?$/;

/** A term's slug from its address (`/glossario/ecodesign/`), or null for anything else. */
export function glossarySlug(uri: string): string | null {
  return uri.match(TERM_URI)?.[1] ?? null;
}

/** The term's place on the Glossário page, which opens it; null when `uri` isn't a term's. */
export function glossaryTermHref(uri: string): string | null {
  const slug = glossarySlug(uri);
  return slug ? `${BIBLIOTECA_ARCHIVE_PATHS.glossario}#${slug}` : null;
}

/** The term's element id on the Glossário page: its slug, as the address's fragment reads it. */
export function glossaryTermId(uri: string): string | null {
  const slug = glossarySlug(uri);
  if (!slug) return null;
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export interface GlossaryTerm {
  id: string;
  title: string;
  /** The definition's HTML, as the publication store delivers it. */
  content: string;
}

const collator = new Intl.Collator("pt", { sensitivity: "base", numeric: true });

/** Terms in alphabetical order, as Portuguese sorts them (accents don't move a term). */
export function sortGlossaryTerms(terms: readonly GlossaryTerm[]): GlossaryTerm[] {
  return [...terms].sort((a, b) => collator.compare(a.title.trim(), b.title.trim()));
}
