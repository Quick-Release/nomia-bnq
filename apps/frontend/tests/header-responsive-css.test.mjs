import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";

// Chrome dependencies and the page body can discover these styles in either
// order. Test production CSS: SSR markup alone cannot catch cascade regressions.
for (const order of [
  ["nomia-blocks", "global"],
  ["global", "nomia-blocks"],
]) {
  test(`desktop navigation survives stylesheet order: ${order.join(", ")}`, async () => {
    const entry = "virtual:header-styles";
    const result = await build({
      root: fileURLToPath(new URL("..", import.meta.url)),
      configFile: false,
      logLevel: "error",
      plugins: [
        tailwindcss(),
        {
          name: "header-styles-test",
          resolveId: (id) => (id === entry ? `\0${entry}` : undefined),
          load: (id) =>
            id === `\0${entry}`
              ? order
                  .map(
                    (name) =>
                      `import ${JSON.stringify(fileURLToPath(new URL(`../src/styles/${name}.css`, import.meta.url)))};`,
                  )
                  .join("\n")
              : undefined,
        },
      ],
      build: {
        write: false,
        minify: false,
        cssMinify: false,
        rollupOptions: { input: entry },
      },
    });
    const css = result.output
      .filter((item) => item.type === "asset" && item.fileName.endsWith(".css"))
      .map((item) => String(item.source))
      .join("\n");
    assert.ok(
      /(?:width >= |min-width: ?)1400px/.test(css),
      "the navigation breakpoint must be generated",
    );
    for (const [base, responsive] of [
      ["hidden", "flex"],
      ["flex", "hidden"],
    ]) {
      const basePosition = css.lastIndexOf(`.${base} {`);
      const responsivePosition = css.lastIndexOf(`.nav\\:${responsive} {`);
      assert.ok(
        basePosition >= 0 && responsivePosition >= 0,
        "both display utilities must be generated",
      );
      assert.ok(
        basePosition < responsivePosition,
        `nav:${responsive} must override ${base} on desktop`,
      );
    }
  });
}
