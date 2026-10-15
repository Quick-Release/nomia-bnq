# Getquick Nomia Blocks

Nomia's Gutenberg blocks (`getquick/*`), owned by this site's CMS. WordPress
loads the plugin from `apps/cms/web/app/plugins/nomia-blocks`; it is not a
Composer package. Migrated from bioeconomia.pt (release 0.63.7).

The plugin owns the blocks' WordPress side: their registration, editors and
previews, and the `wpBlocksJson` GraphQL field. Blocks save only their
attributes (`save` returns `null`), and the Astro Frontend renders them: a
refresh stores a page's parsed blocks with it, and visitors are served the
Nomia block components' rendering from the publication store
(`apps/frontend/src/components/wp-blocks`, `apps/frontend/src/lib/nomia-content.ts`).

## Where the blocks are defined

Each block's registration lives in the Frontend,
`apps/frontend/src/structured-blocks/registrations/<catalogId>.ts`: its
attributes, editor metadata, renderer and documentation. The generator writes
the plugin's side from them:

- `src/editors/index.jsx`, `src/contracts.json`, `includes/contracts.php`
- `blocks/<catalogId>/block.json` and `blocks/blocks-manifest.php`

```sh
cd apps/frontend
pnpm structured-blocks:sync    # after changing a registration
pnpm structured-blocks:check   # fails on drift (part of pnpm check and pnpm verify)
```

Never hand-edit those files. A CMS release ships only tracked files, so they
are committed, unlike on bioeconomia.pt.

## The editor build

The editor bundle in `build/` is committed for the same reason. Build it after
changing anything under `src/` (its prebuild checks the generated files are
current):

```sh
pnpm --dir apps/cms/web/app/plugins/nomia-blocks build
pnpm --dir apps/cms/web/app/plugins/nomia-blocks start   # watch
```

`scripts/nomia-blocks-build.test.mjs` (run by `pnpm verify`) rebuilds it and
fails when `build/` is stale. Some editor modules import the Frontend's
shared rules through the `@nomia/web-src` webpack alias
(`apps/frontend/src`), so the canvas and the site agree on them.

## Editor previews

Blocks with the `preview` experience show the Frontend's rendering of their
attributes in an iframe: `<GETQUICK_NOMIA_FE_URL>/wp-block-preview`.
`config/application.php` sets `GETQUICK_NOMIA_FE_URL` from
`GETQUICK_FRONTEND_URL` (`https://nomia.bnq.pt` in production, the Astro dev
server locally). To require a token, set `NOMIA_WP_BLOCK_PREVIEW_TOKEN` when
the Frontend is built and the matching `GETQUICK_NOMIA_BLOCK_PREVIEW_TOKEN`
in WordPress; without one the preview is open, as on bioeconomia.pt.

## The editor allowlist

On posts and pages the inserter offers core blocks that render without
WordPress's stylesheets, Nomia's blocks, and GETQUICK Design's
(`getquick-design/*`, read from the block registry).

## Translations

Source strings are Portuguese, the language the CMS is edited in.
`languages/` carries the catalogs for other locales (English); the site runs
`pt_PT_ao90`. The catalogs are compiled and tracked. `tests/TranslationsTest.php`
fails when a block title is missing from the English catalog.

## Tests and standards

`composer test` in `apps/cms` runs this plugin's suite (`tests/`, against
WordPress stubs) with the CMS's Pest, and `composer lint` applies the
WordPress Coding Standards to its PHP (`apps/cms/phpcs.xml.dist`); generated
files and the build are out of scope. The Frontend's block tests are in
`apps/frontend/tests` (`pnpm --dir apps/frontend test:blocks`).

## Requirements

WordPress 6.7 or later (`wp_register_block_metadata_collection()`), PHP 8.4,
WPGraphQL. Every block uses Block API v3.
