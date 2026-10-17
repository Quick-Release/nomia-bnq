/** An event card, as the events blocks store it in their attributes. */
export type WpEventoHomeCard = {
  title: string;
  slug: string;
  href?: string;

  date: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  startDate: string | null;
  endDate: string | null;
};
