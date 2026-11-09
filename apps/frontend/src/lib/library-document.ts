import { z } from "astro/zod";
import { safeHref } from "./safe-href";

/** Biblioteca's site-owned fields, stored with each published document. */
export const LIBRARY_FIELDS =
  "gqBioeconomiaLibraryYear gqBioeconomiaLibraryPublisher gqBioeconomiaLibraryFileUrl gqBioeconomiaLibraryPageUrl";

export const storedLibraryDocument = z.object({
  kind: z.literal("library-document"),
  year: z.number().int().nullable(),
  publisher: z.string(),
  fileUrl: z.string(),
  pageUrl: z.string(),
});

export type LibraryDocument = z.infer<typeof storedLibraryDocument>;

export function readLibraryDocument(fields: Readonly<Record<string, unknown>>): LibraryDocument {
  const year = fields.gqBioeconomiaLibraryYear;
  return {
    kind: "library-document",
    year:
      typeof year === "number" && Number.isInteger(year) && year >= 1000 && year <= 9999
        ? year
        : null,
    publisher:
      typeof fields.gqBioeconomiaLibraryPublisher === "string"
        ? fields.gqBioeconomiaLibraryPublisher.trim()
        : "",
    fileUrl: safeHref(fields.gqBioeconomiaLibraryFileUrl),
    pageUrl: safeHref(fields.gqBioeconomiaLibraryPageUrl),
  };
}
