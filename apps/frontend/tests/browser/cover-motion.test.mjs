import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { renderDesignPattern, renderWordPressBlocks } from "@getquick/content";
import { JSDOM } from "jsdom";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";
import { buildPresentationCss, buildPresentationClient } from "../presentation-build.mjs";

// Provided composition and first-party playback bytes, not a CMS video capture.
test("Cover decorative playback follows motion preferences and Site lifecycle", async (t) => {
  const css = await buildPresentationCss();
  const script = await buildPresentationClient();
  const attributes = {
    backgroundType: "video",
    url: "https://nomia.test/hero-test.webm",
    presentation: { base: { height: 48 } },
  };
  const shell = `<div class="wp-block-cover"><video class="wp-block-cover__video-background" autoplay muted loop playsinline poster="https://nomia.test/poster.svg"><source src="${attributes.url}" type="video/webm"></video><div class="wp-block-cover__inner-container"><a href="#details">Cover details</a><video id="foreground-video" controls autoplay muted loop src="${attributes.url}"></video></div></div>`;
  const saved = `<!-- wp:cover ${JSON.stringify(attributes)} -->${shell}<!-- /wp:cover -->`;
  const blocks = parse(saved);
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (_url, init) => {
    const operation = /query (\w+)/.exec(JSON.parse(init.body).query)?.[1];
    const data =
      operation === "EntryByUri"
        ? {
            postBy: null,
            pageBy: {
              id: "cover-motion",
              title: "Cover motion",
              content: shell,
              uri: "/cover-motion/",
              status: "publish",
              isRestricted: false,
              featuredImage: null,
              language: { slug: "pt" },
              translations: [],
              getquickBlocksJson: "[]",
            },
            designTokens: { colors: [], spacingSizes: [] },
          }
        : operation === "SiteChrome"
          ? {
              generalSettings: { siteIcon: null, siteLogo: null },
              menuItems: { nodes: [] },
              header: null,
              footer: null,
            }
          : operation === "ConsentSettings"
            ? { getquickLegal: null, googleAnalytics: null }
            : operation === "DesignPresets"
              ? { designTokens: { colors: [], spacingSizes: [] } }
              : null;
    assert.ok(data, `unexpected query ${operation}`);
    return Response.json({ data });
  };
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const entry = await harness.renderEntry("/cover-motion/");
  assert.equal(entry.status, 200);
  const scopes = {
    neutral: renderDesignPattern([{ name: "core/cover", attributes, content: null, children: [] }]),
    saved: renderDesignPattern([{ name: "core/cover", attributes, content: shell, children: [] }]),
    local: (await harness.renderBlocks(blocks, { bare: true })).html,
    parsed: renderWordPressBlocks([
      { name: "core/cover", attributes, htmlContent: shell, innerBlocks: [] },
    ]),
    body: new JSDOM(entry.html).window.document.querySelector(".prose-wp").innerHTML,
  };
  const html = await harness.renderLayout(
    Object.entries(scopes)
      .map(([name, body]) => `<section data-cover-path="${name}">${body}</section>`)
      .join(""),
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.setDefaultTimeout(5000);
  await page.route("https://nomia.test/**", (route) => route.abort());
  await page.route("https://nomia.test/hero-test.webm", (route) =>
    route.fulfill({
      contentType: "video/webm",
      body: readFileSync(new URL("../fixtures/media/hero-test.webm", import.meta.url)),
    }),
  );
  await page.route("https://nomia.test/poster.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"></svg>',
    }),
  );
  await page.route("https://nomia.test/cover-motion/", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: html.replace("<head>", `<head><style>${css}</style>`),
    }),
  );
  await page.goto("https://nomia.test/cover-motion/");
  const background = page.locator(".wp-block-cover > .wp-block-cover__video-background");
  assert.equal(await background.count(), 5);
  for (const video of await background.all()) {
    assert.equal(await video.getAttribute("autoplay"), null, "SSR prevents eager playback");
    assert.equal(await video.evaluate((node) => node.paused), true);
  }
  assert.equal(
    (await page.locator('[data-cover-path="neutral"] .wp-block-cover').boundingBox()).height,
    192,
  );
  const savedVideo = page.locator('[data-cover-path="parsed"] .wp-block-cover > video');
  assert.equal(await savedVideo.getAttribute("poster"), "https://nomia.test/poster.svg");
  assert.equal(await savedVideo.locator("source").getAttribute("src"), attributes.url);
  const foreground = page.locator('[data-cover-path="parsed"] #foreground-video');
  assert.notEqual(await foreground.getAttribute("autoplay"), null);
  assert.equal(await foreground.getAttribute("controls"), "");
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    globalThis.stopPresentation = globalThis.NomiaPresentation.startDesignPresentation();
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".wp-block-cover > video")].every(
      (video) => !video.paused && video.currentTime > 0,
    ),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".wp-block-cover > video")].every((video) => video.paused),
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".wp-block-cover > video")].every((video) => !video.paused),
  );
  await page.evaluate(() => document.dispatchEvent(new Event("astro:before-swap")));
  assert.equal(
    await background.evaluateAll((videos) => videos.every((video) => video.paused)),
    true,
  );
  await page.evaluate(() => document.dispatchEvent(new Event("astro:page-load")));
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".wp-block-cover > video")].every((video) => !video.paused),
  );
  await page.evaluate(() => globalThis.stopPresentation());
  assert.equal(
    await background.evaluateAll((videos) => videos.every((video) => video.paused)),
    true,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  assert.equal(
    await background.evaluateAll((videos) => videos.every((video) => video.paused)),
    true,
  );
  assert.equal(
    await page
      .locator('[data-cover-path="parsed"]')
      .getByRole("link", { name: "Cover details" })
      .getAttribute("href"),
    "#details",
  );
});
