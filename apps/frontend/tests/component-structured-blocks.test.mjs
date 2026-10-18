import assert from "node:assert/strict";
import test from "node:test";
import {
  externalLinkAttrs,
  isExternalHref,
  pageHeroCopyStackClass,
  resolvePageHeroHeight,
} from "../src/components/page-heroes/pageHeroShared.ts";
import {
  normalizeBorderRadius,
  normalizeCssColor,
  normalizeTextVerticalAlign,
} from "../src/components/page-heroes/pageHeroMediaGridShared.ts";
import { normalizeDonutSlices } from "../src/components/wp-blocks/donut-slice.ts";
import {
  normalizePageHeroColor,
  normalizePageHeroFontSize,
  readPageHeroTextAlign,
  pageHeroTextStyle,
  pageHeroTextStyleProperties,
  readPageHeroTextTypographies,
} from "../src/lib/page-hero-typography.ts";
import { wpNumber } from "../src/components/wp-blocks/normalizers.ts";
import {
  normalizeLibraryGridCard,
  readLibraryGridCards,
} from "../src/structured-blocks/registrations/library-grid.ts";
import {
  hasTitleWithLabelLegacyTypography,
  migrateTitleWithLabelLegacyTypography,
  normalizeTitleWithLabelHeadingLevel,
  readTitleWithLabelTypographies,
  titleWithLabelFieldStyle,
  titleWithLabelFieldStyleProperties,
  withTitleWithLabelTypography,
} from "../src/lib/title-with-label-typography.ts";

test("structured donut blocks normalize canonical slices and discard malformed rows", () => {
  const block = {
    attrs: {
      slices: [
        { type: "portal", label: " Portal ", value: "0", fill: "var(--unsafe-user-style)" },
        { label: "Without type", value: 12 },
        { type: "Invalid", value: "not-a-number" },
        { label: "Negative", value: -1 },
        { label: "Missing", value: null },
        null,
      ],
    },
  };

  assert.deepEqual(normalizeDonutSlices(block), [
    { type: "portal", label: "Portal", value: 0, fill: "var(--main-cinza-200)" },
    { type: "Without type", label: "Without type", value: 12, fill: "var(--main-cinza-300)" },
  ]);
});

test("library grid row knowledge validates canonical and legacy card shapes", () => {
  assert.deepEqual(
    normalizeLibraryGridCard({
      title: "  Publicações ",
      tag: " ECONOMIA ",
      imageUrl: "https://example.test/library.jpg",
      href: "/biblioteca/publicacoes/",
      tagKind: "bioeconomia",
      nodeId: "card-1",
    }),
    {
      title: "Publicações",
      tag: "ECONOMIA",
      imageSrc: "https://example.test/library.jpg",
      href: "/biblioteca/publicacoes/",
      tagKind: "bioeconomia",
    },
  );
  assert.equal(normalizeLibraryGridCard({ title: "Incomplete" }), null);
  assert.deepEqual(
    readLibraryGridCards({
      cards: "not-an-array",
      items: [
        {
          title: "Legislação",
          tag: "BIOECONOMIA",
          imageSrc: "/legislacao.jpg",
          href: "/biblioteca/legislacao/",
        },
      ],
    }),
    [
      {
        title: "Legislação",
        tag: "BIOECONOMIA",
        imageSrc: "/legislacao.jpg",
        href: "/biblioteca/legislacao/",
        tagKind: "economia",
      },
    ],
  );
});

test("structured donut blocks read legacy items when canonical slices are unavailable", () => {
  assert.deepEqual(
    normalizeDonutSlices({
      attrs: {
        slices: "malformed",
        items: [{ type: "legacy", value: 7, label: " Legacy " }],
      },
    }),
    [{ type: "legacy", label: "Legacy", value: 7, fill: "var(--main-cinza-200)" }],
  );
  assert.deepEqual(normalizeDonutSlices({ attrs: {} }), []);
  assert.deepEqual(normalizeDonutSlices({}), []);
});

test("WordPress numeric normalization does not turn missing values into zero", () => {
  assert.equal(wpNumber("12.5"), 12.5);
  assert.ok(Number.isNaN(wpNumber(null)));
  assert.ok(Number.isNaN(wpNumber("  ")));
});

