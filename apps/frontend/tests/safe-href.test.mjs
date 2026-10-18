import assert from "node:assert/strict";
import test from "node:test";
import { safeHref, withSafeLinks } from "../src/lib/safe-href.ts";

test("safeHref keeps links a browser follows as navigation", () => {
  for (const href of [
    "https://example.test/a?b=1#c",
    "HTTP://example.test/",
    "//example.test/",
    "/contactos/",
    "contactos/",
    "?pagina=2",
    "#morada",
    "mailto:geral@apambiente.pt",
    "tel:+351214728200",
  ]) {
    assert.equal(safeHref(href), href);
  }
  assert.equal(safeHref("  /contactos/  "), "/contactos/");
});

test("safeHref rejects script-capable and unknown schemes", () => {
  for (const href of [
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    " javascript:alert(1)",
    "java\tscript:alert(1)",
    "java\nscript:alert(1)",
    "\u0000javascript:alert(1)",
    "vbscript:msgbox(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
  ]) {
    assert.equal(safeHref(href), "", JSON.stringify(href));
  }
});

test("safeHref returns an empty string for empty and non-string values", () => {
  for (const value of [undefined, null, 42, "", "   "]) {
    assert.equal(safeHref(value), "");
  }
});

test("withSafeLinks filters link keys at any depth and leaves everything else alone", () => {
  const block = {
    blockName: "getquick/example",
    attrs: {
      ctaHref: "javascript:alert(1)",
      ctaUrl: "/legado/",
      imageSrc: "javascript:not-a-link-key",
      items: [{ href: "data:text/html,x", title: "href" }, { href: "https://example.test/" }],
      cta: { url: "vbscript:x", label: "Saber mais" },
      count: 3,
    },
    innerBlocks: [],
  };

  const safe = withSafeLinks(block, ["ctaHref", "ctaUrl", "href", "url"]);

  assert.deepEqual(safe.attrs, {
    ctaHref: "",
    ctaUrl: "/legado/",
    imageSrc: "javascript:not-a-link-key",
    items: [{ href: "", title: "href" }, { href: "https://example.test/" }],
    cta: { url: "", label: "Saber mais" },
    count: 3,
  });
  assert.equal(safe.innerBlocks, block.innerBlocks);
  assert.equal(block.attrs.ctaHref, "javascript:alert(1)", "the parsed block is not mutated");
  assert.equal(withSafeLinks(block, undefined), block);
  assert.equal(withSafeLinks(block, []), block);
});
