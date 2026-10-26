import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getViteConfig } from "astro/config";
import { JSDOM } from "jsdom";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("..", import.meta.url));

/**
 * Creates the existing Astro app's SSR test seam.
 *
 * Vite loads the Astro dispatcher through its SSR module loader, and Astro's
 * Container API renders that dispatcher without starting a second HTTP server.
 * Callers inspect the returned jsdom document rather than comparing strings.
 */
export async function createAstroRenderHarness() {
  const config = await getViteConfig(
    {
      root: webRoot,
      logLevel: "error",
      // Route acceptance explicitly exercises the existing development reader
      // against stubbed WordPress, not a bound production publication store.
      define: { "import.meta.env.DEV": "true" },
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: "custom",
    },
    { root: webRoot, configFile: "astro.config.mjs" },
  )({ mode: "development", command: "serve" });
  const viteServer = await createServer(config);
  const { default: WpBlock } = await viteServer.ssrLoadModule(
    "/src/components/wp-blocks/WpBlock.astro",
  );
  const { default: WpBlockRenderer } = await viteServer.ssrLoadModule(
    "/src/components/wp-blocks/WpBlockRenderer.astro",
  );
  const { default: Layout } = await viteServer.ssrLoadModule("/src/layouts/Layout.astro");
  const { default: DesignPatternRegion } = await viteServer.ssrLoadModule(
    "/src/components/DesignPatternRegion.astro",
  );
  const { content } = await viteServer.ssrLoadModule("/src/lib/content.ts");
  const container = await AstroContainer.create();
  // React islands render through the same Vite module graph as the components,
  // so their serialized props are part of what callers can inspect.
  const { default: reactRenderer } = await viteServer.ssrLoadModule("@astrojs/react/server.js");
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
  let closed = false;

  return {
    async renderEntry(path) {
      if (closed) throw new Error("Astro render harness is closed");
      const { default: Entry } = await viteServer.ssrLoadModule("/src/pages/[...slug].astro");
      const response = await container.renderToResponse(Entry, {
        request: new Request(new URL(path, "https://nomia.test")),
        params: { slug: path.replace(/^\/|\/$/g, "") },
        partial: false,
      });
      return { status: response.status, html: await response.text() };
    },
    async renderPattern(pattern, context = {}) {
      if (closed) throw new Error("Astro render harness is closed");
      return container.renderToString(DesignPatternRegion, {
        props: { pattern, language: content().defaultLanguage, ...context },
      });
    },
    async renderLayout(html, theme, props = {}) {
      if (closed) throw new Error("Astro render harness is closed");
      return container.renderToString(Layout, {
        props: { chrome: null, theme, ...props },
        slots: { default: html },
      });
    },
    async render(block) {
      if (closed) throw new Error("Astro render harness is closed");

      const html = await container.renderToString(WpBlock, { props: { block } });
      const document = new JSDOM(`<main>${html}</main>`).window.document;

      return { document, html };
    },
    /** Renders one block for a visit to `url`, whose address and the page's `locals` a block may read. */
    async renderAt(url, block, locals = {}) {
      if (closed) throw new Error("Astro render harness is closed");

      const html = await container.renderToString(WpBlock, {
        props: { block },
        request: new Request(url),
        locals,
      });
      const document = new JSDOM(`<main>${html}</main>`).window.document;

      return { document, html };
    },
    /** Renders any component of the app, by its path from the app's root. */
    async renderComponent(path, props = {}) {
      if (closed) throw new Error("Astro render harness is closed");

      const { default: Component } = await viteServer.ssrLoadModule(path);
      const html = await container.renderToString(Component, { props });
      const document = new JSDOM(`<main>${html}</main>`).window.document;

      return { document, html };
    },
    async renderBlocks(blocks, props = {}) {
      if (closed) throw new Error("Astro render harness is closed");

      const html = await container.renderToString(WpBlockRenderer, {
        props: { blocks, ...props },
      });
      const document = new JSDOM(`<main>${html}</main>`).window.document;

      return { document, html };
    },
    async close() {
      if (closed) return;
      closed = true;
      await viteServer.close();
    },
  };
}
