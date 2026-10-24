import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { renderDesignPattern, renderWordPressBlocks } from "@getquick/content";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";
import { buildPresentationCss, buildPresentationClient } from "../presentation-build.mjs";

test("saved Hero box, foreground and deferred player work in Nomia production CSS", async (t) => {
  const css = await buildPresentationCss();
  const script = await buildPresentationClient();
  assert.doesNotMatch(script, /schemaEnv|validateSchema|ajv-formats/);
  const blocks = ["video-hero-presentation.html", "video-hero-youtube.html"].flatMap((name) =>
    parse(
      readFileSync(new URL(`../fixtures/design-presentation/${name}`, import.meta.url), "utf8"),
    ),
  );
  const publicFixture = JSON.parse(
    readFileSync(
      new URL("../fixtures/design-presentation/video-hero-saved-public.json", import.meta.url),
      "utf8",
    ),
  );
  const wordpress = (block) => ({
    name: block.blockName,
    attributes: block.attrs,
    htmlContent: block.innerHTML,
    innerBlocks: block.innerBlocks.map(wordpress),
  });
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const scopes = {
    local: (await harness.renderBlocks(blocks, { bare: true })).html,
    chrome: renderDesignPattern(publicFixture.blocks.map((entry) => entry.node)),
    html: renderWordPressBlocks(blocks.map(wordpress)),
  };
  const html = await harness.renderLayout(
    Object.entries(scopes)
      .map(([name, html]) => `<section data-hero="${name}">${html}</section>`)
      .join(""),
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.setDefaultTimeout(5000);
  await page.route("https://example.test/poster.jpg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"></svg>',
    }),
  );
  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
  await page.setViewportSize({ width: 767, height: 900 });
  await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
  // Exercise a late scoped media reset as well as the Site's actual CSS.
  await page.addStyleTag({
    content: ".gqd-content.gqd-content img,.gqd-content.gqd-content video{height:auto}",
  });
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    globalThis.stopPresentation = globalThis.NomiaPresentation.startDesignPresentation();
  });
  for (const scope of Object.keys(scopes)) {
    const region = page.locator(`[data-hero="${scope}"]`);
    const heroes = region.locator(".wp-block-getquick-design-video-hero");
    assert.equal(await heroes.count(), 2);
    for (const hero of await heroes.all()) {
      assert.equal((await hero.boundingBox()).height, 256);
      assert.equal((await hero.boundingBox()).width, 383.5);
      assert.equal((await hero.locator(".gqd-video-hero__media").boundingBox()).height, 256);
      assert.equal((await hero.locator(".gqd-video-hero__poster").boundingBox()).height, 256);
    }
    assert.deepEqual(
      await heroes.first().evaluate((node) => ({
        color: getComputedStyle(node).color,
        background: getComputedStyle(node).backgroundColor,
      })),
      { color: "rgb(255, 255, 255)", background: "rgb(0, 0, 0)" },
      "saved native contrast survives each actual adapter",
    );
    const content = heroes.first().locator(".gqd-video-hero__content");
    assert.equal(await content.evaluate((node) => getComputedStyle(node).alignItems), "flex-end");
    assert.equal(
      await content.evaluate((node) => getComputedStyle(node).justifyContent),
      "flex-end",
    );
    assert.equal(await content.evaluate((node) => getComputedStyle(node).textAlign), "start");
    const link = region.getByRole("link", { name: "Explore the collection" });
    assert.equal(await link.getAttribute("href"), "#destination");
    await link.focus();
    assert.equal(await link.evaluate((node) => node === document.activeElement), true);
    const frame = region.locator("iframe");
    assert.equal(
      await frame.getAttribute("src"),
      null,
      "reduced motion prevents initial player attachment",
    );
    assert.equal(await frame.getAttribute("title"), 'Video "di" sfondo & musica');
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const width of [767, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const scope of Object.keys(scopes)) {
      const frame = page.locator(`[data-hero="${scope}"] iframe`);
      await frame.waitFor({ state: "visible" });
      assert.match(await frame.getAttribute("src"), /youtube-nocookie/);
      const mediaWidth = width / 2;
      const expectedHeight = width < 768 ? 256 : (mediaWidth * 315) / 560;
      const expectedWidth = width < 768 ? (256 * 560) / 315 : mediaWidth;
      await page.waitForFunction(
        ({ scope, expectedWidth, expectedHeight }) => {
          const rect = document
            .querySelector(`[data-hero="${scope}"] iframe`)
            .getBoundingClientRect();
          return (
            Math.abs(rect.width - expectedWidth) < 0.1 &&
            Math.abs(rect.height - expectedHeight) < 0.1
          );
        },
        { scope, expectedWidth, expectedHeight },
      );
      const box = await frame.boundingBox();
      assert.ok(
        Math.abs(box.width - expectedWidth) < 0.1,
        `${scope}/${width}: iframe cover/contain ${box.width} vs ${expectedWidth} uses actual media box`,
      );
      assert.ok(Math.abs(box.height - expectedHeight) < 0.1);
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const frame of await page.locator("iframe").all()) {
    await page.waitForFunction((node) => !node.getAttribute("src"), await frame.elementHandle());
  }
  await page.evaluate(() => globalThis.stopPresentation());
});

