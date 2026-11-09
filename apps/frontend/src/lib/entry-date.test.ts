import { describe, expect, it } from "vite-plus/test";
import { showsEntryDate } from "./entry-date";

describe("showsEntryDate", () => {
  it("hides Biblioteca documents' and Plataformas' dates", () => {
    expect(showsEntryDate({ name: "biblioteca", terms: {} })).toBe(false);
    expect(showsEntryDate({ name: "plataformas", terms: {} })).toBe(false);
  });

  it("shows other collections' and plain posts' dates", () => {
    expect(showsEntryDate({ name: "eventos", terms: {} })).toBe(true);
    expect(showsEntryDate(undefined)).toBe(true);
  });
});
