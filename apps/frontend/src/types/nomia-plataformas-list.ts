/** Taxonomy or ACF-derived filter option for the plataformas grid. */
export type NomiaPlataformaFilterTerm = {
  slug: string;
  name: string;
};

/** Row model for {@link ../components/content-lists/plataformas/NomiaPlataformasGrid.tsx}. */
export type NomiaPlataformaListItem = {
  id: string;
  title: string;
  slug: string;
  href: string;
  date: string | null;
  /** Pre-formatted date label (e.g. `26 de Setembro 2017`). */
  dateLabel: string;
  description: string;
  subtitle: string | null;
  featured: boolean;
  imageUrl: string | null;
  imageAlt: string | null;
  setores: NomiaPlataformaFilterTerm[];
  tematicas: NomiaPlataformaFilterTerm[];
  /** Tailwind background token for the card accent (Figma solid + overlay). */
  accentClass: string;
};

export type NomiaPlataformasListData = {
  items: NomiaPlataformaListItem[];
  tematicas: NomiaPlataformaFilterTerm[];
  setores: NomiaPlataformaFilterTerm[];
};
