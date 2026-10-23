import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "@wordpress/block-serialization-default-parser";
import {
  presentationStyleSheet,
  renderDesignPattern,
  renderWordPressBlocks,
} from "@getquick/content";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
import { build } from "vite";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";

// These are saved-composition consumer fixtures. Upstream's real editor save
// and public-delivery fixture must be verified separately before acceptance.
test("media presentation reaches actual Nomia wrappers and direct media only", async (t) => {
  const output = await build({
    root: fileURLToPath(new URL("../..", import.meta.url)),
    configFile: false,
    logLevel: "error",
    plugins: [tailwindcss()],
    build: {
      write: false,
      rollupOptions: {
        input: fileURLToPath(new URL("../../src/styles/global.css", import.meta.url)),
      },
    },
  });
  const css =
    output.output
      .filter((asset) => asset.type === "asset" && asset.fileName.endsWith(".css"))
      .map((asset) => String(asset.source))
      .join("\n") + presentationStyleSheet();
  const source = "https://media.example/fixture.svg";
  const saved = (name, attrs, html) =>
    `<!-- wp:${name} ${JSON.stringify(attrs)} -->${html}<!-- /wp:${name} -->`;
  const presentation = {
    base: {
      width: "1/2",
      height: "150px",
      objectFit: "cover",
      objectPosition: { x: 0.25, y: 0.75 },
      borderRadius: "lg",
    },
    md: { height: "240px", objectFit: "contain", objectPosition: "right" },
  };
  const figure = (cls, id) =>
    `<figure class="${cls}" id="${id}" style="width:300px"><a href="/destination/"><picture><source srcset="${source}"><img src="${source}" alt="Authored illustration" width="400" height="200" style="height:90px;object-fit:fill"></picture></a><figcaption>Saved caption</figcaption></figure>`;
  const document = [
    saved("core/image", { url: source, presentation }, figure("wp-block-image", "image")),
    saved(
      "core/post-featured-image",
      { presentation },
      figure("wp-block-post-featured-image", "featured"),
    ),
    saved(
      "core/site-logo",
      {
        presentation,
        className: "fixture-logo",
        logo: { url: source, alt: "Brand", width: 400, height: 200 },
      },
      `<div class="wp-block-site-logo fixture-logo" id="logo"><a href="/" aria-label="Home"><img src="${source}" alt="Brand" width="400" height="200"></a></div>`,
    ),
    saved(
      "core/cover",
      {
        presentation: {
          base: {
            height: "240px",
            objectFit: "contain",
            objectPosition: { x: 1, y: 0 },
            overlayOpacity: "25",
          },
          md: { overlayOpacity: "75" },
        },
      },
      `<div class="wp-block-cover" id="cover" style="min-height:0;height:150px"><span class="wp-block-cover__background" style="opacity:0.9"></span><img class="wp-block-cover__image-background" src="${source}" alt="" style="object-fit:cover"><div class="wp-block-cover__inner-container">${saved("core/image", {}, `<figure class="wp-block-image" id="inside"><img src="${source}" alt="Nested content" width="400" height="200" style="object-fit:fill;object-position:50% 50%"></figure>`)}</div></div>`,
    ),
  ].join("");
  const blocks = parse(document);
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const local = (await harness.renderBlocks(blocks, { bare: true })).html;
  const design = (block) => ({
    name: block.blockName,
    attributes: block.attrs,
    content: block.innerHTML,
    children: block.innerBlocks.map(design),
  });
  const wordpress = (block) => {
    let child = 0;
    return {
      name: block.blockName,
      attributes: block.attrs,
      // Public WP delivery supplies complete server HTML for Cover, whose
      // foreground is already rendered. A saved shell alone omits its children.
      htmlContent:
        block.blockName === "core/cover"
          ? block.innerContent
              .map(
                (piece) => piece ?? renderWordPressBlocks([wordpress(block.innerBlocks[child++])]),
              )
              .join("")
          : block.innerHTML,
      innerBlocks: block.innerBlocks.map(wordpress),
    };
  };
  const scopes = {
    local,
    chrome: renderDesignPattern(blocks.map(design)),
    html: renderWordPressBlocks(blocks.map(wordpress)),
  };
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.route("https://media.example/fixture.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"></svg>',
    }),
  );
  await page.setContent(
    `<style>${css}</style>${Object.entries(scopes)
      .map(([id, html]) => `<div class="nomia-blocks" data-scope="${id}">${html}</div>`)
      .join("")}`,
  );
  for (const width of [767, 768, 769, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const scope of Object.keys(scopes)) {
      const root = page.locator(`[data-scope="${scope}"]`);
      for (const id of ["image", "featured", "logo"]) {
        const figure = root.locator(id === "logo" ? ".fixture-logo" : `[id="${id}"]`);
        assert.ok(
          Math.abs(
            (await figure.evaluate((node) => node.getBoundingClientRect().width)) - width / 2,
          ) < 0.1,
          `${scope}/${id}: wrapper fraction`,
        );
        const image = figure.locator("img");
        const computed = await image.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            fit: style.objectFit,
            position: style.objectPosition,
            height: node.getBoundingClientRect().height,
            radius: style.borderRadius,
          };
        });
        assert.equal(computed.fit, width < 768 ? "cover" : "contain", `${scope}/${id}: direct fit`);
        assert.equal(
          computed.position,
          width < 768 ? "25% 75%" : "100% 50%",
          `${scope}/${id}: focal point`,
        );
        assert.equal(
          computed.height,
          width < 768 ? 150 : 240,
          `${scope}/${id}: explicit media height`,
        );
        assert.equal(computed.radius, "8px");
      }
      const image = root.locator('[id="image"]');
      assert.equal(await image.locator("a").getAttribute("href"), "/destination/");
      assert.equal(await image.locator("figcaption").textContent(), "Saved caption");
      assert.equal(await image.locator("source").count(), 1);
      assert.equal(await image.locator("img").getAttribute("alt"), "Authored illustration");
      const cover = root.locator('[id="cover"]');
      assert.equal(
        await cover
          .locator(":scope > .wp-block-cover__background")
          .evaluate((node) => getComputedStyle(node).opacity),
        width < 768 ? "0.25" : "0.75",
      );
      assert.equal(
        await cover
          .locator(":scope > .wp-block-cover__image-background")
          .evaluate((node) => getComputedStyle(node).objectPosition),
        "100% 0%",
      );
      assert.equal(
        await cover
          .locator('[id="inside"] img')
          .evaluate((node) => getComputedStyle(node).objectFit),
        "fill",
        "Cover fit must not reach nested image",
      );
      assert.equal(
        await cover
          .locator('[id="inside"] img')
          .evaluate((node) => getComputedStyle(node).objectPosition),
        "50% 50%",
        "Cover focal point must not reach nested image",
      );
    }
  }
});
