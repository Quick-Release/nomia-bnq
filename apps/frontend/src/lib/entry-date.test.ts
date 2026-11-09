import { describe, expect, it } from "vite-plus/test";
import { showsPublicationDate } from "./entry-date";

describe("showsPublicationDate", () => {
  it("hides a Biblioteca document's date", () => {
    expect(showsPublicationDate({ name: "biblioteca", terms: {} })).toBe(false);
  });

  it("shows other collections' and plain posts' dates", () => {
    expect(showsPublicationDate({ name: "eventos", terms: {} })).toBe(true);
    expect(showsPublicationDate(undefined)).toBe(true);
  });
});
