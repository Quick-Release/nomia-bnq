export type WpContentCard = {
  title: string;
  date: string | null;
  href: string;
  excerptPlain: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  kind?: "noticia" | "evento";
};
