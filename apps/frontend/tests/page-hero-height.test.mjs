import assert from "node:assert/strict";
import test from "node:test";
import {
  PAGE_HERO_HEIGHT_DEFAULT,
  PAGE_HERO_HEIGHT_STEPS,
  pageHeroContentClass,
  pageHeroViewportClass,
  resolvePageHeroHeight,
} from "../src/components/page-heroes/pageHeroShared.ts";

test("hero height resolves every named step and falls back to XL", () => {
  for (const step of PAGE_HERO_HEIGHT_STEPS) {
    assert.equal(resolvePageHeroHeight(step), step);
  }
  assert.equal(resolvePageHeroHeight("  L  "), "l");
  assert.equal(resolvePageHeroHeight(""), PAGE_HERO_HEIGHT_DEFAULT);
  assert.equal(resolvePageHeroHeight("xxl"), PAGE_HERO_HEIGHT_DEFAULT);
  assert.equal(resolvePageHeroHeight(undefined), PAGE_HERO_HEIGHT_DEFAULT);
  assert.equal(resolvePageHeroHeight(3), PAGE_HERO_HEIGHT_DEFAULT);
});

test("the pre-scale full/half vocabulary keeps its measurements", () => {
  // Heroes and pages written before the scale must not shift visually.
  assert.equal(resolvePageHeroHeight("full"), "xl");
  assert.equal(resolvePageHeroHeight("half"), "s");
  assert.match(pageHeroViewportClass("xl"), /h-\[100svh\]/);
  assert.match(pageHeroViewportClass("s"), /min-h-\[max\(50svh,360px\)\]/);
  assert.match(pageHeroContentClass("s"), /min-h-\[max\(50svh,360px\)\]/);
});

test("the scale runs strictly shorter from XL down to XS", () => {
  // Guards against a new step being slotted in at the wrong rung.
  const floors = PAGE_HERO_HEIGHT_STEPS.map((step) => {
    const classes = pageHeroViewportClass(step);
    const svh = classes.match(/(\d+)svh/);
    return Number(svh[1]);
  });

  assert.deepEqual(
    floors,
    [...floors].sort((a, b) => a - b),
  );
  assert.equal(floors[0], 35);
  assert.equal(floors.at(-1), 100);
});

test("every step ships a distinct literal class string Tailwind can see", () => {
  const viewports = PAGE_HERO_HEIGHT_STEPS.map(pageHeroViewportClass);
  const contents = PAGE_HERO_HEIGHT_STEPS.map(pageHeroContentClass);

  assert.equal(new Set(viewports).size, PAGE_HERO_HEIGHT_STEPS.length);
  assert.equal(new Set(contents).size, PAGE_HERO_HEIGHT_STEPS.length);
  for (const classes of [...viewports, ...contents]) {
    assert.ok(classes.includes("w-full"));
  }
});
