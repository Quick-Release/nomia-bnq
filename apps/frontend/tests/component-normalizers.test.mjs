import assert from "node:assert/strict";
import test from "node:test";
import {
  enumText,
  firstArray,
  mapValid,
  optionalText,
  plainText,
  plainTextLines,
  textOr,
  wpArray,
  wpBoolean,
  wpNumber,
  wpObject,
  wpText,
} from "../src/components/wp-blocks/normalizers.ts";

test("structured block text values are trimmed and non-text values are empty", () => {
  assert.equal(wpText("  Heading  "), "Heading");
  assert.equal(wpText("   "), "");
  assert.equal(wpText(42), "");
});

test("structured block number values accept numbers and numeric strings", () => {
  assert.equal(wpNumber(12.5), 12.5);
  assert.equal(wpNumber(" 12.5 "), 12.5);
});

test("invalid structured block numbers remain distinguishable as NaN", () => {
  assert.ok(Number.isNaN(wpNumber("not-a-number")));
});

test("structured block booleans accept true and the serialized true value", () => {
  assert.equal(wpBoolean(true), true);
  assert.equal(wpBoolean("true"), true);
  assert.equal(wpBoolean(false), false);
  assert.equal(wpBoolean("false"), false);
});

test("structured block arrays reject non-array values", () => {
  assert.deepEqual(wpArray(["card"]), ["card"]);
  assert.deepEqual(wpArray({ cards: [] }), []);
  assert.deepEqual(wpArray(undefined), []);
});

test("structured block objects reject null and arrays", () => {
  assert.deepEqual(wpObject({ heading: "Heading" }), { heading: "Heading" });
  assert.equal(wpObject(null), null);
  assert.equal(wpObject(["not-an-object"]), null);
});

test("textOr prefers a canonical attribute and falls back to a legacy mirror", () => {
  assert.equal(textOr("Canonical heading", "Legacy heading"), "Canonical heading");
  assert.equal(textOr("  ", "  Legacy heading  "), "Legacy heading");
  assert.equal(textOr(undefined, null), "");
});

test("optionalText returns undefined when canonical and legacy text are empty", () => {
  assert.equal(optionalText("  Canonical link  ", "Legacy link"), "Canonical link");
  assert.equal(optionalText("", "  Legacy link  "), "Legacy link");
  assert.equal(optionalText("", undefined), undefined);
});

test("firstArray prefers the first available canonical or legacy array", () => {
  assert.deepEqual(firstArray(["canonical"], ["legacy"]), ["canonical"]);
  assert.deepEqual(firstArray(undefined, ["legacy"]), ["legacy"]);
  assert.deepEqual(firstArray(undefined, null), []);
});

test("mapValid filters invalid rows while passing each row index to the validator", () => {
  const normalized = mapValid(["first", "skip", "last"], (value, index) =>
    value === "skip" ? null : `${index}:${value}`,
  );

  assert.deepEqual(normalized, ["0:first", "2:last"]);
});

test("enumText returns a trimmed allowed value", () => {
  assert.equal(enumText("  half ", ["full", "half"], "full"), "half");
});

test("enumText falls back for missing and unsupported values", () => {
  const allowed = ["full", "half"];

  assert.equal(enumText("quarter", allowed, "full"), "full");
  assert.equal(enumText(undefined, allowed, "half"), "half");
});

test("plain text fields drop markup a RichText attribute may still carry", () => {
  // Saved before the hero's RichText fields were restricted to no formats.
  assert.equal(plainText("Bioeconomia <strong>sustentável</strong>"), "Bioeconomia sustentável");
  assert.equal(plainText("Uma linha<br>outra linha"), "Uma linha outra linha");
  assert.equal(
    plainText("Investiga&ccedil;&atilde;o &amp; Inova&ccedil;&atilde;o"),
    "Investiga&ccedil;&atilde;o & Inova&ccedil;&atilde;o",
  );
  assert.equal(plainText("5 &lt; 10 &amp; 10 &gt; 5"), "5 < 10 & 10 > 5");
});

test("plain text leaves ordinary copy untouched", () => {
  assert.equal(plainText("  Bioeconomia sustentável  "), "Bioeconomia sustentável");
  assert.equal(plainText(""), "");
  assert.equal(plainText(undefined), "");
  assert.equal(plainText(42), "");
});

test("plain text lines split on line breaks and drop empty lines", () => {
  assert.deepEqual(
    plainTextLines("Um <strong>dois</strong><br>três &amp; quatro<br />\n<br>cinco"),
    ["Um dois", "três & quatro", "cinco"],
  );
  assert.deepEqual(plainTextLines("Só uma linha"), ["Só uma linha"]);
  assert.deepEqual(plainTextLines("  <br> "), []);
  assert.deepEqual(plainTextLines(undefined), []);
});
