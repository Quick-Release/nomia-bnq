import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderDesignPattern } from "@getquick/content";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";
import { buildPresentationCss, buildPresentationClient } from "../presentation-build.mjs";

test("actual Polylang layout inputs retain home URLs, flags, current labels and keyboard dropdowns", async (t) => {
  const css = await buildPresentationCss();
  const script = await buildPresentationClient();
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
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  for (const capture of ["language-navigation", "language-navigation-flags"]) {
    const root = new URL(`../fixtures/design-presentation/${capture}/`, import.meta.url);
    const provenance = JSON.parse(readFileSync(new URL("provenance.json", root), "utf8"));
    for (const [url, asset] of Object.entries(provenance.flagAssets ?? {})) {
      await page.route(url, (route) =>
        route.fulfill({
          contentType: asset.contentType,
          body: readFileSync(new URL(asset.file, root)),
        }),
      );
    }
    for (const language of ["en", "fr"]) {
      const nodes = JSON.parse(readFileSync(new URL(`${language}-nodes.json`, root), "utf8"));
      const direct = renderDesignPattern(nodes);
      assert.ok(
        direct.length > 0,
        "producer-resolved force_home destinations must not be discarded by noTranslation metadata",
      );
      const rendered = await harness.renderPattern({
        title: "Actual language composition",
        blocks: nodes,
      });
      const html = await harness.renderLayout(
        `<section data-language-path="site">${rendered}</section><section data-language-path="helper">${direct}</section>`,
      );
      await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
      await page.addScriptTag({ content: script });
      await page.evaluate(() => {
        globalThis.stopPresentation = globalThis.NomiaPresentation.startDesignPresentation();
      });
      for (const width of [1023, 1024, 1025]) {
        await page.setViewportSize({ width, height: 900 });
        for (const path of ["site", "helper"]) {
          const region = page.locator(`[data-language-path="${path}"]`);
          for (const node of nodes) {
            const root = region.locator(`.${node.attributes.className}`);
            assert.equal(await root.count(), 1);
            const dropdown = node.attributes.dropdown === true;
            const summary = root.locator("summary");
            if (dropdown) {
              const current = node.attributes.links.find((link) => link.current);
              assert.equal(await summary.textContent(), current.label);
              await summary.press("Enter");
              assert.equal(await root.getAttribute("open"), "");
            }
            assert.equal(
              await root.evaluate((node) => getComputedStyle(node).gap),
              width < 1024 ? "16px" : "32px",
            );
            for (const link of node.attributes.links) {
              const anchor = root.getByRole("link", { name: link.label, exact: true });
              assert.equal(
                await anchor.getAttribute("href"),
                link.url,
                "no derived translation URL",
              );
              assert.equal(Boolean(await anchor.getAttribute("aria-current")), link.current);
              await anchor.focus();
              assert.equal(await anchor.evaluate((node) => node === document.activeElement), true);
              if (node.attributes.show_flags && link.flagUrl) {
                const image = anchor.locator("img");
                assert.equal(
                  await image.getAttribute("src"),
                  link.flagUrl,
                  "transport keeps original captured asset URL",
                );
                await image.evaluate((image) => image.decode());
                assert.equal(await image.evaluate((image) => image.naturalWidth), 16);
                assert.equal(await image.evaluate((image) => image.naturalHeight), 11);
                assert.ok((await image.boundingBox()).width > 0);
              } else assert.equal(await anchor.locator("img").count(), 0);
            }
            if (dropdown) {
              await root.getByRole("link").last().press("Escape");
              assert.equal(await root.getAttribute("open"), null);
              assert.equal(await summary.evaluate((node) => node === document.activeElement), true);
            }
          }
        }
      }
      await page.locator("body").evaluate((node) => {
        node.dir = "rtl";
      });
      const firstList = page.locator('[data-language-path="site"] .gqd-capture-language-list');
      const positions = await firstList
        .locator(":scope > li")
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().left));
      assert.ok(
        positions[0] > positions[1],
        "RTL applies to logical list placement without changing resolved language metadata",
      );
      await page.evaluate(() => globalThis.stopPresentation());
    }
  }
});

