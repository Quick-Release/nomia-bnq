import { describe, expect, it } from "vite-plus/test";
import { galleryListing, readGallery } from "./gallery";
import { nomiaExtension } from "./nomia-content";
import type { CollectionItem } from "@getquick/content";
import type { NomiaExtension } from "./nomia-content";

const images = [2, 1, 3].map((id) => ({
  id,
  url: `https://media.example/${id}.jpg`,
  alt: `Photo ${id}`,
  width: 800,
  height: 600,
}));
const item: CollectionItem<NomiaExtension> = {
  uri: "/multimedia/galeria/album/evento/",
  title: "Evento",
  excerpt: "",
  date: "2026-10-01",
  modifiedAt: null,
  featuredImage: null,
  terms: {},
  extension: readGallery({ gqBioeconomiaGalleryImages: images }),
};

describe("Galerias publication data", () => {
  it("reads and restores the ordered images through the Site extension", () => {
    const extension = nomiaExtension.read({
      kind: "item",
      collection: "gq_bio_gallery",
      fields: { gqBioeconomiaGalleryImages: images },
    });
    expect(extension).toEqual(item.extension);
    expect(nomiaExtension.parse(JSON.parse(JSON.stringify(extension)))).toEqual(extension);
    expect(() =>
      readGallery({ gqBioeconomiaGalleryImages: [{ ...images[0], url: "javascript:alert(1)" }] }),
    ).toThrow();
  });
  it("paginates photographs across all albums, retaining their saved order", async () => {
    const calls: number[] = [];
    const result = await galleryListing(
      { collection: "gq_bio_gallery", terms: {}, page: 2, perPage: 2 },
      async (query) => {
        calls.push(query.page!);
        return {
          kind: "found",
          page: query.page!,
          pages: 2,
          total: 2,
          items: [
            {
              ...item,
              extension: readGallery({
                gqBioeconomiaGalleryImages: query.page === 1 ? images.slice(0, 2) : images.slice(2),
              }),
            },
          ],
        };
      },
    );
    expect(calls).toEqual([1, 2]);
    expect(result).toMatchObject({
      kind: "found",
      page: 2,
      pages: 2,
      items: [{ href: "https://media.example/3.jpg", title: "Evento" }],
    });
  });
  it("does not present a partial collection when reading a later album batch fails", async () => {
    const result = await galleryListing(
      { collection: "gq_bio_gallery", terms: {}, page: 1, perPage: 12 },
      async (query) =>
        query.page === 1
          ? { kind: "found", page: 1, pages: 2, total: 2, items: [item] }
          : { kind: "unavailable", failure: { reason: "not-ready", message: "offline" } },
    );
    expect(result.kind).toBe("unavailable");
  });
});
