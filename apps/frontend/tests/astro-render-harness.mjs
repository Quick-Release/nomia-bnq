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
    async renderPattern(pattern) {
      if (closed) throw new Error("Astro render harness is closed");
      return container.renderToString(DesignPatternRegion, {
        props: { pattern, language: content().defaultLanguage },
      });
    },
    async renderLayout(html, theme) {
      if (closed) throw new Error("Astro render harness is closed");
      return container.renderToString(Layout, {
        props: { chrome: null, theme },
        slots: { default: html },
      });
    },
    async render(block) {
      if (closed) throw new Error("Astro render harness is closed");

      const html = await container.renderToString(WpBlock, { props: { block } });
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
