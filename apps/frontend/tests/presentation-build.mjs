import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const outputs = (result) =>
  (Array.isArray(result) ? result : [result]).flatMap((bundle) => bundle.output);

/** Compile the Site's actual production CSS for browser geometry tests. */
export async function buildPresentationCss() {
  const result = await build({
    root,
    configFile: false,
    logLevel: "error",
    plugins: [tailwindcss()],
    build: { write: false, rollupOptions: { input: `${root}/src/styles/global.css` } },
  });
  return outputs(result)
    .filter((asset) => asset.type === "asset" && asset.fileName.endsWith(".css"))
    .map((asset) => String(asset.source))
    .join("\n");
}

async function buildBrowserScript(entry, name, plugins = []) {
  const result = await build({
    root,
    configFile: false,
    logLevel: "error",
    plugins,
    build: { write: false, lib: { entry, formats: ["iife"], name } },
  });
  return outputs(result)
    .filter((asset) => asset.type === "chunk")
    .map((asset) => asset.code)
    .join("\n");
}

/** Bundle the same owning-client lifecycle entry that Layout starts. */
export function buildPresentationClient() {
  return buildBrowserScript(`${root}/src/lib/design-presentation-client.ts`, "NomiaPresentation");
}

/** Bundle the actual public consent controller used by Layout. */
export function buildConsentClient() {
  const entry = "virtual:nomia-consent-acceptance";
  return buildBrowserScript(entry, "NomiaConsent", [
    {
      name: "nomia-consent-acceptance",
      resolveId: (id) => (id.endsWith(entry) ? `\0${entry}` : undefined),
      load: (id) =>
        id === `\0${entry}`
          ? 'export { startConsent } from "@getquick/content/consent/client";'
          : undefined,
    },
  ]);
}
