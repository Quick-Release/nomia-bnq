import { expect, test } from "vite-plus/test";
import { blockPresetStyles, presetRootStyle } from "./wp-block-styles";

test("exposes CMS spacing and colors to saved WordPress block classes", () => {
  const { vars, colorRules } = blockPresetStyles(
    [{ slug: "md", size: "2rem" }],
    [{ slug: "accent", color: "#2563eb" }],
  );

  expect(vars).toEqual({
    "--wp--preset--spacing--md": "2rem",
    "--wp--preset--color--accent": "#2563eb",
  });
  expect(colorRules).toContain(
    ".prose-wp .has-accent-color{color:var(--wp--preset--color--accent)}",
  );
  expect(colorRules).toContain(
    ".prose-wp .has-accent-background-color{background-color:var(--wp--preset--color--accent)}",
  );
  expect(colorRules).toContain(
    ".prose-wp .has-accent-color.has-link-color a{color:var(--wp--preset--color--accent)}",
  );
});

test("rejects unsafe token slugs before building CSS selectors", () => {
  const styles = blockPresetStyles([], [{ slug: "a}body{display:none", color: "red" }]);
  expect(styles).toEqual({ vars: {}, colorRules: "" });
});

test("GQ Design's presets are WordPress's preset variables on :root, without unsafe values", () => {
  expect(
    presetRootStyle(
      [{ slug: "50", size: "1.5rem" }],
      [
        { slug: "ciano-500", color: "#209e97" },
        { slug: "accent", color: "rgb(32, 158, 151)" },
        { slug: "bad slug", color: "#000000" },
        { slug: "evil", color: "red;}</style><script>" },
      ],
    ),
  ).toBe(
    ":root{--wp--preset--spacing--50:1.5rem;--wp--preset--color--ciano-500:#209e97;--wp--preset--color--accent:rgb(32, 158, 151)}",
  );
  expect(presetRootStyle([], [])).toBe("");
});

test("preset classes can be scoped to Nomia's blocks", () => {
  const { colorRules } = blockPresetStyles(
    [],
    [{ slug: "ciano-500", color: "#209e97" }],
    ".nomia-blocks",
  );
  expect(colorRules).toContain(
    ".nomia-blocks .has-ciano-500-color{color:var(--wp--preset--color--ciano-500)}",
  );
  expect(colorRules).not.toContain(".prose-wp");
});
