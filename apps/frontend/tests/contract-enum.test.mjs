import assert from "node:assert/strict";
import test from "node:test";
import { enumFromContracts } from "../../cms/web/app/plugins/nomia-blocks/src/lib/contract-enum.mjs";
import { resolvePageHeroHeight } from "../src/components/page-heroes/pageHeroShared.ts";

const CONTRACTS = [
  {
    blockName: "getquick/page-hero-static",
    attributes: {
      height: { type: "string", default: "xl", enum: ["xs", "s", "m", "l", "xl"] },
      title: { type: "string", default: "" },
    },
  },
];

function heightEnum() {
  return enumFromContracts(CONTRACTS, "getquick/page-hero-static", "height");
}

test("an enum attribute exposes its values and contract default", () => {
  const height = heightEnum();

  assert.deepEqual(height.values, ["xs", "s", "m", "l", "xl"]);
  assert.equal(height.fallback, "xl");
});

test("the editor reads a stored step exactly as the page renders it", () => {
  // Both sides clamp the same stored value, or the sidebar highlights one step
  // while the published page renders another.
  const height = heightEnum();

  for (const stored of ["xs", "  L  ", "XS", "m", "bogus", "", undefined, 7]) {
    assert.equal(
      height.read(stored),
      resolvePageHeroHeight(stored),
      `editor and renderer disagree on ${JSON.stringify(stored)}`,
    );
  }
});

test("an attribute with no enum yields no values and clamps to undefined", () => {
  const title = enumFromContracts(CONTRACTS, "getquick/page-hero-static", "title");

  assert.deepEqual(title.values, []);
  assert.equal(title.read("anything"), undefined);
});