test("Site consent grant/revoke and reduced motion govern actual Hero media mounting", async (t) => {
  const css = await buildPresentationCss();
  const script = await buildPresentationClient();
  const { buildConsentClient } = await import("../presentation-build.mjs");
  const consentScript = await buildConsentClient();
  const fixture = JSON.parse(
    readFileSync(
      new URL("../fixtures/design-presentation/video-hero-saved-public.json", import.meta.url),
      "utf8",
    ),
  );
  const poster = fixture.blocks[0].node;
  const youtube = fixture.blocks[1].node;
  // This supplied self-hosted context reuses the real saved presentation and
  // foreground with a deterministic local WebM. It is not a new CMS capture.
  const hosted = {
    ...poster,
    content: null,
    attributes: {
      ...poster.attributes,
      anchor: "provided-hosted-hero",
      className: "provided-hosted-media",
      videoType: "self-hosted",
      videoUrl: "/hero-test.webm",
      posterUrl: "/poster.svg",
    },
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    assert.match(JSON.parse(init.body).query, /query DesignPresets/);
    return Response.json({ data: { designTokens: { colors: [], spacingSizes: [] } } });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const rendered = await harness.renderPattern({
    title: "Saved consent media",
    blocks: [hosted, youtube],
  });
  const html = await harness.renderLayout(rendered);
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.setDefaultTimeout(5000);
  const videoBytes = readFileSync(new URL("../fixtures/media/hero-test.webm", import.meta.url));
  let recorded = 0;
  await page.route("https://nomia.test/**", (route) => route.abort());
  await page.route("https://nomia.test/hero-test.webm", (route) =>
    route.fulfill({ contentType: "video/webm", body: videoBytes }),
  );
  await page.route("https://nomia.test/poster.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"></svg>',
    }),
  );
  await page.route("https://example.test/poster.jpg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"></svg>',
    }),
  );
  await page.route("https://nomia.test/gq/consent", (route) => {
    recorded++;
    return route.fulfill({ status: 204 });
  });
  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
  await page.route("https://nomia.test/hero-consent/", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: html.replace("<head>", `<head><style>${css}</style>`),
    }),
  );
  await page.goto("https://nomia.test/hero-consent/");
  await page.addScriptTag({ content: consentScript });
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    globalThis.NomiaConsent.startConsent();
    globalThis.stopPresentation = globalThis.NomiaPresentation.startDesignPresentation();
  });
  const media = page.locator(".gqd-video-hero__media");
  const video = page.locator("video");
  assert.equal(
    await page.locator("#provided-hosted-hero.provided-hosted-media").count(),
    1,
    "reconstructed native shell preserves authored identity",
  );
  assert.equal(await video.getAttribute("autoplay"), null);
  assert.equal(await video.evaluate((node) => node.muted && node.loop && node.playsInline), true);
  assert.equal(await video.evaluate((node) => node.paused), true);
  assert.equal(
    await page.locator("iframe").count(),
    0,
    "actual Site runtime consent gating precedes player mounting",
  );
  await page.locator("#gq-consent-banner [data-gq-consent-accept-all]").click();
  await page.waitForFunction(
    () => document.querySelectorAll(".gqd-video-hero__media > iframe").length === 1,
  );
  const frame = media.nth(1).locator(":scope > iframe");
  assert.equal(
    await frame.getAttribute("src"),
    null,
    "grant preserves reduced-motion gate on replacement",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(() => {
    const video = document.querySelector("video");
    return video && !video.paused && video.currentTime > 0;
  });
  await page.waitForFunction(() =>
    document
      .querySelector(".gqd-video-hero__media > iframe")
      ?.getAttribute("src")
      ?.includes("youtube-nocookie"),
  );
  assert.equal((await video.boundingBox()).height, 256);
  const link = page.getByRole("link", { name: "Discover more" });
  await link.focus();
  assert.equal(await link.evaluate((node) => node === document.activeElement), true);
  await page.locator("footer [data-gq-consent-open]").click();
  await page.locator("#gq-consent-preferences [data-gq-consent-reject-all]").click();
  await page.waitForFunction(() => document.querySelectorAll("iframe").length === 0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => document.querySelector("video")?.paused === true);
  assert.ok(recorded >= 2, "the existing controller records both decisions through its endpoint");
  await page.evaluate(() => globalThis.stopPresentation());
});
