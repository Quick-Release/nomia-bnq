# Light and dark themes that follow the reader's system setting

Question: what would it take for the Frontend to have a light theme and a
dark theme, using the reader's own system or browser setting unless they pick
one?

## Short answer

1. **Following the system setting needs no JavaScript.** Declare that the
   page supports both schemes (`<meta name="color-scheme" content="light dark">`
   plus `color-scheme: light dark` on `:root`). Then give every colour token a
   dark value through `@media (prefers-color-scheme: dark)` or `light-dark()`.
   The browser then picks a scheme from the OS/browser setting, and also
   switches its own form controls, scrollbars and canvas
   ([MDN color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme),
   [MDN prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)).
2. **A manual override (a System / Light / Dark control) adds:** a small
   blocking inline script in `<head>` that applies a stored choice before first
   paint, a `localStorage` key for the choice, and a selector-based Tailwind
   `dark` variant in place of the media-query one
   ([Tailwind dark mode](https://tailwindcss.com/docs/dark-mode)).
3. **The real work is the colours, not the switch.** Today the Frontend has a
   single palette. Nomia's blocks name absolute palette steps
   (`text-main-cinza-700`, `bg-neutral-bw-white`) instead of semantic roles.
   GQ Design stores and serves one value per palette slug, and editors pick
   section colours as fixed hex values in WordPress. A dark theme needs a dark
   palette from design and a semantic token layer, and has to decide what
   happens to colours editors chose.
4. **Most of the plumbing is not this repository's to change.**
   `Layout.astro` and `global.css` are the blueprint's, and the site
   deliberately keeps them identical to it. The palette lives in GQ Design. See
   [Ownership](#ownership) below.

## Current state of this repository

- **Stack:** Astro 7 with server output, React islands, Tailwind CSS 4 through
  `@tailwindcss/vite` (`apps/frontend/package.json`,
  `apps/frontend/astro.config.mjs`). WordPress is headless. Readers never see
  WordPress-rendered pages, so theme.json and the block theme
  (`apps/cms/web/app/themes/getquick-theme`) are out of scope for the reader
  experience.
- **No colour-scheme code anywhere.** There is no `prefers-color-scheme`, no
  `color-scheme` and no `light-dark()` in `apps/frontend/src`, and no
  `<meta name="color-scheme">` in the Layout. The only trace is
  `apps/frontend/src/components/ui/chart.tsx:8`
  (`const THEMES = { light: "", dark: ".dark" }`). That is the shadcn/ui chart
  wrapper, which can already emit per-theme series colours under a `.dark`
  ancestor class if a chart config uses `theme: { light, dark }`. No chart
  config uses it today.
- **`apps/frontend/src/layouts/Layout.astro`** is the blueprint's Layout with
  only the project name filled in. It matches
  `gq-site/blueprint/templates/apps/frontend/src/layouts/Layout.astro` except
  for `{{Project}}` → `Nomia`. It has no inline head script and no
  `ClientRouter`, so there are no view transitions (no `ClientRouter` /
  `transition:` usage under `apps/frontend/src`).
- **`apps/frontend/src/styles/global.css`** is byte-identical to the
  blueprint's `global.css`. It defines one light set of tokens in `@theme`
  (`--color-ink: #1c1b18`, `--color-paper: #ffffff`, `--color-accent: #2563eb`)
  and applies them on `:root`. It also hardcodes a few colours
  (`.prose-wp { color: #45423c }`, Video Hero `#fff` on `#000`).
- **Nomia's block styles** are site-owned:
  `apps/frontend/src/styles/nomia-blocks.css` →
  `apps/frontend/src/styles/nomia-theme.css`, loaded by
  `apps/frontend/src/components/NomiaBlocks.astro`. `nomia-theme.css` maps
  Figma tokens such as `--main-cinza-700` and `--monochrome-dark-100` onto
  WordPress preset variables (`--wp--preset--color--<slug>`).
  `NomiaBlocks.astro` writes those variables onto `:root` from GQ Design's
  `designTokens.colors` (`presetRootStyle` in
  `apps/frontend/src/lib/wp-block-styles.ts`). Every slug gets a single value.
- **Components use absolute palette steps, not roles.** Counting class usage
  in `apps/frontend/src/components`: `text-main-cinza-700` ×87,
  `bg-neutral-bw-white` ×29, `text-neutral-bw-white` ×18,
  `bg-main-cinza-700` ×16, and so on. A few colours are hardcoded:
  `home-intro.astro` (`bg-[#f5f5f5]`), `pageHeroMediaGridShared.ts` (white /
  `#f2a900` defaults), and `ImageZoomBlock.astro` and
  `NomiaContactMapBlock.astro` (hex fallbacks).
- **Editors choose colours in WordPress.** The page surface ("Fundo da
  página") and several Nomia block attributes (`backgroundColor`,
  `firstBackgroundColor`, `titleTextColor`, … in
  `apps/cms/web/app/plugins/nomia-blocks/blocks/*/block.json`) store fixed hex
  values. `NomiaBlocks.astro` picks black or white text for the page surface
  by WCAG luminance (`apps/frontend/src/lib/color-contrast.ts`). The
  `nomia-blocks` editor mirrors this logic (`src/lib/colors.jsx`). GQ Design
  blocks use `has-<slug>-background-color` classes, which resolve through the
  preset variables above.
- **The palette has no dark variant.** GQ Design exposes
  `designTokens.colors` as `{ slug, name, color, cssVariable }`, one colour
  per slug (`/data/code/getquick/wp-plugins/gq-design/src/GraphQL/DesignTokens.php`).
  Nomia's seed palette (`apps/cms/scripts/nomia-palette.json`) has light theme
  roles only: `background: #ffffff`, `foreground: #444444`,
  `accent: #209e97`, `muted: #777777`.
- **No convention to reuse upstream.** There is no `prefers-color-scheme` or
  `color-scheme` usage in the local clones of `gq-site`, `gq-platform` or
  `wp-plugins/gq-design`.
- **Caching:** pages are server-rendered per request with
  `Cache-Control: no-cache` (`apps/frontend/src/pages/index.astro:19`,
  `apps/frontend/src/pages/[...slug].astro:35`). This matters only for the
  cookie option below.

### Ownership

The ownership manifest
(`node_modules/@getquick/site/blueprint/ownership.json`) lists both
`apps/frontend/src/layouts/Layout.astro` and
`apps/frontend/src/styles/global.css` as **create-once**. `gq sync` won't
overwrite them, so technically the site may edit them. But commit `2284309`
("keep the blueprint's Layout and global.css") made "the Frontend's theme is
gq-site's" a deliberate site rule, and both files still match the blueprint.
Under that rule:

| Change                                                                                                                                                                                       | Owner                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color-scheme` meta, the pre-paint script, the theme control in the header, dark values for the base tokens in `global.css`, the Tailwind `dark` variant                                     | **Quick-Release/gq-site** (`/data/code/getquick/gq-site`, `blueprint/templates/apps/frontend/...`). This site then takes it with `gq sync --recreate <path>` (create-once files are never rewritten otherwise). |
| A dark value per palette colour (or dark theme roles), the editor UI for it, and exposing it in `designTokens`                                                                               | **Quick-Release/gq-design** (`/data/code/getquick/wp-plugins/gq-design`)                                                                                                                                        |
| Whether GETQUICK Sites support colour schemes at all, and how (CSS variables, `data-theme`, storage key name)                                                                                | **Quick-Release/gq-platform** (cross-repository decision)                                                                                                                                                       |
| Dark values and semantic roles for Nomia's block tokens (`nomia-theme.css`), replacing hardcoded hex in Nomia components, chart series colours, dark-surface handling in `NomiaBlocks.astro` | **this repository**                                                                                                                                                                                             |

The project memory note "migrate to standards — no new features" also
applies. A dark theme is a new feature, so it should come through the
gq-site/gq-design standard rather than as a Nomia-only exception.

## Recommended approach

### The mechanism (primary-source basis)

- **`prefers-color-scheme`** has two values, `light` and `dark`. The setting
  "might be a system-wide setting exposed by the Operating System, or a
  setting controlled by the user agent". `no-preference` was removed:
  browsers treat no preference as `light`
  ([Media Queries 5 §12.5](https://drafts.csswg.org/mediaqueries-5/#prefers-color-scheme)).
  It has been Baseline widely available since January 2020
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)).
- **`color-scheme`** controls only what the browser draws: the canvas, the
  scrollbars, form controls, system colours and `light-dark()`. It does not
  style your own elements. `only` stops the browser from overriding the scheme
  (for example Chrome's Auto Dark Theme)
  ([CSS Color Adjust 1 §2.2–2.4](https://drafts.csswg.org/css-color-adjust-1/#color-scheme-prop),
  [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)).
  Baseline since January 2022.
- **`<meta name="color-scheme">`** sets the page's supported schemes. It lets
  the browser render the background in the right scheme "immediately (rather
  than waiting for all CSS in the page to load)". A document should have only
  one
  ([HTML §4.2.5.1](https://html.spec.whatwg.org/multipage/semantics.html#meta-color-scheme)).
  MDN recommends putting it in `<head>` before any CSS
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)).
- **`light-dark(a, b)`** returns `a` or `b` depending on the element's used
  scheme. It works only where `color-scheme` allows both (`light dark`). It
  accepts colours, and in current browsers images too. It follows a
  `color-scheme` forced on an element, which is what makes a manual override
  cheap
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)).
  Baseline 2024 (newly available since May 2024), so older browsers fall back
  to whatever is declared before it.
- **Tailwind 4:** `dark:` uses `prefers-color-scheme` by default. For a manual
  toggle, override it with
  `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`
  (or the `.dark` class form). Tailwind's suggested three-way logic stores
  `localStorage.theme` as `"light"` / `"dark"` and removes the key for
  "system", run "inline in `head` to avoid FOUC"
  ([Tailwind dark mode](https://tailwindcss.com/docs/dark-mode)).
- **Astro:** a `<script is:inline>` is left as-is, "not processed, optimized,
  or bundled", and output "exactly where it is authored"
  ([Astro directives](https://docs.astro.build/en/reference/directives-reference/)).
  That is what a blocking pre-paint script needs. A bundled `<script>` is a
  deferred module and would run after first paint. If the site ever adopts
  `ClientRouter`, re-apply the theme on `astro:after-swap`, "the latest point
  where it's still safe to add something like a dark mode class"
  ([Astro view transitions](https://docs.astro.build/en/guides/view-transitions/)).
  The site has no `ClientRouter` today.
- **Cross-tab sync:** the `storage` event fires in other same-origin tabs when
  `localStorage` changes, but not in the tab that made the change
  ([MDN storage event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)).
- **Live system changes:** with the CSS-only design (tokens keyed on
  `prefers-color-scheme` / `light-dark()`), a change to the OS setting
  restyles the page with no listener. A `matchMedia('(prefers-color-scheme:
dark)')` `change` listener is needed only for JS that must react, such as
  chart canvases or the MapLibre style
  ([MDN MediaQueryList change](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event)).

### Proposed design (for gq-site to adopt)

Store only explicit choices. "System" means no stored value, so the default is
the reader's setting.

```html
<!-- Layout <head>, before any stylesheet -->
<meta name="color-scheme" content="light dark" />
<script is:inline>
  try {
    const t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
  } catch {}
</script>
```

```css
:root {
  color-scheme: light dark;
}
:root[data-theme="light"] {
  color-scheme: light;
}
:root[data-theme="dark"] {
  color-scheme: dark;
}

@theme {
  --color-paper: light-dark(#ffffff, #121212); /* dark values from design */
  --color-ink: light-dark(#1c1b18, #ececec);
}
@custom-variant dark {
  &:where([data-theme="dark"], [data-theme="dark"] *) {
    @slot;
  }
  @media (prefers-color-scheme: dark) {
    &:where(:root:not([data-theme="light"]), :root:not([data-theme="light"]) *) {
      @slot;
    }
  }
}
```

This is a sketch, not tested here. It is arranged so that:

- With no stored choice, both `light-dark()` and `dark:` follow the system
  setting. Without JavaScript the page still follows the system setting.
- A stored choice forces `color-scheme` on the root. `light-dark()` and native
  controls follow it, and the `dark` variant covers utility classes.

The control should be a three-option group (System / Light / Dark). Native
`<input type="radio">` elements in a `<fieldset>` with a `<legend>` give the
radio-group semantics and keyboard behaviour the WAI-ARIA APG describes
(arrow keys move and check, Tab enters and leaves the group) without custom
ARIA ([APG radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/),
[Using ARIA, rule 1](https://www.w3.org/TR/using-aria/#rule1)). On change: set
or remove `localStorage.theme`, then set or delete `data-theme`. Also listen
for `storage` so other open tabs follow.

### Checklist

**Upstream: Quick-Release/gq-site** (start a session in a worktree of
`/data/code/getquick/gq-site`)

- [ ] Layout template: add `<meta name="color-scheme" content="light dark">`
      and the inline pre-paint script before any CSS.
- [ ] Layout template: add a System/Light/Dark control to the site header,
      with labels from `lib/copy.ts` for each language.
- [ ] `global.css` template: `color-scheme` on `:root` and on the
      `data-theme` overrides, dark values for `--color-ink`, `--color-paper`,
      `--color-accent`, the `.prose-wp` text colour and `::selection`, and the
      `@custom-variant dark`.
- [ ] Map GQ Design's dark tokens (once they exist) onto these variables,
      the same way the light ones arrive today.
- [ ] Then, here: `gq sync --recreate apps/frontend/src/layouts/Layout.astro`
      and `gq sync --recreate apps/frontend/src/styles/global.css` after
      bumping the `@getquick/site` pin.

**Upstream: Quick-Release/gq-design** (`/data/code/getquick/wp-plugins/gq-design`)

- [ ] Let a palette carry a dark value per colour, or at least dark theme
      roles (background / foreground / accent / muted), edited on
      GETQUICK → Design → Branding → Colors.
- [ ] Expose it in `designTokens` (for example a `dark` value on
      `DesignColor`). The frontend can then emit
      `--wp--preset--color--<slug>: light-dark(<light>, <dark>)`.

**Upstream: Quick-Release/gq-platform** (optional)

- [ ] Record the cross-site decision as an ADR: whether Sites support colour
      schemes, the `data-theme` attribute and `theme` storage key, and
      localStorage versus a cookie.

**Site-owned: this repository** (after the above, or alongside it once the
upstream contract is agreed)

- [ ] Add a semantic layer to `nomia-theme.css`: roles such as
      `--surface`, `--surface-alt`, `--text`, `--text-muted`, `--border`,
      `--accent`, each defined with `light-dark()`. Move components from
      absolute steps (`text-main-cinza-700`, `bg-neutral-bw-white`) to roles.
      The alternative, re-pointing `--main-cinza-*` to inverted values in
      dark mode, keeps the class names but makes every step's name lie.
- [ ] Replace hardcoded colours: `home-intro.astro` `bg-[#f5f5f5]`, the
      `pageHeroMediaGridShared.ts` defaults, and the hex fallbacks in
      `ImageZoomBlock.astro` and `NomiaContactMapBlock.astro`.
- [ ] Decide how editor-chosen hex colours (page surface, block colour
      attributes) behave in dark mode: keep them as authored (a light section
      stays light) and give those sections `color-scheme: only light` so text
      and controls inside stay consistent, or add dark alternates per block. The
      luminance-based text pick in `NomiaBlocks.astro` /
      `lib/color-contrast.ts` would then need the dark default surface, not
      white, as its fallback.
- [ ] Charts: use the `theme: { light, dark }` form already supported by
      `components/ui/chart.tsx`. That form keys off a `.dark` ancestor, so
      either set it alongside `data-theme` or change `THEMES.dark` to the
      `data-theme` selector. Also re-read colours on a `matchMedia` /
      `storage` change for anything drawn to canvas
      (`components/charts/bar/ResourceProductivityChart.astro` has its own
      inline script), and pick a dark MapLibre style for the map islands.
- [ ] Images and logos: `<picture><source media="(prefers-color-scheme:
    dark)">` swaps by the **system** setting
      ([MDN picture](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture)).
      My inference from how media conditions work: a manual override on
      `<html>` does not change which `<source>` is chosen. So with a toggle,
      prefer `currentColor` SVGs, `light-dark()` on CSS background images, or
      CSS that shows and hides two images keyed to the theme. The CMS logo is
      a single image today (`siteLogo` in the Layout), so a dark logo would
      also need a GQ Design/WordPress field (upstream).
- [ ] Check contrast in both themes: text 4.5:1 (3:1 for large text), and UI
      component and graphical-object boundaries 3:1
      ([WCAG 2.2 SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
      [SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).
      Nomia's accent `#209e97` is tuned for white backgrounds. Its contrast on
      the chosen dark surface needs checking separately.

## Tradeoffs considered

- **CSS-only (follow the system, no control) vs a control.** CSS-only is
  smaller (meta + `color-scheme` + dark token values), has no flash and no
  script, and fully "respects the user's choice", since the choice is made in
  the OS or browser. `<picture media>` swaps also work exactly. A control adds
  the inline script, storage and the issues with images and charts above, but
  helps readers who want a different scheme for this site only. Building
  CSS-only first loses nothing: the control layers on top without reworking
  the tokens.
- **`light-dark()` vs `@media (prefers-color-scheme)` blocks.** `light-dark()`
  keeps both values on one line and follows a forced `color-scheme`
  automatically, so the override needs no duplicated rules. But it is
  Baseline only since May 2024, and older browsers drop the declaration.
  Media-query blocks work everywhere, but the override then needs a second
  copy of every dark rule under `[data-theme=dark]`.
- **localStorage vs cookie with server rendering.** localStorage is what
  Tailwind and Astro document. It never reaches the server and needs the
  blocking inline script. A cookie read in Astro (`Astro.cookies`) could
  render `data-theme` on the server with no script. Pages are already
  rendered per request with `no-cache`, so this is possible. But the choice
  would then affect the response, so any shared cache would need
  `Vary: Cookie` or to bypass themed responses. It would also put
  theme logic into the blueprint's page/Layout path. For a stored
  "System" (the default) the cookie gains nothing over CSS. Recommendation:
  localStorage, with "System" meaning no stored value.
- **`data-theme` attribute vs `.dark` class.** Both are documented by
  Tailwind. `data-theme` can carry `light` explicitly, which a light override
  needs so `light-dark()` doesn't follow a dark OS. `chart.tsx` currently
  expects `.dark`.

## Open questions for the user

1. Does the Nomia design (Figma "Nomia — Website 2") have a dark palette, or
   at least dark surfaces and text roles? Without one, there is nothing to
   build yet.
2. Is a visible System/Light/Dark control wanted, or is following the system
   setting enough?
3. Should this be a GETQUICK-wide capability (gq-site + gq-design, decided in
   gq-platform), or is a Nomia-only theme acceptable despite the
   "standards only" rule?
4. How should colours editors chose in WordPress behave in dark mode: keep
   them as authored, or provide dark alternates?
5. Is a dark-mode logo needed (white-on-dark version of the Nomia logo)?

## Sources

- Media Queries Level 5, §12.5 `prefers-color-scheme`:
  https://drafts.csswg.org/mediaqueries-5/#prefers-color-scheme
- CSS Color Adjustment Level 1, `color-scheme`:
  https://drafts.csswg.org/css-color-adjust-1/#color-scheme-prop
- HTML Standard, `<meta name="color-scheme">`:
  https://html.spec.whatwg.org/multipage/semantics.html#meta-color-scheme
- MDN `color-scheme`: https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
- MDN `light-dark()`: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark
- MDN `prefers-color-scheme`: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
- MDN `storage` event: https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
- MDN `MediaQueryList` `change`: https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event
- MDN `<picture>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture
- Tailwind CSS, dark mode (v4): https://tailwindcss.com/docs/dark-mode
- Astro, template directives (`is:inline`): https://docs.astro.build/en/reference/directives-reference/
- Astro, view transitions (`astro:after-swap`): https://docs.astro.build/en/guides/view-transitions/
- WAI-ARIA APG, radio group: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
- Using ARIA, first rule: https://www.w3.org/TR/using-aria/#rule1
- WCAG 2.2 Understanding 1.4.3 / 1.4.11:
  https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html,
  https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- Repository evidence: `apps/frontend/src/layouts/Layout.astro`,
  `apps/frontend/src/styles/global.css`, `apps/frontend/src/styles/nomia-theme.css`,
  `apps/frontend/src/components/NomiaBlocks.astro`,
  `apps/frontend/src/lib/wp-block-styles.ts`, `apps/frontend/src/lib/color-contrast.ts`,
  `apps/frontend/src/components/ui/chart.tsx`, `apps/cms/scripts/nomia-palette.json`,
  `node_modules/@getquick/site/blueprint/ownership.json`, commit `2284309`,
  `/data/code/getquick/gq-site/blueprint/templates/apps/frontend/src/`,
  `/data/code/getquick/wp-plugins/gq-design/src/GraphQL/DesignTokens.php`.
