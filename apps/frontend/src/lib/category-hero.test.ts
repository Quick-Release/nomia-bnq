import { describe, expect, it } from "vite-plus/test";
import { categoryHeroBlock, categoryHeroPage } from "./category-hero";
import type { WpParsedBlock } from "./wp-blocks";

const block = (blockName: string | null, attrs: Record<string, unknown> = {}): WpParsedBlock => ({
  blockName,
  attrs,
  innerBlocks: [],
  innerHTML: "",
  innerContent: [],
});

describe("categoryHeroPage", () => {
  it("serves a Formação opportunity under the Formação page's hero", () => {
    expect(
      categoryHeroPage({
        name: "oportunidades",
        terms: { categoria_oportunidade: [{ slug: "formacao", name: "Formação" }] },
      }),
    ).toBe("/oportunidades/formacao/");
  });

  it("leaves other categories, other collections and pages alone", () => {
    expect(
      categoryHeroPage({
        name: "oportunidades",
        terms: { categoria_oportunidade: [{ slug: "avisos", name: "Avisos" }] },
      }),
    ).toBeNull();
    expect(categoryHeroPage({ name: "oportunidades", terms: {} })).toBeNull();
    expect(
      categoryHeroPage({
        name: "eventos",
        terms: { categoria_oportunidade: [{ slug: "formacao", name: "Formação" }] },
      }),
    ).toBeNull();
    expect(categoryHeroPage(undefined)).toBeNull();
  });
});

describe("categoryHeroBlock", () => {
  const hero = block("getquick/page-hero-static", {
    title: "Formação",
    subtitle: "Cursos",
    imageSrc: "https://media.example/hero.jpg",
    height: "35svh",
    showCta: true,
    ctaLabel: "Ver",
    ctaHref: "/x/",
  });

  it("keeps the page hero's image and layout, with the item's title only", () => {
    const result = categoryHeroBlock(
      [block("core/paragraph"), hero, block("getquick/content-listing")],
      "Agendas Regionais",
    );
    expect(result?.attrs).toMatchObject({
      title: "Agendas Regionais",
      imageSrc: "https://media.example/hero.jpg",
      height: "35svh",
      showSubtitle: false,
      showCta: false,
    });
    expect(hero.attrs?.title).toBe("Formação");
  });

  it("is null when the page has no static hero or the item no title", () => {
    expect(categoryHeroBlock([block("getquick/page-hero-slider")], "Agendas")).toBeNull();
    expect(categoryHeroBlock([hero], " ")).toBeNull();
  });
});
