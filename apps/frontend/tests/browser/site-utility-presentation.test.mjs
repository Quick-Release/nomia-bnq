import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { presentationModel, presentationVariables, renderDesignPattern } from "@getquick/content";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";
import { buildPresentationCss } from "../presentation-build.mjs";

test("scoped Preflight preserves Nomia utilities while neutral controls remain authoritative", async (t) => {
  const css = await buildPresentationCss([
    fileURLToPath(new URL("../../src/styles/nomia-header.css", import.meta.url)),
  ]);
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const navigation = await harness.render({
    blockName: "getquick/header-navigation",
    attrs: {
      menuItems: [
        { id: "area", label: "Economia Circular", url: "#" },
        { id: "overview", parentId: "area", label: "Visão geral", url: "/overview/" },
      ],
    },
    innerHTML: "",
    innerBlocks: [],
  });
  const neutral = renderDesignPattern([
    {
      name: "core/heading",
      attributes: {
        level: 2,
        content: "Authored neutral heading",
        className: "text-h2",
        presentation: { base: { fontSize: "2xl" } },
      },
      content: null,
      children: [],
    },
  ]);
  const logo = renderDesignPattern([
    {
      name: "core/site-logo",
      attributes: {
        logo: {
          url: "https://media.example/identity.svg",
          alt: "Site identity",
          width: 2560,
          height: 277,
        },
      },
      content: null,
      children: [],
    },
  ]);
  const html = await harness.renderLayout(
    `<header class="nomia-header-bar">${logo}${navigation.html}</header><h2 class="text-h2 font-medium">Nomia utility heading</h2><h2>Unstyled heading</h2>${neutral}`,
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route("https://media.example/identity.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="277"></svg>',
    }),
  );
  await page.setContent(html.replace("<head>", `<head><style>${css}</style>`));
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("body").getAttribute("class"), "gqd-content");
  const button = page.locator("[data-nomia-navigation] .nomia-area-link").first();
  assert.equal(await button.evaluate((node) => getComputedStyle(node).padding), "8px 6px");
  for (const [name, size] of [
    ["Nomia utility heading", "56px"],
    ["Unstyled heading", "16px"],
    ["Authored neutral heading", "24px"],
  ]) {
    assert.equal(
      await page
        .getByRole("heading", { name, exact: true })
        .evaluate((node) => getComputedStyle(node).fontSize),
      size,
    );
  }
  const wrapper = page.locator("header .wp-block-site-logo");
  const image = wrapper.locator("img");
  await image.evaluate((node) => node.decode());
  assert.equal(
    (await wrapper.boundingBox()).width,
    180,
    "existing Site branding cap belongs to the wrapper",
  );
  assert.ok(Math.abs((await image.boundingBox()).width - 180) < 0.1);
  assert.ok(Math.abs((await image.boundingBox()).height - (180 * 277) / 2560) < 0.1);
  for (const [maxWidth, computed] of [
    ["full", "100%"],
    [presentationModel.properties.maxWidth.reset, "none"],
  ]) {
    const presentation = { md: { width: "1/2", maxWidth } };
    const variables = presentationVariables("core/site-logo", presentation, {
      attributes: { presentation },
    });
    await wrapper.evaluate((node, variables) => {
      node.removeAttribute("style");
      for (const [name, value] of Object.entries(variables)) node.style.setProperty(name, value);
    }, variables);
    await page.setViewportSize({ width: 1000, height: 900 });
    assert.equal(await wrapper.evaluate((node) => getComputedStyle(node).maxWidth), computed);
    assert.ok(
      (await wrapper.boundingBox()).width > 180,
      "explicit neutral sizing/reset wins the Site default cap",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      (await wrapper.boundingBox()).width,
      180,
      "omitted base sizing keeps the Site cap",
    );
  }
});