test("actual language body HTML keeps accessible null-flag names and native selected options", async (t) => {
  const css = await buildPresentationCss();
  const script = await buildPresentationClient();
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  const { JSDOM } = await import("jsdom");
  for (const capture of ["language-navigation-a11y", "language-navigation-flags"]) {
    const root = new URL(`../fixtures/design-presentation/${capture}/`, import.meta.url);
    for (const language of ["en", "fr"]) {
      const source = readFileSync(new URL(`${language}-rendered.html`, root), "utf8");
      const captured = JSON.parse(
        readFileSync(new URL(`${language}-public-rest.json`, root), "utf8"),
      );
      const document = new JSDOM(source).window.document;
      const uri = `/language-body-${language}/`;
      globalThis.fetch = async (_url, init) => {
        const request = JSON.parse(init.body);
        const operation = /query (\w+)/.exec(request.query)?.[1];
        const data =
          operation === "EntryByUri"
            ? {
                postBy: null,
                pageBy: {
                  id: String(captured.id),
                  databaseId: captured.id,
                  title: captured.title.rendered,
                  content: source,
                  uri,
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
      const delivered = await harness.renderEntry(uri);
      assert.equal(delivered.status, 200);
      await page.setContent(delivered.html.replace("<head>", `<head><style>${css}</style>`));
      const body = page.locator(".prose-wp");
      for (const mode of ["list", "flags"]) {
        const selector = `.gqd-capture-language-${mode}`;
        const links = [...document.querySelectorAll(`${selector} a`)];
        assert.equal(links.length, 2);
        for (let index = 0; index < links.length; index++) {
          const anchor = body.locator(`${selector} a`).nth(index);
          const sourceLink = links[index];
          const name =
            sourceLink.getAttribute("aria-label") ||
            sourceLink.textContent.trim() ||
            sourceLink.querySelector("img")?.alt;
          assert.ok(name);
          assert.equal(
            await body.locator(selector).getByRole("link", { name, exact: true }).count(),
            1,
          );
          assert.equal(await anchor.getAttribute("href"), sourceLink.getAttribute("href"));
          assert.equal(
            await anchor.getAttribute("aria-current"),
            sourceLink.getAttribute("aria-current"),
            "body metadata follows captured HTML, independently of layout nodes",
          );
          await anchor.focus();
          assert.equal(await anchor.evaluate((node) => node === document.activeElement), true);
          for (const image of await anchor.locator("img").all()) {
            await image.evaluate((image) => image.decode());
            assert.equal(await image.evaluate((image) => image.naturalWidth), 16);
          }
        }
      }
      const sourceSelect = document.querySelector("select.pll-switcher-select");
      const select = body.locator("select.pll-switcher-select");
      assert.equal(await select.inputValue(), sourceSelect.value);
      assert.deepEqual(
        await select
          .locator("option")
          .evaluateAll((nodes) =>
            nodes.map((node) => ({ value: node.value, text: node.textContent.trim() })),
          ),
        [...sourceSelect.options].map((node) => ({
          value: node.value,
          text: node.textContent.trim(),
        })),
      );
      await select.focus();
      assert.equal(await select.evaluate((node) => node === document.activeElement), true);
      if (capture === "language-navigation-flags" && language === "fr") {
        assert.equal(await body.locator("script").count(), 0, "delivery is scriptless");
        await page.addScriptTag({ content: script });
        await page.evaluate(() => {
          globalThis.stopPresentation = globalThis.NomiaPresentation.startDesignPresentation();
        });
        const target = [...sourceSelect.options].find((option) => !option.selected).value;
        const navigations = [];
        await page.route(target, (route) => {
          navigations.push(route.request().url());
          return route.fulfill({ contentType: "text/html", body: "Language destination" });
        });
        await page.evaluate(() => globalThis.stopPresentation());
        await select.selectOption(target);
        assert.deepEqual(navigations, [], "cleanup removes the select controller");
        await page.evaluate(() => {
          globalThis.stopPresentation = globalThis.NomiaPresentation.startDesignPresentation();
          const select = document.querySelector("select.pll-switcher-select");
          select.add(new Option("Unsafe test option", "javascript:globalThis.unsafeLanguage=true"));
        });
        await select.selectOption("javascript:globalThis.unsafeLanguage=true");
        assert.equal(await page.evaluate(() => globalThis.unsafeLanguage), undefined);
        await select.evaluate((node, current) => {
          node.options[node.options.length - 1].remove();
          node.value = current;
        }, sourceSelect.value);
        await select.focus();
        await Promise.all([
          page.waitForURL(target),
          select.press(sourceSelect.options[0].value === target ? "Home" : "End"),
        ]);
        assert.deepEqual(navigations, [target], "owning controller uses exact captured option URL");
      }
    }
  }
});
