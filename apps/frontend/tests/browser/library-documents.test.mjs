import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";

test("Legislação cards use three desktop columns, two tablet columns and one mobile column", async () => {
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const built = await build({
    root,
    configFile: false,
    logLevel: "error",
    plugins: [tailwindcss()],
    build: { write: false, rollupOptions: { input: `${root}/src/styles/global.css` } },
  });
  const css = built.output
    .filter((item) => item.type === "asset" && item.fileName.endsWith(".css"))
    .map((item) => String(item.source))
    .join("\n");
  const harness = await createAstroRenderHarness();
  const browser = await chromium.launch({ headless: true });
  try {
    const row = {
      href: "/biblioteca/documento/plasticos/",
      title: "Estratégia Europeia para os Plásticos",
      year: 2018,
      publisher: "Comissão Europeia",
      imageSrc: null,
      imageAlt: "",
      description:
        "A primeira estratégia europeia para os plásticos adotada pela Comissão Europeia, integra-se no processo de transição para uma economia mais circular.",
      fileUrl: "https://example.org/document.pdf",
      pageUrl: "https://example.org/document/",
    };
    const { html } = await harness.renderComponent(
      "/src/components/content-lists/listing/NomiaContentListing.astro",
      { display: "document-grid", rows: Array.from({ length: 6 }, () => row), empty: "none" },
    );
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><html lang="pt"><head><meta charset="UTF-8"><style>${css}</style></head><body><main>${html}</main></body></html>`,
    );
    for (const [width, columns] of [
      [1440, 3],
      [768, 2],
      [390, 1],
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      const measured = await page.locator("[data-nomia-content-listing] > ul").evaluate((grid) => ({
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      }));
      assert.equal(measured.columns, columns, `${width}px column count`);
      assert.equal(measured.overflow, false, `${width}px horizontal overflow`);
      assert.equal(await page.getByText("image not available", { exact: true }).count(), 6);
    }
  } finally {
    await browser.close();
    await harness.close();
  }
});
