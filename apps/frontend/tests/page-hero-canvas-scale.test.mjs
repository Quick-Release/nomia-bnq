import assert from "node:assert/strict";
import test from "node:test";
import {
  PAGE_HERO_HEIGHT_STEPS,
  PAGE_HERO_PADDING_STEPS,
  pageHeroContentClass,
  pageHeroViewportClass,
} from "../src/components/page-heroes/pageHeroShared.ts";
import {
  pageHeroCanvasPadding,
  pageHeroCanvasStyle,
  pageHeroHeightLabels,
} from "./nomia-blocks-lib.mjs";

/**
 * The Gutenberg canvas approximates the published hero with plain CSS, because
 * the WordPress plugin bundles separately and cannot import Tailwind's output.
 * That restatement is the drift risk, so these tests derive what the canvas
 * *should* say from the frontend classes themselves rather than from a second
 * hand-written list.
 */

/** Tailwind's default spacing scale: one unit is 4px. */
function spacing(units) {
  return `${Number(units) * 4}px`;
}

function paddingFromClasses(classes) {
  const read = (prefix) => {
    const match = classes.match(new RegExp(`(?:^| )${prefix}-(\\d+)(?: |$)`));
    return match ? spacing(match[1]) : undefined;
  };
  // The editor canvas is wide, so it mirrors the `md:` tier for vertical padding
  // and the widest (`2xl:`) header gutter for the sides.
  const top = read("md:pt") ?? read("md:py") ?? read("pt") ?? read("py");
  const bottom = read("md:pb") ?? read("md:py") ?? read("pb") ?? read("py");
  const sides = read("2xl:px") ?? read("md:px") ?? read("px");
  return top === bottom ? `${top} ${sides}` : `${top} ${sides} ${bottom}`;
}

function heightFromClasses(classes) {
  const match = classes.match(/(?:^| )(?:min-)?h-\[(.+?)\](?: |$)/);
  return match[1];
}

/** Arbitrary Tailwind values cannot contain spaces; plain CSS may. */
function normalize(value) {
  return value.replace(/\s+/g, "");
}

test("every height step the contract offers has a canvas approximation", () => {
  for (const step of PAGE_HERO_HEIGHT_STEPS) {
    const style = pageHeroCanvasStyle(step);
    assert.ok(style, `step ${step} has no canvas approximation`);
    assert.ok(style.height, `step ${step} has no canvas height`);
    assert.ok(style.padding, `step ${step} has no canvas padding`);
  }
});

test("the canvas height of each step matches what the page renders", () => {
  for (const step of PAGE_HERO_HEIGHT_STEPS) {
    assert.equal(
      normalize(pageHeroCanvasStyle(step).height),
      normalize(heightFromClasses(pageHeroViewportClass(step))),
      `step ${step} previews a different height than it renders`,
    );
  }
});

test("the canvas padding of each step matches the page's wide-screen tier", () => {
  for (const step of PAGE_HERO_HEIGHT_STEPS) {
    assert.equal(
      normalize(pageHeroCanvasStyle(step).padding),
      normalize(paddingFromClasses(pageHeroContentClass(step))),
      `step ${step} previews different padding than it renders`,
    );
  }
});

test("the sidebar help text names every step the contract offers", () => {
  // The prose used to be hand-written and silently omitted XS when it landed.
  const { tallest, shorter } = pageHeroHeightLabels(PAGE_HERO_HEIGHT_STEPS);
  const named = [tallest, ...shorter].join(" ");

  for (const step of PAGE_HERO_HEIGHT_STEPS) {
    assert.match(named, new RegExp(`\\b${step.toUpperCase()}\\b`), `help text omits ${step}`);
  }
  assert.equal(tallest, "XL");
  // Parts, not a sentence: the conjunction that joins them is translatable and
  // lives in the editor.
  assert.deepEqual(shorter, ["XS", "S", "M", "L"]);
});

test("every padding step previews the padding the page renders, at every height", () => {
  for (const step of PAGE_HERO_HEIGHT_STEPS) {
    for (const top of PAGE_HERO_PADDING_STEPS) {
      for (const bottom of PAGE_HERO_PADDING_STEPS) {
        assert.equal(
          normalize(pageHeroCanvasPadding(step, { top, bottom })),
          normalize(paddingFromClasses(pageHeroContentClass(step, { top, bottom }))),
          `height ${step} with padding ${top}/${bottom} previews different padding than it renders`,
        );
      }
    }
  }
});

test("the default padding step keeps each height's own padding", () => {
  for (const step of PAGE_HERO_HEIGHT_STEPS) {
    assert.equal(
      pageHeroContentClass(step, { top: "default", bottom: "default" }),
      pageHeroContentClass(step),
    );
    assert.equal(pageHeroCanvasPadding(step, {}), pageHeroCanvasStyle(step).padding);
  }
});
