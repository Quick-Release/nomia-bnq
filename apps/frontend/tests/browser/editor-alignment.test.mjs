import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { chromium } from "playwright";

const plugin = new URL("../../../cms/web/app/plugins/gq-bioeconomia/", import.meta.url);
const css = [
  "assets/editor.css",
  "blocks/page-hero-media-grid/editor.css",
  "blocks/page-hero-slider/editor.css",
]
  .map((path) => readFileSync(new URL(path, plugin), "utf8"))
  .join("\n");

// Exact layout selectors emitted by installed WordPress 7.1.3 with the active
// theme's 720px/1200px sizes, captured from page 687's editor iframe. This tests
// the Site CSS cascade independently of Design's separately tested theme reset.
const nativeLayout = `
body { margin: 0; }
.block-editor-block-list__layout.is-root-container > :where(:not(.alignleft):not(.alignright):not(.alignfull)) {
  max-width: 720px; margin-left: auto !important; margin-right: auto !important;
}
.block-editor-block-list__layout.is-root-container > .alignwide { max-width: 1200px; }
.block-editor-block-list__layout.is-root-container > .alignfull { max-width: none; }
`;

test("Site editor CSS preserves native normal, wide and full geometry and internal padding", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const width of [1440, 1160, 800, 520]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const align of ["", "alignwide", "alignfull"]) {
        await page.setContent(`<style>${nativeLayout}\n${css}</style>
          <main class="editor-styles-wrapper"><div class="block-editor-block-list__layout is-root-container">
            <div id="native" class="wp-block ${align}">Native reference</div>
            <div id="grid" data-type="getquick/page-hero-media-grid" class="wp-block block-editor-block-list__block page-hero-media-grid-editor ${align}"><div class="page-hero-media-grid-editor__content">Grid content</div></div>
            <div id="slider" data-type="getquick/page-hero-slider" class="wp-block block-editor-block-list__block page-hero-slider-editor ${align}"><div class="page-hero-slider-editor__content">Slider content</div></div>
            <div id="full" class="wp-block gq-bioeconomia-full-width ${align}">Shared envelope</div>
          </div></main>`);
        const boxes = await page.evaluate(() => {
          const box = (id) => {
            const e = document.getElementById(id),
              r = e.getBoundingClientRect();
            return { x: r.x, width: r.width };
          };
          return {
            native: box("native"),
            grid: box("grid"),
            slider: box("slider"),
            full: box("full"),
            padding: getComputedStyle(
              document.querySelector(".page-hero-media-grid-editor__content"),
            ).paddingLeft,
          };
        });
        for (const name of ["grid", "slider", "full"]) {
          assert.deepEqual(
            boxes[name],
            boxes.native,
            `${name}, ${align || "normal"}, canvas ${width}`,
          );
        }
        assert.equal(boxes.padding, width <= 960 ? "24px" : "64px");
      }
    }
  } finally {
    await browser.close();
  }
});
