import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { renderDesignPattern } from "@getquick/content";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
import { build } from "vite";

// Exercise the header's real pattern renderer and production CSS together.
// Install Chromium first: pnpm --filter @nomia-bnq/frontend exec playwright install chromium
// jsdom cannot measure breakpoint sizing or detect nested overflow.
test("Container sizing survives the frontend render and CSS cascade", async () => {
  const entry = fileURLToPath(new URL("../../src/styles/global.css", import.meta.url));
  const result = await build({
    root: fileURLToPath(new URL("../..", import.meta.url)),
    configFile: false,
    logLevel: "error",
    plugins: [tailwindcss()],
    build: { write: false, rollupOptions: { input: entry } },
  });
  const css = result.output
    .filter((item) => item.type === "asset" && item.fileName.endsWith(".css"))
    .map((item) => String(item.source))
    .join("\n");
  const container = (id, attributes = {}, children = []) => ({
    name: "getquick-design/container",
    attributes: { className: id, ...attributes },
    content: children.length
      ? null
      : '<div class="wp-block-getquick-design-container ' + id + '"><span>Content</span></div>',
    children,
  });
  const leaf = (id, classes = "") => container(`${id} ${classes}`.trim());
  const blocks = [
    leaf("topNormal"),
    leaf("topFraction", "gqd-container--w-full"),
    container("outer", { align: "full" }, [
      container("normal", {}, [
        {
          name: "core/site-logo",
          attributes: {
            logo: { url: "https://example.test/logo.svg", alt: "Nomia", width: 100, height: 50 },
          },
          content: null,
          children: [],
        },
      ]),
      leaf("start", "gqd-container--alignment-start"),
      leaf("end", "gqd-container--alignment-end"),
      leaf(
        "fraction",
        "gqd-container--w-5-6 gqd-container--tablet-w-1-2 gqd-container--mobile-w-full gqd-container--alignment-end gqd-container--tablet-alignment-center gqd-container--mobile-alignment-start",
      ),
      leaf("tabletOnly", "gqd-container--tablet-w-1-2"),
      container(
        "narrow",
        { layout: { type: "constrained", contentSize: "400px", wideSize: "600px" } },
        [
          leaf("cappedFraction", "gqd-container--w-1-2 gqd-container--alignment-end"),
          container("nested", { layout: { type: "constrained", contentSize: "100px" } }, [
            leaf("deep"),
          ]),
          container("wide", { align: "wide" }, [leaf("wideInner")]),
          container("full", { align: "full" }, [leaf("fullInner")]),
        ],
      ),
      container("plain", { style: {} }, [leaf("plainInner")]),
    ]),
  ];
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.route("**/*", (route) => route.abort());
    const html = renderDesignPattern(blocks);
    assert.match(html, /class="wp-block-getquick-design-container normal"/);
    await page.setContent(
      `<style>${css}</style><div class="nomia-pattern">${html}</div><div class="prose-wp">${html}</div>`,
    );
    // A narrow ordinary parent must also contain its normal child.
    await page.addStyleTag({ content: ".plain { width: 300px !important }" });
    const measure = (selector) =>
      page
        .locator(selector)
        .first()
        .evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const parent = element.parentElement.getBoundingClientRect();
          const style = getComputedStyle(element);
          return { width: rect.width, offset: rect.left - parent.left, padding: style.paddingLeft };
        });
    const close = (actual, expected, message) =>
      assert.ok(Math.abs(actual - expected) < 0.1, `${message}: ${actual} ≠ ${expected}`);
    for (const viewport of [1920, 375, 639, 640, 767, 768, 1023, 1024, 1279, 1280, 1535, 1536]) {
      await page.setViewportSize({ width: viewport, height: 900 });
      const cap =
        [640, 768, 1024, 1280, 1536].filter((size) => size <= viewport).at(-1) ?? viewport;
      for (const scope of [".nomia-pattern", ".prose-wp"]) {
        close(
          (await measure(`${scope} .topNormal`)).width,
          cap,
          "top level default bypasses article measure",
        );
        close(
          (await measure(`${scope} .topFraction`)).width,
          viewport,
          "explicit full width bypasses default cap",
        );
        const normal = await measure(`${scope} .normal`);
        close(normal.width, cap, `normal width at ${viewport}`);
        close(normal.offset, (viewport - cap) / 2, "default centered");
        assert.equal(normal.padding, "0px");
        close((await measure(`${scope} .start`)).offset, 0, "start alignment");
        close((await measure(`${scope} .end`)).offset, viewport - cap, "end alignment");
        close(
          (await measure(`${scope} .normal .wp-block-site-logo`)).offset,
          0,
          "logo begins at container edge",
        );
        const fraction = await measure(`${scope} .fraction`);
        const fractionWidth =
          viewport < 768 ? viewport : viewport < 1024 ? viewport / 2 : (viewport * 5) / 6;
        close(fraction.width, fractionWidth, "responsive fraction bypasses cap");
        close(
          fraction.offset,
          viewport < 768
            ? 0
            : viewport < 1024
              ? (viewport - fractionWidth) / 2
              : viewport - fractionWidth,
          "responsive alignment",
        );
        close(
          (await measure(`${scope} .tabletOnly`)).width,
          viewport < 1024 ? viewport / 2 : cap,
          "inactive responsive fraction keeps default",
        );
        close(
          (await measure(`${scope} .nested`)).width,
          Math.min(cap, 400),
          "incoming constrained size survives child's own layout",
        );
        const cappedFraction = await measure(`${scope} .cappedFraction`);
        close(
          cappedFraction.width,
          Math.min(cap / 2, 400),
          "native parent caps explicit half width",
        );
        close(
          cappedFraction.offset,
          cap - Math.min(cap / 2, 400),
          "explicit end overrides constrained auto margins",
        );
        close(
          (await measure(`${scope} .deep`)).width,
          Math.min(cap, 100),
          "child layout applies to its children",
        );
        close(
          (await measure(`${scope} .wide`)).width,
          Math.min(cap, 600),
          "wide uses parent wide size",
        );
        close((await measure(`${scope} .full`)).width, cap, "full uses parent width");
        close(
          (await measure(`${scope} .plainInner`)).width,
          300,
          "nested normal fits narrow ordinary parent",
        );
      }
    }
  } finally {
    await browser.close();
  }
});
