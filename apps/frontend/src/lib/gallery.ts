import { z } from "astro/zod";
import type { CollectionItem } from "@getquick/content";
import type { NomiaExtension } from "./nomia-content";
import type { ListingQuery } from "./content-collections";
import { listCollection } from "./content-listing";

export const GALLERY_FIELDS = "gqBioeconomiaGalleryImages { id url alt width height }";
export const storedGallery = z.object({
  kind: z.literal("gallery"),
  images: z.array(
    z.object({
      id: z.number().int(),
      url: z.url().refine((url) => /^https?:\/\//i.test(url)),
      alt: z.string(),
      width: z.number().nullable(),
      height: z.number().nullable(),
    }),
  ),
});
export type Gallery = z.infer<typeof storedGallery>;

export function readGallery(fields: Readonly<Record<string, unknown>>): Gallery {
  return storedGallery.parse({ kind: "gallery", images: fields.gqBioeconomiaGalleryImages ?? [] });
}

export function galleryRows(item: CollectionItem<NomiaExtension>) {
  const gallery =
    item.extension && "kind" in item.extension && item.extension.kind === "gallery"
      ? item.extension
      : null;
  return (gallery?.images ?? []).map((image) => ({
    href: image.url,
    title: item.title.trim() || "Galeria",
    imageSrc: image.url,
    imageAlt: image.alt.trim() || `Fotografia de ${item.title.trim() || "galeria"}`,
  }));
}

/** Paginate photographs, keeping publication order and each album's image order. */
export async function galleryListing(query: ListingQuery, list = listCollection) {
  const rows: ReturnType<typeof galleryRows> = [];
  for (let page = 1, pages = 1; page <= pages; page++) {
    const result = await list({ ...query, page, perPage: 100 });
    if (result.kind !== "found") return result;
    rows.push(...result.items.flatMap(galleryRows));
    pages = result.pages;
  }
  const pages = Math.ceil(rows.length / query.perPage);
  const page = Math.min(query.page, Math.max(1, pages));
  return {
    kind: "found" as const,
    items: rows.slice((page - 1) * query.perPage, page * query.perPage),
    pages,
    page,
  };
}
