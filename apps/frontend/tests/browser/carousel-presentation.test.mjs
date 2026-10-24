import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { renderDesignPattern, renderWordPressBlocks } from "@getquick/content";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";
import { buildPresentationCss, buildPresentationClient } from "../presentation-build.mjs";

const fixture = (name) =>
  JSON.parse(
    readFileSync(new URL(`../fixtures/design-presentation/${name}`, import.meta.url), "utf8"),
  );

test("real saved Carousel keeps geometry and ordered content through Nomia adapters", async (t) => {
  const css = await buildPresentationCss();
  const script = await buildPresentationClient();
  assert.doesNotMatch(
    script,
    /schemaEnv|validateSchema|ajv-formats/,
    "browser mounts do not bootstrap server validation",
  );
  const saved = fixture("carousel-presentation-saved.json");
  const publicNode = fixture("carousel-presentation-public.json").blocks[0].node;
  const blocks = parse(saved.html);
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const local = (await harness.renderBlocks(blocks, { bare: true })).html;
  const wordpress = (block) => ({
    name: block.blockName,
    attributes: block.attrs,
    htmlContent: block.innerHTML,
    innerBlocks: block.innerBlocks.map(wordpress),
  });
  const scopes = {
    local,
    chrome: renderDesignPattern([publicNode]),
    html: renderWordPressBlocks(blocks.map(wordpress)),
  };
  const html = await harness.renderLayout(
    Object.entries(scopes)
      .map(([name, html]) => `<div data-carousel-scope="${name}">${html}</div>`)
      .join(""),
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.route("https://example.test/*.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"></svg>',
    }),
  );
  await page.setViewportSize({ width: 767, height: 900 });
  await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    globalThis.NomiaPresentation.startDesignPresentation();
  });
  for (const scope of Object.keys(scopes)) {
    const carousel = page.locator(`[data-carousel-scope="${scope}"] [data-gqd-carousel]`);
    await carousel.waitFor();
    assert.equal(await carousel.getAttribute("data-gqd-mounted"), "");
    assert.equal(await carousel.locator(":scope > .wp-block-getquick-design-slider").count(), 3);
    assert.deepEqual(
      await carousel.locator("img").evaluateAll((images) => images.map((image) => image.alt)),
      ["Slide 1", "Slide 2", "Slide 3"],
    );
    assert.equal(await carousel.getByRole("link").getAttribute("href"), "/first-slide");
    assert.equal(await carousel.getByRole("heading", { name: "First slide heading" }).count(), 1);
    assert.equal(
      await carousel.locator(".wp-block-getquick-design-carousel-navigation").count(),
      0,
      "saved visible:false is honored",
    );
  }
  for (const width of [767, 768, 769, 1279, 1280, 1281]) {
    await page.setViewportSize({ width, height: 900 });
    for (const scope of Object.keys(scopes)) {
      const carousel = page.locator(`[data-carousel-scope="${scope}"] [data-gqd-carousel]`);
      const state = await carousel.evaluate((node) => ({
        height: node.getBoundingClientRect().height,
        display: getComputedStyle(node).display,
      }));
      if (width >= 768 && width < 1280) {
        assert.equal(state.display, "none");
        assert.equal(state.height, 0);
      } else {
        assert.equal(state.display, "grid");
        assert.equal(
          state.height,
          width < 768 ? 150 : width / 2,
          "Auto clears earlier explicit height",
        );
      }
      if (width < 768)
        assert.equal(
          await carousel
            .locator('img[alt="Slide 1"]')
            .evaluate((node) => node.getBoundingClientRect().height),
          150,
          "linked image fills actual carousel box",
        );
    }
  }
  await page.evaluate(() => document.dispatchEvent(new Event("astro:before-swap")));
  assert.equal(
    await page.locator("[data-gqd-mounted]").count(),
    0,
    "Site navigation cleans up shared mounts",
  );
  await page.evaluate(() => document.dispatchEvent(new Event("astro:page-load")));
  assert.equal(await page.locator("[data-gqd-mounted]").count(), 3);
});

