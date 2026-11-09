import { describe, expect, it } from "vite-plus/test";
import { glossarySlug, glossaryTermHref, glossaryTermId, sortGlossaryTerms } from "./glossary";

describe("glossary terms", () => {
  it("leads a term's address to its place on the Glossário page", () => {
    expect(glossaryTermHref("/glossario/ecodesign/")).toBe("/biblioteca/glossario/#ecodesign");
    expect(glossaryTermHref("/glossario/ecodesign")).toBe("/biblioteca/glossario/#ecodesign");
    expect(glossaryTermId("/glossario/%C3%A1gua/")).toBe("água");
  });

  it("leaves other addresses alone", () => {
    expect(glossarySlug("/biblioteca/glossario/")).toBeNull();
    expect(glossaryTermHref("/glossario/")).toBeNull();
    expect(glossaryTermHref("/eventos/conferencia/")).toBeNull();
    expect(glossaryTermId("/glossario/a/b/")).toBeNull();
  });

  it("orders terms alphabetically, accents included", () => {
    const term = (title: string) => ({ id: title, title, content: "" });
    expect(
      sortGlossaryTerms(
        ["Reciclagem", "Água", "Ecodesign", "Economia Circular", "Biomassa"].map(term),
      ).map((t) => t.title),
    ).toEqual(["Água", "Biomassa", "Ecodesign", "Economia Circular", "Reciclagem"]);
  });
});
