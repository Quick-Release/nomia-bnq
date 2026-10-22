# Nomia Frontend

Astro, server-rendered on Cloudflare Workers, reading published content from
the CMS (`../cms`) through WPGraphQL. Its Worker is declared in
`../../infra/frontend.run.ts` and deployed by Alchemy, not Wrangler.

## Development

From the workspace root:

```sh
pnpm install
cp apps/frontend/.env.example apps/frontend/.env   # or: pnpm setup
pnpm dev
```

`PUBLIC_WORDPRESS_GRAPHQL_URL` in `.env` points at the CMS's GraphQL endpoint
(`https://nomia-bnq-admin.ddev.site/wp/graphql` with `pnpm cms:dev`). With no
CMS running, `pnpm dev` renders a placeholder front page, so the Frontend can be
built before the CMS exists.

## The content runtime

Delivery is `@getquick/content`'s, pinned in `package.json` together with the
CMS's `getquick/gq-content` plugin; `gq sync` keeps both pins at one version.
The package's README documents its configuration and exports. This app
configures it and composes the pages:

- `src/lib/content.ts` (this Site's) makes the runtime for each request from
  `gq.ops.json` (the Site's identity, `project`, and its languages), the build
  environment (`PUBLIC_WORDPRESS_GRAPHQL_URL`) and the Worker's bindings.
  Only `pnpm dev` reads the CMS live without a store.
- `src/pages/gq/events.ts` and `src/pages/gq/refresh.ts` are managed by
  `gq sync`: they hand the CMS's signed events and the trusted refresh
  (`pnpm frontend:refresh`) to the runtime. `/gq/` is reserved for them and
  for the Site's own: `/gq/consent` (the consent Runtime's records and the
  CMS's reads) and `/gq/map/` (the map-list explorer's proxied tiles); see
  [ADR 0001](../../docs/adr/0001-adopt-consent-and-legal-pages.md).
- `src/pages/index.astro`, `src/pages/[...slug].astro`,
  `src/components/Home.astro` and `src/layouts/Layout.astro` render what the
  runtime delivers, with the status it answers: 200, 404 when WordPress
  confirms nothing is published there, 503 when the CMS or the store fails,
  and a 301 for a moved entry. Pages answer with `Cache-Control: no-cache`;
  don't put a cache in front of the store that could outlive a withdrawal.

## Durable published content

The deployed Frontend serves the front page, the entries (published pages and
posts) and the site chrome (menu, logo, icon, site identity, design presets)
from its publication store, a D1 database bound as `PUBLICATION_DB`
(`../../infra/frontend.run.ts`). The store's migrations ship in
`@getquick/content` (`@getquick/content/migrations`), and the deploy applies
them: installing the package is what gives the Frontend a store. Pages are
a 503 until `pnpm frontend:refresh` has stored the front page and the chrome.
The CMS keeps the store current with signed events, retries them on the
server's cron (`pnpm ploi:events` installs it) and reconciles every minute.

## Languages

A bilingual Site lists its other languages in `gq.ops.json`
(`wordpress.languages`, beside the default `wordpress.locale`), and its CMS
runs Polylang with GQ Polylang for WPGraphQL. `src/lib/content.ts` gives them
to the runtime when the Frontend is built. A route's language is its first
segment when that is another language's slug (`/en/about/` is English), and
the default language otherwise; `/en/` is English's home, served by
`src/pages/[...slug].astro` as `/` is by `index.astro`
(`src/components/Home.astro`). Each page has its language's `<html lang>`,
chrome and home link, `<link rel="alternate" hreflang>` to each published
translation (plus `x-default`, the default language's), and a language
switcher. The Frontend's own words (the 404, "Temporarily unavailable", the
placeholders) are in `src/lib/copy.ts`, in English and Portuguese. A route
with no entry in its language is a 404: there is no fallback across
languages.

## Blocks

`@getquick/content` renders the GETQUICK Design blocks WPGraphQL Blocks
returns, and `blockPresetStyles` turns the CMS's spacing and color presets
into the CSS saved block classes need; `src/styles/global.css` styles them.

## Checks

`pnpm check` (`astro check`), `pnpm lint` (`vp lint`) and `pnpm test`
(`vp test`) run from the workspace root, and in `pnpm verify`. `src/routes.test.ts`
renders the pages through Astro's Container API against a stubbed CMS
(`vitest.config.ts` gives Vitest Astro's Vite config): what this Site
composes from what the runtime delivers. The runtime's own tests are
`@getquick/content`'s. `src/consent.test.ts`, `src/consent-records.test.ts`
and `src/lib/map-tiles.test.ts` cover the consent and legal-pages adoption;
`pnpm consent:acceptance` builds the app for Node and runs gq-content's
shared consent acceptance suite on it in Chromium
(`scripts/consent-acceptance/`).

## Deploys

Releases deploy the Frontend from the `v*` tag in Cloudflare CI
(`infra/ci`). Deploys build with `PUBLIC_WORDPRESS_GRAPHQL_URL` set to
`https://<domains.admin><wordpress.graphqlPath>` from `gq.ops.json` (the path
defaults to `/wp/graphql`; `/graphql` is also supported). An explicit process
`PUBLIC_WORDPRESS_GRAPHQL_URL` still overrides that default. Production Alchemy
wiring passes the public URL into Astro's build environment; local DDEV keeps
its `/wp/graphql` env template. `pnpm deploy:frontend` redeploys by hand with
the token in Sigillo `staging`.

## Nomia's blocks

Pages and posts built with Nomia's blocks (`getquick/*`, the CMS's
`nomia-blocks` plugin) are rendered by the Nomia block components, migrated
from bioeconomia.pt's Astro renderer. They are the runtime's `extension`
(`src/lib/content.ts`): a refresh reads the entry's parsed blocks
(`wpBlocksJson`) and page background (`nomiaPageBackgroundColor`) and stores
them with it (`src/lib/nomia-content.ts`), served as `entry.extension` and a
front page's `home.page.extension`. A visit renders them with
`src/components/NomiaBlocks.astro`, still without reading WordPress. An entry
without Nomia's blocks is served as WordPress rendered it.
`src/nomia-blocks.test.ts` drives them through a refresh and a CMS outage,
with the store on SQLite (`src/test/sqlite-d1.ts`, the package's migrations).

- `src/structured-blocks/registrations/` defines each block; `pnpm
structured-blocks:sync` writes the generated files here
  (`custom-block-contracts.ts`, `WpCustomBlock.astro`, the fixtures and
  `data/`) and in the plugin. `pnpm check` fails when they drift.
- `src/components/wp-blocks/` is the dispatcher and the block renderers;
  `src/components/{page-heroes,sections,charts,...}` what they render. The
  carousels, charts and the map are React islands.
- `src/styles/nomia-theme.css` holds Nomia's design tokens (Tailwind
  `@theme`) and core-block styles; `src/components/layout/FontLinks.astro`
  loads its fonts. `public/images/` holds the blocks' default images.
- Colors are GQ Design's palette (GETQUICK → Design → Branding → Colors):
  the tokens are WordPress's `--wp--preset--color--<slug>` variables, which
  the Layout defines on `:root` from the stored design presets, and core
  blocks' preset slugs resolve to the same variables. No color is copied
  here; `tests/nomia-palette.test.mjs` fails on a slug the palette lacks.
  `apps/cms/scripts/nomia-palette.php` applies Nomia's palette to a CMS once
  (`wp eval-file scripts/nomia-palette.php`).
- `/wp-block-preview` renders one block for the editor's preview iframe;
  `/wp-block-preview/catalog` renders every block's fixture.
- Blocks render only what they store: the podcast list and the platforms
  grid no longer read WordPress when their lists are empty.
- `docs/gutenberg-blocks/` documents each block; `tests/` holds their tests
  (`pnpm test:blocks`, also run by `pnpm test`).
