import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
import { build, transformWithEsbuild } from "vite";
import { createAstroRenderHarness } from "../astro-render-harness.mjs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const block = (name, attrs = {}) => ({
  blockName: `getquick/header-${name}`,
  attrs,
  innerBlocks: [],
  innerHTML: "",
  innerContent: [],
});

test("Nomia header search opens, restores focus and submits on desktop and mobile", async (t) => {
  const harness = await createAstroRenderHarness();
  t.after(() => harness.close());
  const { html } = await harness.renderBlocks(
    [
      block("navigation", {
        menuItems: [{ id: 1, parentId: 0, label: "Biblioteca", url: "/biblioteca/", target: "" }],
      }),
      block("contact"),
      block("search", { resultsHref: "/pesquisa/?scope=all&pagina=4" }),
    ],
    { bare: true },
  );
  const built = await build({
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
    built.output
      .filter((item) => item.type === "asset" && item.fileName.endsWith(".css"))
      .map((item) => String(item.source))
      .join("\n") +
    read("../../src/styles/nomia-header.css") +
    read("../../src/styles/nomia-header-actions.css");
  const client = await transformWithEsbuild(
    read("../../src/lib/header-search-client.ts"),
    "header-search-client.ts",
    { loader: "ts", target: "es2022" },
  );
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(
      `<style>${css}</style><header class="nomia-header-bar"><span>Nomia</span>${html}</header>`,
    );
    // Before enhancement, the form can submit with JavaScript disabled.
    if (width === 1440) assert.equal(await page.locator("form").isVisible(), true);
    await page.addScriptTag({ type: "module", content: `${client.code}\ndefineHeaderSearch();` });
    await page.waitForFunction(() => Boolean(customElements.get("nomia-header-search")));
    const open = page.getByRole("button", { name: "Pesquisar", exact: true });
    await open.click();
    const input = page.getByRole("searchbox");
    assert.equal(await input.evaluate((el) => el === el.ownerDocument.activeElement), true);
    assert.equal(await page.locator("[data-nomia-navigation]").isVisible(), false);
    assert.equal(await page.locator(".nomia-header-contact").isVisible(), false);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      `${width}px search must fit`,
    );
    await input.press("Escape");
    assert.equal(await open.evaluate((el) => el === el.ownerDocument.activeElement), true);
    assert.equal(await page.getByRole("link", { name: "Contactos" }).isVisible(), true);
    await open.click();
    await page.getByRole("button", { name: "Fechar pesquisa" }).click();
    assert.equal(await open.getAttribute("aria-expanded"), "false");
    await open.click();
    await input.fill("economia circular");
    const submitted = await page.locator("form").evaluate((form) => ({
      action: form.getAttribute("action"),
      fields: [...new FormData(form)],
    }));
    assert.equal(submitted.action, "/pesquisa/");
    assert.deepEqual(submitted.fields, [
      ["scope", "all"],
      ["q", "economia circular"],
    ]);
    // A form in another header must retain its independent expanded state.
    await page.evaluate(() => {
      const second = document.createElement("header");
      second.className = "nomia-header-bar";
      second.innerHTML = document.querySelector("nomia-header-search").outerHTML;
      document.body.append(second);
    });
    const other = page.locator("header").nth(1);
    await other.locator("[data-search-open]").click();
    assert.equal(await page.locator("header").first().locator("form").isVisible(), true);
    await other.locator("nomia-header-search").evaluate((el) => el.remove());
    assert.equal(
      await other.evaluate((el) => el.classList.contains("nomia-header-search-open")),
      false,
    );
  }
});
