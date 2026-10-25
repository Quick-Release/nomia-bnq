import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";
import { buildPresentationCss } from "../presentation-build.mjs";

test("media grid editorial colors survive desktop/mobile, hover and keyboard focus", async (t) => {
  const css = await buildPresentationCss();
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const colors = {
    firstTitleColor: "#123456",
    firstTextColor: "#654321",
    secondTitleColor: "#abcdef",
    secondTextColor: "#fedcba",
  };
  for (const changed of [null, ...Object.keys(colors)]) {
    const selected = { ...colors, ...(changed ? { [changed]: "#135790" } : {}) };
    const [block] = parse(
      `<!-- wp:getquick/page-hero-media-grid ${JSON.stringify({
        firstTitle: "Column A",
        firstText: "Text A",
        firstHref: "/bioeconomia/",
        secondTitle: "Column B",
        secondText: "Text B",
        secondHref: "/economia-circular/",
        ...selected,
      })} /-->`,
    );
    const { html } = await harness.renderComponent("/src/components/NomiaBlocks.astro", {
      nomia: {
        blocks: [block],
        thematicColors: [
          { slug: "bioeconomia-sustentavel", color: "#ffffff" },
          { slug: "economia-circular", color: "#000000" },
        ],
      },
      design: { colors: [], spacingSizes: [] },
      language: { lang: "pt" },
    });
    await page.setContent(`<style>${css}</style>${html}`);
    const expected = Object.values(selected).map(
      (hex) =>
        `rgb(${[1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).join(", ")})`,
    );
    const checkColors = async (label) =>
      assert.deepEqual(
        await page
          .locator(".action-title, .action-text")
          .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).color)),
        expected,
        label,
      );
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.mouse.move(0, 0);
      await checkColors(`${width}: ${changed ?? "all saved colors"}`);
      for (const panel of await page.locator("a.action").all()) {
        await panel.hover();
        await checkColors(`${width}: hovered`);
      }
      await page.mouse.move(0, 0);
      await page.evaluate(() => document.activeElement?.blur());
      await page.keyboard.press("Tab");
      for (let index = 0; index < 2; index++) {
        await page.locator("a.action").nth(index).focus();
        assert.equal(
          await page
            .locator("a.action")
            .nth(index)
            .evaluate((node) => node.matches(":focus-visible")),
          true,
        );
        await checkColors(`${width}: keyboard focus`);
      }
    }
  }
});
