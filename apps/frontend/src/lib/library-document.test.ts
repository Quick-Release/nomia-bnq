import { describe, expect, it } from "vite-plus/test";
import { isLibraryDocument } from "./library-document";

describe("isLibraryDocument", () => {
  it("recognises a Biblioteca document", () => {
    expect(isLibraryDocument({ name: "biblioteca", terms: {} })).toBe(true);
  });

  it("leaves other collections and plain posts alone", () => {
    expect(isLibraryDocument({ name: "eventos", terms: {} })).toBe(false);
    expect(isLibraryDocument(undefined)).toBe(false);
  });
});
