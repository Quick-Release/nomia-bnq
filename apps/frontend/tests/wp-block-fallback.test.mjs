import assert from "node:assert/strict";
import test from "node:test";
import { resolveWpUnsupportedFallback } from "../src/lib/wp-block-fallback.ts";

test("frontend unsupported-block fallback preserves available content", () => {
  assert.equal(resolveWpUnsupportedFallback("saved-content", true), "saved-content");
});

test("unsupported blocks without saved content always become diagnostics", () => {
  assert.equal(resolveWpUnsupportedFallback("saved-content", false), "diagnostic");
});

test("preview adapters can force diagnostics when saved content exists", () => {
  assert.equal(resolveWpUnsupportedFallback("diagnostic", true), "diagnostic");
});