test("page hero height keeps an Astro-only safe fallback", () => {
  // The full/half vocabulary predates the S–XL scale; see tests/page-hero-height.test.mjs.
  assert.equal(resolvePageHeroHeight("half"), "s");
  assert.equal(resolvePageHeroHeight("full"), "xl");
  assert.equal(resolvePageHeroHeight("unknown"), "xl");
});

test("page hero text typography is shared by editor and frontend styles", () => {
  assert.deepEqual(
    readPageHeroTextTypographies({
      titleTextFontSize: "64.4",
      titleTextColor: "#00A9CE",
      subtitleTextFontSize: 28,
      subtitleTextColor: "#e5faf9",
    }),
    {
      title: { fontSize: 64, color: "#00a9ce" },
      subtitle: { fontSize: 28, color: "#e5faf9" },
    },
  );
  assert.equal(
    pageHeroTextStyle({ fontSize: 64, color: "#00a9ce" }),
    "font-size: 64px; color: #00a9ce",
  );
  assert.deepEqual(pageHeroTextStyleProperties({ fontSize: 28, color: "#e5faf9" }), {
    fontSize: "28px",
    color: "#e5faf9",
  });

  assert.equal(normalizePageHeroFontSize(7), undefined);
  assert.equal(normalizePageHeroFontSize(161), undefined);
  assert.equal(normalizePageHeroColor("#fff"), undefined);
  assert.equal(normalizePageHeroColor("red; background: url(https://evil.test)"), undefined);
  assert.equal(pageHeroTextStyle({ fontSize: "not-a-size", color: "not-a-color" }), undefined);
});

test("page hero text alignment only ever resolves to a known side", () => {
  assert.equal(readPageHeroTextAlign({ textAlign: "center" }), "center");
  assert.equal(readPageHeroTextAlign({ textAlign: " RIGHT " }), "right");
  // Heroes saved before the control existed, and anything unexpected, stay left.
  assert.equal(readPageHeroTextAlign({}), "left");
  assert.equal(readPageHeroTextAlign({ textAlign: "justify" }), "left");
  assert.equal(readPageHeroTextAlign(null), "left");

  // The copy keeps its measure whichever side it sits on.
  for (const align of ["left", "center", "right"]) {
    assert.match(pageHeroCopyStackClass(align), /max-w-\[728px\]/);
  }
  assert.match(pageHeroCopyStackClass("center"), /text-center/);
  assert.match(pageHeroCopyStackClass("right"), /text-right/);
});

test("page hero media grid style values are constrained before entering inline CSS", () => {
  assert.equal(normalizeCssColor("var(--main-teal-400)", "#fff"), "var(--main-teal-400)");
  assert.equal(normalizeCssColor("#00a9ce", "#fff"), "#00a9ce");
  assert.equal(normalizeCssColor("red; background:url(https://evil.test)", "#fff"), "#fff");
  assert.equal(normalizeBorderRadius("24", "40px"), "24px");
  assert.equal(normalizeBorderRadius("16rem", "40px"), "16rem");
  assert.equal(normalizeBorderRadius("calc(100% - 1px)", "40px"), "40px");
  assert.equal(normalizeTextVerticalAlign("top"), "top");
  assert.equal(normalizeTextVerticalAlign("invalid"), "bottom");
});

test("page hero link helpers distinguish external URLs from local links", () => {
  assert.equal(isExternalHref("https://example.com/resource"), true);
  assert.equal(isExternalHref("http://example.com/resource"), true);
  assert.equal(isExternalHref("HTTPS://example.com/resource"), true);
  assert.equal(isExternalHref("/pt/contactos"), false);
  assert.equal(isExternalHref("mailto:team@example.com"), false);

  assert.deepEqual(externalLinkAttrs("https://example.com/resource"), {
    target: "_blank",
    rel: "noopener noreferrer",
  });
  assert.deepEqual(externalLinkAttrs("/pt/contactos"), {});
});

test("title with label reads token typography and drops values outside the contract", () => {
  assert.deepEqual(
    readTitleWithLabelTypographies({
      typography: {
        label: { size: "h4", lineHeight: "i", bold: true },
        titleLine1: { size: "40px", lineHeight: "f", italic: "yes" },
        titleLine2: { bold: false, italic: true, color: "red" },
        unknownField: { size: "h1" },
      },
    }),
    {
      label: { size: "h4", lineHeight: "i", bold: true },
      titleLine1: { lineHeight: "f" },
      titleLine2: { italic: true },
    },
  );

  // No attributes at all means every field keeps inheriting the type tokens.
  const inherited = { label: {}, titleLine1: {}, titleLine2: {} };
  assert.deepEqual(readTitleWithLabelTypographies({}), inherited);
  assert.deepEqual(readTitleWithLabelTypographies(null), inherited);
});

