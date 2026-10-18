# GETQUICK Nomia Blocks

Nomia's Gutenberg blocks (`getquick/*`), owned by this site's CMS. WordPress
loads the plugin from `apps/cms/web/app/plugins/nomia-blocks`; it is not a
Composer package. Migrated from bioeconomia.pt (release 0.63.7).

The plugin extends GQ Design (`Requires Plugins: gq-design`) and builds its
blocks the way GQ Design builds its own. Each block has a
`blocks/<id>/block.json` and an `index.js`, plus an `editor.css` when its
editor is bespoke. The editor code is plain JavaScript on WordPress's
`window.wp` globals, shipped as written with no build step. The PHP is
namespaced PSR-4 classes under `src/` (`GetQuick\NomiaBlocks\`). The blocks
use GQ Design's `getquick-design` inserter category.

The plugin owns the blocks' WordPress side: their registration, editors and
previews, and the `wpBlocksJson` GraphQL field. Blocks save only their
attributes (`save` returns `null`), and the Astro Frontend renders them: a
refresh stores a page's parsed blocks with it, and visitors are served the
Nomia block components' rendering from the publication store
(`apps/frontend/src/components/wp-blocks`, `apps/frontend/src/lib/nomia-content.ts`).

## Layout

| Path                            | What it is                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `getquick-nomia-blocks.php`     | Plugin header, constants and the PSR-4 autoloader; boots `Plugin` on `plugins_loaded`.                    |
| `src/Plugin.php`                | Wires the components below.                                                                               |
| `src/Blocks/ContractBlocks.php` | Registers every block from its folder, with its own editor script and translations (`init`, priority 20). |
| `src/Blocks/EditorAssets.php`   | The shared editor scripts and style, and the settings and contracts they read.                            |
| `src/Blocks/BlockPolicy.php`    | The post editor's block allowlist.                                                                        |
| `src/Editor/PageBackground.php` | The page background color meta and its GraphQL field.                                                     |
| `src/GraphQL/BlocksJson.php`    | `wpBlocksJson` on pages and posts.                                                                        |
| `assets/editor-lib.js`          | Pure helpers (`window.getquickNomiaBlocksLib`).                                                           |
| `assets/editor.js`              | Fields, the Frontend preview, and the generic contract editor (`window.getquickNomiaBlocksEditor`).       |
| `assets/document-settings.js`   | The page background panel and the Bioeconomia button variation.                                           |
| `assets/frontend-rules.js`      | The Frontend rules the editor shares with Astro (`window.getquickNomiaFrontendRules`), generated.         |
| `blocks/<id>/`                  | `block.json` (generated), `index.js`, and `editor.css` for bespoke editors.                               |

## Where the blocks are defined

Each block's registration lives in the Frontend, in
`apps/frontend/src/structured-blocks/registrations/<catalogId>.ts`: its
attributes, editor metadata, renderer and documentation. The generator writes
the plugin's side from them:

- `blocks/<catalogId>/block.json` and `blocks/blocks-manifest.php`
- `src/Contracts.php`
- `blocks/<catalogId>/index.js`, for a block whose registration isn't
  `bespoke`: it registers the generic contract editor
- `assets/frontend-rules.js`, bundled from
  `apps/frontend/src/lib/editor-rules.ts`, which is how the canvas and the
  site agree on rules such as hero typography

A `bespoke` block's `index.js` is written by hand. It registers its editor with
`registerContractBlock( name, { edit, deprecated } )`.

```sh
cd apps/frontend
pnpm structured-blocks:sync    # after changing a registration or editor-rules.ts
pnpm structured-blocks:check   # fails on drift (part of pnpm check)
```

Never hand-edit the generated files. A CMS release ships only tracked files,
so they are committed.

## Editor scripts

Write them the way GQ Design writes its own. Each script is a self-invoking
function. It reads what it needs from `window.wp.*` and from the plugin's
`window.getquickNomia*` globals, builds elements with `createElement`, and
uses no `import`s or JSX. After any change, run `vp fmt` on the plugin.
`scripts/nomia-blocks-scripts.test.mjs` (run by `pnpm test:scripts`) loads every
script the way WordPress does, against stub packages. It also fails on
undefined names, lint warnings and formatting drift.

## Editor previews

Blocks with the `preview` experience show the Frontend's rendering of their
attributes in an iframe: `<GETQUICK_NOMIA_FE_URL>/wp-block-preview`.
`config/application.php` sets `GETQUICK_NOMIA_FE_URL` from
`GETQUICK_FRONTEND_URL` (`https://nomia.bnq.pt` in production, the Astro dev
server locally). This site sets no preview token, so the preview is open, as
on bioeconomia.pt.

## Colors

Every color control (the page background, the Section block, the page heroes'
text and column colors) offers the site's palette as the editor has it. That
palette is GQ Design's colors (GETQUICK → Design → Branding → Colors), read
through `useSiteColors()` in `assets/editor.js`. The editor styles name
palette colors by their preset variables (`--wp--preset--color--<slug>`).
`apps/cms/scripts/nomia-palette.php` applies Nomia's palette to a CMS once.

## The editor allowlist

On posts and pages the inserter offers three kinds of block:

- core blocks that render without WordPress's stylesheets;
- Nomia's blocks;
- GETQUICK Design's blocks (`getquick-design/*`, read from the block registry).

## Translations

Source strings are Portuguese, the language the CMS is edited in.
`languages/` carries the catalogs for other locales (English); the site runs
`pt_PT_ao90`. The catalogs are compiled and tracked, and each editor script has
its own JSON catalog. Regenerate them with WP-CLI, for example through the
`wordpress:cli` image:

```sh
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD":/plugin -w /plugin wordpress:cli-php8.4 sh -c '
  wp i18n make-pot . languages/getquick-nomia-blocks.pot --domain=getquick-nomia-blocks --exclude=tests,vendor,node_modules,assets/frontend-rules.js --skip-audit &&
  wp i18n update-po languages/getquick-nomia-blocks.pot languages/getquick-nomia-blocks-en_US.po &&
  wp i18n make-mo languages/getquick-nomia-blocks-en_US.po languages &&
  wp i18n make-php languages/getquick-nomia-blocks-en_US.po languages &&
  rm -f languages/*.json && wp i18n make-json languages/getquick-nomia-blocks-en_US.po languages --no-purge'
```

`tests/TranslationsTest.php` fails in two cases:

- a block title is missing from the English catalog;
- an editor script with translated strings has no JSON catalog.

## Tests and standards

`composer test` in `apps/cms` runs this plugin's suite (`tests/`, against
WordPress stubs) with the CMS's Pest. `composer lint` applies the WordPress
Coding Standards to its PHP (`apps/cms/phpcs.xml.dist`), with GQ Design's
exceptions: short arrays, and camelCase methods and PascalCase files in `src/`.
Generated files are out of scope. The Frontend's block tests are in
`apps/frontend/tests` (`pnpm --dir apps/frontend test:blocks`).

## Requirements

WordPress 7.0 or later (as GQ Design), PHP 8.4, GQ Design, WPGraphQL. Every
block uses Block API v3.
