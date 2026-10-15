/**
 * Row model for {@link ../components/content-lists/podcasts/PodcastList.astro} — mirrors WordPress podcast fields once wired.
 */
export type NomiaPodcastListItem = {
  episodeNumber: number | null;
  /** Pre-formatted date label (e.g. `26 de Setembro 2017`) */
  dateLabel: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  listenHref: string;
  /** Absolute or site-relative URL used for share / clipboard */
  shareUrl: string;
};