test("title with label maps retired pixel attributes onto the nearest token", () => {
  const legacy = {
    labelFontSize: 18,
    labelLineHeight: "26",
    titleLine1FontSize: 40.4,
    titleLine1LineHeight: 52,
    titleLine1Bold: true,
    titleLine2FontSize: "not-a-number",
    titleLine2Italic: true,
    labelItalic: "yes",
  };

  assert.equal(hasTitleWithLabelLegacyTypography(legacy), true);
  assert.equal(hasTitleWithLabelLegacyTypography({ typography: {} }), false);
  // 18px sits half-way between body (16) and body-large (20): ties round up.
  assert.deepEqual(migrateTitleWithLabelLegacyTypography(legacy), {
    label: { size: "body-large", lineHeight: "i" },
    titleLine1: { size: "h3", lineHeight: "f", bold: true },
    titleLine2: { italic: true },
  });

  // Unmigrated content renders through the same mapping the editor applies.
  assert.deepEqual(readTitleWithLabelTypographies(legacy), {
    label: { size: "body-large", lineHeight: "i" },
    titleLine1: { size: "h3", lineHeight: "f", bold: true },
    titleLine2: { italic: true },
  });
  // A canonical `typography` attribute wins over leftover retired keys.
  assert.deepEqual(
    readTitleWithLabelTypographies({ ...legacy, typography: { label: { size: "h2" } } }),
    { label: { size: "h2" }, titleLine1: {}, titleLine2: {} },
  );
});

test("title with label writes one field's typography without storing empty maps", () => {
  const current = { label: { size: "h4" }, titleLine1: { bold: true } };

  assert.deepEqual(withTitleWithLabelTypography(current, "titleLine2", { italic: true }), {
    label: { size: "h4" },
    titleLine1: { bold: true },
    titleLine2: { italic: true },
  });
  assert.deepEqual(withTitleWithLabelTypography(current, "label", {}), {
    titleLine1: { bold: true },
  });
  assert.equal(withTitleWithLabelTypography({ label: { size: "h4" } }, "label", {}), undefined);
  assert.equal(withTitleWithLabelTypography(undefined, "label", { size: "nope" }), undefined);
});

test("title with label typography reaches CSS only as design-token references", () => {
  assert.equal(titleWithLabelFieldStyle({ bold: true }), "font-weight: 700");
  assert.equal(titleWithLabelFieldStyle({ italic: true }), "font-style: italic");
  assert.equal(
    titleWithLabelFieldStyle({ size: "h3", lineHeight: "e", bold: true, italic: true }),
    "font-size: var(--typography-font-size-h3); line-height: var(--typography-line-height-e); font-weight: 700; font-style: italic",
  );
  assert.equal(titleWithLabelFieldStyle({}), undefined);
  assert.equal(titleWithLabelFieldStyle(undefined), undefined);
  assert.equal(
    titleWithLabelFieldStyle({ size: "h3); background: url(https://evil.test" }),
    undefined,
  );
  assert.equal(titleWithLabelFieldStyle({ bold: "italic; content: url(x)" }), undefined);

  // The canvas has no site stylesheet, so it gets the tokens' resolved pixels.
  assert.deepEqual(titleWithLabelFieldStyleProperties({ size: "h3", lineHeight: "e" }), {
    fontSize: "40px",
    lineHeight: "64px",
  });
  assert.deepEqual(titleWithLabelFieldStyleProperties({ bold: true, italic: true }), {
    fontWeight: 700,
    fontStyle: "italic",
  });
  assert.equal(titleWithLabelFieldStyleProperties({}), undefined);
});

test("title with label heading level stays within the section-title range", () => {
  assert.equal(normalizeTitleWithLabelHeadingLevel(undefined), 2);
  assert.equal(normalizeTitleWithLabelHeadingLevel(3), 3);
  assert.equal(normalizeTitleWithLabelHeadingLevel("4"), 4);
  assert.equal(normalizeTitleWithLabelHeadingLevel(1), 2);
  assert.equal(normalizeTitleWithLabelHeadingLevel(6), 2);
  assert.equal(normalizeTitleWithLabelHeadingLevel("h3"), 2);
});