test("visible Carousel controls preserve colors, keyboard and autoplay pause rules", async (t) => {
  const css = await buildPresentationCss();
  const script = await buildPresentationClient();
  const source = fixture("carousel-presentation-public.json").blocks[0].node;
  // An explicit enabled-control variant reuses the actual captured slide
  // identities/content and adds an explicit foreground button for focus safety.
  // This is a consumer scenario, not another producer capture.
  const node = {
    ...source,
    children: source.children.map((child, index) =>
      child.name === "getquick-design/carousel-navigation"
        ? {
            ...child,
            attributes: {
              ...child.attributes,
              visible: true,
              slideDuration: 1,
              arrowColor: "rgb(12, 34, 56)",
            },
          }
        : index === 0
          ? {
              ...child,
              children: [
                ...child.children,
                {
                  name: "core/button",
                  attributes: { tagName: "button", type: "button", text: "Foreground action" },
                  content: null,
                  children: [],
                },
              ],
            }
          : child,
    ),
  };
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const html = await harness.renderLayout(
    `${renderDesignPattern([node])}<button id="outside-carousel">Outside controls</button>`,
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.clock.install();
  await page.route("https://example.test/*.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"></svg>',
    }),
  );
  await page.setViewportSize({ width: 767, height: 900 });
  await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
  await page.addScriptTag({ content: script });
  await page.evaluate(() => globalThis.NomiaPresentation.startDesignPresentation());
  const carousel = page.locator("[data-gqd-carousel]");
  const nav = carousel.locator(".wp-block-getquick-design-carousel-navigation");
  assert.equal(
    await nav.evaluate((node) => getComputedStyle(node).backgroundColor),
    "rgb(1, 2, 3)",
  );
  const next = nav.locator("[data-gqd-next]");
  assert.equal(await next.evaluate((node) => getComputedStyle(node).color), "rgb(12, 34, 56)");
  assert.equal(
    await nav
      .locator("[data-gqd-go] span")
      .first()
      .evaluate((node) => getComputedStyle(node).color),
    "rgb(4, 5, 6)",
  );
  const active = () =>
    carousel
      .locator(":scope > .wp-block-getquick-design-slider:not([hidden])")
      .getAttribute("aria-label");
  assert.equal(await active(), "1 of 3");
  await page.clock.fastForward(1100);
  assert.equal(await active(), "2 of 3", "autoplay advances at the supplied interval");
  await next.focus();
  await page.clock.fastForward(1100);
  assert.equal(await active(), "2 of 3", "focus pauses autoplay");
  await next.press("ArrowRight");
  assert.equal(await active(), "3 of 3");
  await next.press("Home");
  assert.equal(await active(), "1 of 3");
  await next.press("Enter");
  assert.equal(await active(), "2 of 3", "native keyboard activation works");
  await nav.locator('[data-gqd-go="0"]').click();
  assert.equal(await active(), "1 of 3");
  const outside = page.locator("#outside-carousel");
  await outside.focus();
  await carousel.hover();
  await page.clock.fastForward(1100);
  assert.equal(await active(), "1 of 3", "hover pauses autoplay");
  await outside.hover();
  await page.clock.fastForward(1100);
  assert.equal(await active(), "2 of 3", "leaving hover and focus resumes playback");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.fastForward(2200);
  assert.equal(await active(), "2 of 3", "reduced motion stops autoplay");
  await nav.locator('[data-gqd-go="0"]').click();
  const foreground = [
    carousel.getByRole("link"),
    carousel.getByRole("button", { name: "Foreground action", exact: true }),
  ];
  for (const control of foreground) {
    await control.focus();
    for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
      await control.press(key);
      assert.equal(
        await active(),
        "1 of 3",
        "foreground shortcut keys cannot hide the focused slide",
      );
      assert.equal(await control.evaluate((node) => node === document.activeElement), true);
      assert.equal(await control.isVisible(), true);
    }
  }
});
