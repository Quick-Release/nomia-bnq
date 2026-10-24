import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";
import { renderDesignPattern, resolveDesignTheme } from "@getquick/content";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";
import { buildPresentationCss, buildPresentationClient } from "../presentation-build.mjs";

test("actual saved navigation producer renders and mounts in Nomia chrome", async (t) => {
  const fixture = JSON.parse(
    readFileSync(
      new URL(
        "../fixtures/design-presentation/navigation-presentation/nodes.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const response = JSON.parse(
    readFileSync(
      new URL(
        "../fixtures/design-presentation/navigation-presentation/public-rest.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  assert.deepEqual(fixture, response.getquickBlocks);
  const css = await buildPresentationCss();
  const script = await buildPresentationClient();
  assert.doesNotMatch(script, /schemaEnv|validateSchema|ajv-formats/);
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
  const rendered = await harness.renderPattern({ title: "Captured navigation", blocks: fixture });
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  let servedHtml = "";
  await page.route("https://nomia.test/**", (route) => route.abort());
  await page.route("https://nomia.test/public-navigation-destination-80/", (route) =>
    route.fulfill({ contentType: "text/html", body: servedHtml }),
  );
  for (const lg of ["64rem", "70rem"]) {
    const theme = resolveDesignTheme({ breakpoints: { lg } });
    const html = await harness.renderLayout(
      `<section data-navigation="site">${rendered}</section><section data-navigation="helper">${renderDesignPattern(fixture)}</section>`,
      theme,
    );
    await page.setViewportSize({ width: parseFloat(lg) * 16, height: 900 });
    servedHtml = html.replace("<head>", `<head><style>${css}</style>`);
    await page.goto("https://nomia.test/public-navigation-destination-80/");
    await page.addScriptTag({ content: script });
    await page.evaluate(() => {
      globalThis.stopPresentation = globalThis.NomiaPresentation.startDesignPresentation();
    });
    for (const width of [parseFloat(lg) * 16 - 1, parseFloat(lg) * 16, parseFloat(lg) * 16 + 1]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForFunction(
        (mobile) =>
          [...document.querySelectorAll("[data-gqd-navigation]")].every(
            (node) => node.hasAttribute("data-gqd-overlay-active") === mobile,
          ),
        width < parseFloat(lg) * 16,
      );
      for (const path of ["site", "helper"]) {
        const scope = page.locator(`[data-navigation="${path}"]`);
        const navs = scope.locator("[data-gqd-navigation]");
        assert.equal(await navs.count(), 2);
        assert.equal(
          await scope.getByRole("link", { name: "Instagram", exact: true }).getAttribute("href"),
          "https://instagram.com/example",
        );
        for (let index = 0; index < 2; index++) {
          const nav = navs.nth(index);
          assert.equal(await nav.getAttribute("data-gqd-navigation-enhanced"), "");
          const opener = nav.locator(":scope > [data-gqd-navigation-open]");
          const mobile = width < parseFloat(lg) * 16;
          assert.equal(await opener.isVisible(), mobile, "overlay uses resolved lg theme");
          if (mobile) await opener.click();
          const list = nav
            .locator(".gqd-navigation__list, .wp-block-navigation__container")
            .first();
          const styles = await list.evaluate((node) => ({
            direction: getComputedStyle(node).flexDirection,
            gap: getComputedStyle(node).gap,
          }));
          assert.deepEqual(styles, {
            direction: mobile ? "column" : "row",
            gap: mobile ? "16px" : "32px",
          });
          const labels = await nav.locator("a").allTextContents();
          assert.deepEqual(
            labels.map((value) => value.trim()),
            index === 0
              ? ["Products", "Shop", "Contact"]
              : [
                  "News",
                  "About",
                  "Team",
                  "Navigation child 80",
                  "Dynamic branch",
                  "Navigation child 80",
                ],
          );
          if (index === 1) {
            const news = nav.getByRole("link", { name: "News", exact: true });
            assert.equal(await news.getAttribute("href"), "/public-navigation-destination-80/");
            assert.equal(await news.getAttribute("aria-current"), "page");
            assert.equal(
              await news.evaluate((node) => getComputedStyle(node).color),
              "rgb(18, 52, 86)",
            );
            assert.equal(
              await news.evaluate(
                (node) => getComputedStyle(node.closest("li")).paddingInlineStart,
              ),
              "16px",
            );
          }
          const toggle = nav.locator("[data-gqd-submenu]").first();
          await toggle.press("ArrowDown");
          assert.equal(await toggle.getAttribute("aria-expanded"), "true");
          await toggle.press("Escape");
          assert.equal(await toggle.getAttribute("aria-expanded"), "false");
          assert.equal(await toggle.evaluate((node) => node === document.activeElement), true);
          if (mobile) {
            await nav.locator("[data-gqd-navigation-close]").click();
            assert.equal(await opener.getAttribute("aria-expanded"), "false");
          }
        }
      }
    }
    await page.locator("body").evaluate((node) => {
      node.dir = "rtl";
    });
    await page.evaluate(() => document.dispatchEvent(new Event("astro:before-swap")));
    assert.equal(await page.locator("[data-gqd-navigation-enhanced]").count(), 0);
    await page.evaluate(() => document.dispatchEvent(new Event("astro:page-load")));
    assert.equal(await page.locator("[data-gqd-navigation-enhanced]").count(), 4);
    await page.evaluate(() => globalThis.stopPresentation());
  }
});

test("ordinary Site entry delivery enhances captured WordPress navigation without a Site parser", async (t) => {
  const fixtureRoot = new URL(
    "../fixtures/design-presentation/navigation-presentation/",
    import.meta.url,
  );
  const captured = JSON.parse(readFileSync(new URL("public-rest.json", fixtureRoot), "utf8"));
  const rendered = readFileSync(new URL("rendered.html", fixtureRoot), "utf8");
  assert.equal(captured.content.rendered, rendered);
  const sourceDocument = new JSDOM(rendered).window.document;
  const sourceNews = [...sourceDocument.querySelectorAll("a")]
    .find((link) => link.textContent.trim() === "News")
    .getAttribute("href");
  assert.match(rendered, /data-wp-interactive/);
  assert.doesNotMatch(rendered, /data-gqd-navigation/);
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(init.body);
    const operation = /query (\w+)/.exec(request.query)?.[1];
    calls.push(operation);
    const data =
      operation === "EntryByUri"
        ? {
            postBy: null,
            pageBy: {
              id: String(captured.id),
              databaseId: captured.id,
              title: captured.title.rendered,
              content: rendered,
              uri: "/captured-navigation/",
              status: "publish",
              isRestricted: false,
              featuredImage: null,
              language: { slug: "pt" },
              translations: [],
              getquickBlocksJson: JSON.stringify(captured.getquickBlocks),
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
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  const css = await buildPresentationCss();
  const script = await buildPresentationClient();
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const response = await harness.renderEntry("/captured-navigation/");
  assert.equal(response.status, 200);
  assert.ok(calls.includes("EntryByUri"));
  assert.match(response.html, /data-wp-interactive/);
  assert.match(response.html, /data-gqd-navigation/);
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.setViewportSize({ width: 640, height: 900 });
  await page.setContent(response.html.replace("<head>", `<head><style>${css}</style>`));
  await page.addScriptTag({ content: script });
  await page.evaluate(() => globalThis.NomiaPresentation.startDesignPresentation());
  const navs = page.locator(".prose-wp [data-gqd-navigation]");
  assert.equal(await navs.count(), 2);
  for (const nav of await navs.all()) {
    assert.equal(await nav.getAttribute("data-gqd-navigation-enhanced"), "");
    const opener = nav.locator("[data-gqd-navigation-open]").first();
    await opener.click();
    assert.equal(await opener.getAttribute("aria-expanded"), "true");
    const toggle = nav.locator("[data-gqd-submenu]").first();
    await toggle.press("ArrowDown");
    assert.equal(await toggle.getAttribute("aria-expanded"), "true");
    await toggle.press("Escape");
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    await nav.locator("[data-gqd-navigation-close]").first().click();
    assert.equal(await opener.getAttribute("aria-expanded"), "false");
  }
  assert.equal(
    await navs
      .nth(1)
      .getByRole("link", { name: "News", exact: true, includeHidden: true })
      .getAttribute("href"),
    sourceNews,
    "saved HTML keeps its own source URL authority",
  );
  assert.equal(await page.locator('.prose-wp a[href="https://instagram.com/example"]').count(), 1);
});
