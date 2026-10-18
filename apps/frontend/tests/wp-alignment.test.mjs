import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { WP_ALIGNMENTS, wpAlignmentClass } from "../src/lib/wp-alignment.ts";

// Nomia's block styles (nomia-theme.css, imported by the site's global.css).
const globalCss = readFileSync(new URL("../src/styles/nomia-theme.css", import.meta.url), "utf8");
const siteCss = readFileSync(new URL("../src/styles/global.css", import.meta.url), "utf8");

test("every alignment the align button offers maps to its WordPress class", () => {
  assert.deepEqual(WP_ALIGNMENTS, ["left", "center", "right", "wide", "full"]);
  assert.equal(wpAlignmentClass("center"), "aligncenter");
  assert.equal(wpAlignmentClass(" Full "), "alignfull");
});

test("an unset or unknown alignment adds no class at all", () => {
  assert.equal(wpAlignmentClass(undefined), null);
  assert.equal(wpAlignmentClass(""), null);
  assert.equal(wpAlignmentClass("sideways"), null);
  assert.equal(wpAlignmentClass(3), null);
});

test("the stylesheet gives every alignment class a layout", () => {
  // WordPress writes these classes into the saved markup the renderers pass
  // through, so without a rule here the align button does nothing on the page.
  for (const alignment of WP_ALIGNMENTS) {
    assert.match(
      globalCss,
      new RegExp(`\\.wp-block-image\\.align${alignment}\\b`),
      `align${alignment} has no rule in nomia-theme.css`,
    );
  }
});

test("alignment rules stay scoped to the image block", () => {
  // An unscoped `.alignleft` would let any editorial class of that name float
  // page furniture, so no alignment rule may stand on its own.
  const alignmentRules = globalCss.match(/^\s*\.align[a-z]+[,{ ]/gm) ?? [];
  assert.deepEqual(alignmentRules, []);
});

test("a full-bleed image cannot make the page scroll sideways", () => {
  assert.match(globalCss, /\.wp-block-image\.alignfull\s*\{[^}]*100vw/);
  assert.match(siteCss, /body\s*\{[^}]*overflow-x:\s*clip/);
});
