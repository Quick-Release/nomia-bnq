import assert from "node:assert/strict";
import { globSync, readFileSync } from "node:fs";
import test from "node:test";

// Nomia's colors are GQ Design's palette (GETQUICK → Design → Branding →
// Colors), applied to the CMS from apps/cms/scripts/nomia-palette.json.
// Styles name them only through WordPress's preset variables.
const palette = JSON.parse(
  readFileSync(new URL("../../cms/scripts/nomia-palette.json", import.meta.url), "utf8"),
);
const slugs = new Set([...Object.keys(palette.theme), ...palette.colors.map(({ slug }) => slug)]);
const plugin = new URL("../../cms/web/app/plugins/nomia-blocks/", import.meta.url).pathname;
const read = (path) => readFileSync(path, "utf8");

test("the palette lists each color once, as a six-digit hex color", () => {
  assert.equal(slugs.size, Object.keys(palette.theme).length + palette.colors.length);
  for (const { slug, name, color } of palette.colors) {
    assert.match(slug, /^[a-z0-9][a-z0-9-]*$/);
    assert.ok(name, slug);
    assert.match(color, /^#[0-9a-f]{6}$/, slug);
  }
});

test("Nomia's design tokens are the palette's preset variables, with no colors of their own", () => {
  const css = read(new URL("../src/styles/nomia-theme.css", import.meta.url));
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
  for (const [, slug] of css.matchAll(/--wp--preset--color--([a-z0-9-]+)/g)) {
    assert.ok(slugs.has(slug), `nomia-theme.css: ${slug} is not in the palette`);
  }
});

test("every preset color the Frontend and the editor styles name is in the palette", () => {
  const files = [
    ...globSync("src/**/*.{css,astro,ts,tsx}", {
      cwd: new URL("..", import.meta.url).pathname,
      // Tests describe other palettes (the stub CMS's).
      exclude: (file) => /\.test\.ts$/.test(file),
    }).map((file) => new URL(`../${file}`, import.meta.url).pathname),
    ...globSync("{assets,blocks}/**/*.{css,js}", { cwd: plugin }).map((file) => `${plugin}${file}`),
  ];
  for (const file of files) {
    for (const [, slug] of read(file).matchAll(/--wp--preset--color--([a-z0-9-]+)/g)) {
      // `${slug}` templates build the variable from a stored slug.
      if (slug.endsWith("-")) continue;
      assert.ok(slugs.has(slug), `${file}: ${slug} is not in the palette`);
    }
  }
});
