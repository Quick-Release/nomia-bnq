import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { renderDesignPattern, resolveDesignTheme } from "@getquick/content";
import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";

test("actual saved navigation producer renders and mounts in Nomia chrome", async (t) => {
  const root = fileURLToPath(new URL("../..", import.meta.url));
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
  const output = await build({
    root,
    configFile: false,
    logLevel: "error",
    plugins: [tailwindcss()],
    build: { write: false, rollupOptions: { input: `${root}/src/styles/global.css` } },
  });
  const css = output.output
    .filter((asset) => asset.type === "asset" && asset.fileName.endsWith(".css"))
    .map((asset) => String(asset.source))
    .join("\n");
  const client = await build({
    root,
    configFile: false,
    logLevel: "error",
    build: {
      write: false,
      lib: {
        entry: `${root}/src/lib/design-presentation-client.ts`,
        formats: ["iife"],
        name: "NomiaPresentation",
      },
    },
  });
  const script = (Array.isArray(client) ? client : [client])
    .flatMap((bundle) => bundle.output)
    .filter((asset) => asset.type === "chunk")
    .map((asset) => asset.code)
    .join("\n");
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
