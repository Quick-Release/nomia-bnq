# ADR 0001: Adopt the consent and legal-pages foundations

- Status: Proposed. This is the Site's adoption of gq-platform's
  [ADR 0008](https://github.com/Quick-Release/gq-platform/blob/claude/cookie-consent-foundation/docs/adr/0008-consent-and-legal-pages.md)
  (CONSENT-1, LEGAL-1), which is still **Proposed**, with its legal review
  ([gq-platform#204](https://github.com/Quick-Release/gq-platform/issues/204))
  open. The Platform decision owner directed it ahead of acceptance (ticket 17
  of gq-platform#203). Production enablement needs its own approval.
- Date: 2026-10-22
- Issue: [#51](https://github.com/Quick-Release/nomia-bnq/issues/51)

## Context

Nomia's Frontend loaded third parties before any consent, and none of its
pages linked its privacy policy:

- The contact map (`getquick/nomia-contact-map`) rendered a live Google Maps
  iframe.
- WordPress HTML served with `set:html` carries `core/embed` YouTube iframes.
  The local copy of production content has one, in a `videos` entry. The
  Frontend doesn't serve custom post type entries yet, only pages and posts.
- The GETQUICK Design video hero renders a `youtube-nocookie` iframe.
- The map-list explorer (MapLibre) loaded its style, tiles, glyphs and sprites
  from `tiles.openfreemap.org`.
- "Política de Privacidade" (page 90) is published but linked from nowhere.

The providers are pinned exactly:

- `@getquick/site` 0.20.0;
- the gq-content pair 0.2.0: `@getquick/content` and the CMS plugin
  `getquick/gq-content`;
- `getquick/gq-config` 0.4.3.

The Site runs on the pair's content runtime (`"contentRuntime": "package"`,
gq-site's `docs/guides/content-pair-migration.md`). Nomia's blocks are the
runtime's typed `extension`. The 0.1.0 pilot composed consent by hand on the
skeleton's copied runtime (gq-site#77). This version configures the
runtime's `consent` instead, and keeps only what the runtime doesn't cover.

## Decision

Nomia adopts CONSENT-1 and LEGAL-1 through gq-content's consent Runtime. It
uses the Runtime's default UI, restyled only through its custom properties,
and doesn't copy any Runtime logic.

- **Declared services:** `youtube` and `google_maps`, the runtime's
  `consent.services` (`src/lib/content.ts`).
  GA4 is not declared: gq-config's toggle switches it on. Turning that toggle
  on adds the `analytics` category, a material change: every visitor is asked
  again.
- **Embeds:** the runtime runs each published body through `rewriteEmbeds`
  at delivery, so the store keeps what was published. YouTube iframes become
  placeholders and the video hero becomes a decorative one. Iframes from
  unknown hosts and executable scripts are blocked. The CMS and the media
  domain (`consent.firstPartyHosts`) count as first party.
- **Nomia blocks:** the runtime gates bodies, not a Site's `extension`.
  `NomiaBlocks.astro` therefore gates every piece of the blocks' saved HTML
  with the same rules (`gatedNomiaContent`, `src/lib/consent.ts`) when it
  renders.
- **Contact map:** rendered through `embedPlaceholder` (`google_maps`). Its
  size now sits on the placeholder, which holds the iframe once loaded.
- **Block media:** the page hero media grid plays only a video on the Site's
  own hosts (`firstPartyMedia`). One from another host falls back to the
  poster, since no catalog service covers it. Production's only hero video is
  on the media domain.
- **OpenFreeMap tiles are proxied through the Site's Worker, not gated.**
  `/gq/map/*` (`src/lib/map-tiles.ts`) serves OpenFreeMap's styles, tileset,
  tiles, relief, glyphs and sprites from an allowlist. It rewrites
  OpenFreeMap's URLs in JSON to the Site's and forwards nothing of the
  visitor's: no cookie, referrer, user agent or address. Why proxy:
  - CONSENT-1 CN-R3 prefers proxying map tiles to categorising them.
  - The Runtime's closed catalog has no OpenFreeMap service, and Sites can't
    add one. Gating would need a gq-content catalog release.
  - Gating would hide a navigation map behind a consent prompt for a request
    that carries no tracking.
  - The cost is Worker subrequests and egress for tiles. Upstream
    `Cache-Control` is passed through.
- **Legal pages:**
  - With `consent.cmsSettings`, the runtime reads gq-config's `getquickLegal`
    and `googleAnalytics` into each language's chrome. It stores the Legal
    Contract with the chrome.
  - The CMS plugin `getquick/gq-content` sends `legal` and `analytics`
    settings events, which refresh it.
  - The layout renders the Runtime's banner first in `<body>`, from
    `content().consentConfiguration(chrome)`. The footer holds the legal
    links and the persistent "Cookie settings" control.
- **Records:** `/gq/consent` and `/gq/consent/*` hand the request to
  `createConsentServer({ siteId: "nomia-bnq" })`, with the bindings
  `src/lib/content.ts` reads. The Blueprint (`infra/consent.ts`) provisions `CONSENT_DB` in jurisdiction `eu`, the rate
  limiter, the read token and the purge Worker.
- **CMS pins:**
  - `getquick/gq-config` `^0.4.3`, locked at 0.4.3: the first version with
    the Legal tab, the Contract and the Consent tab.
  - `getquick/gq-content` 0.2.0, in place of the copied event mu-plugins. Its
    namespace clash is fixed in gq-site#77.

## Considered options

- **Gate the OpenFreeMap tiles as `external_media`.** Rejected, for the
  reasons above. It remains the fallback if the proxy's cost or OpenFreeMap's
  terms make proxying untenable. That would need an `openfreemap` catalog
  service in gq-content first.
- **Self-host the tiles.** Rejected for now: a planet tileset is a separate
  storage and update pipeline for one decorative map.
- **Rewrite embeds when rendering each component.** Rejected: there are many
  `set:html` call sites. The runtime rewrites bodies at delivery. Nomia
  blocks are gated once, where their tree is rendered.

## Consequences

- The chrome costs one more CMS request per language, for the consent
  settings. The runtime's reconciliation accounts for it.
- Published HTML can no longer run inline or third-party scripts, or embed
  other hosts. That is CN-R3, and the local copy of production content has
  none.
- Images are reported, not rewritten. In the local copy of production
  content, the `paec-2030` page hotlinks an image from `apambiente.pt`. That
  route fails CN-R1/CN-R3 until an editor re-hosts the image in the media
  library ([enablement plan](../plans/consent-enablement.md), step 3). Three
  `recursos_educativos` entries hotlink images from
  `mlgczzplk1pi.i.optimole.com`. They aren't served yet, but need the same
  fix before custom post types are.
- A failed `getquickLegal` read fails the whole chrome read, as gq-content's
  own runtime does: the stored chrome, legal links included, stays served
  (LG-R6), but menu and logo refreshes wait until gq-config answers again.
- The editor preview pages (`/wp-block-preview`, `/wp-block-preview/catalog`,
  `noindex`) don't use the layout, so they carry no banner or legal links.
  They are editor tooling, not Site pages. Making them staff-only or giving
  them the layout is a follow-up.
- LEGAL-1 LG-R4 names `getquick_config_options_updated` as the `legal`
  trigger. gq-config 0.4.3 fires `getquick_config_legal_changed`, which
  gq-content also listens on, and Nomia follows the providers. The
  criterion text needs updating in gq-platform.
- Rolling back means reverting this change and the move to the content pair
  together, because the CMS plugin and the Frontend runtime ship as one
  ([enablement plan](../plans/consent-enablement.md), §7).

## Verification

- Unit and rendering tests (`pnpm test`):
  - `src/consent.test.ts`: pages refreshed into the store and served
    through the package runtime;
  - `src/consent-records.test.ts`: the record endpoints on SQLite;
  - `src/lib/map-tiles.test.ts`: the map proxy.
- `pnpm --filter @nomia-bnq/frontend consent:acceptance` builds the real app
  with the Node adapter and its bindings on SQLite, serves it, refreshes it
  from a stub CMS and runs gq-content's shared suite in Chromium. On
  2026-10-22, with `@getquick/content` 0.2.0, it passed 48 suite checks on `/`, `/multimedia/`,
  `/bioeconomia/`, `/contactos/`, `/mapa/` and `/politica-de-privacidade/`,
  plus 9 Nomia scenarios. Records carry `uiVersion` `gq-content@0.2.0`.
- Negative control: with YouTube's host treated as first party, the same run
  fails on CN-R1 and CN-R13.

Criteria on this branch, before enablement:

| Status                                             | Criteria                                                                                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Passed locally (built app, stub CMS)               | CN-R1, CN-R2, CN-R3, CN-R4, CN-R6, CN-R7, CN-R8, CN-R11, CN-R13, CN-C3, LG-R5                                                                              |
| Covered by unit tests only                         | CN-R9 (same origin)                                                                                                                                        |
| Provided by gq-content/gq-site, not re-tested here | CN-R5, CN-R10, CN-R12, CN-R14, CN-C4, LG-R6 (the runtime serves stored chrome when the CMS fails)                                                          |
| Pending enablement                                 | CN-R1, CN-R13 and LG-R5 on deployed captures; CN-R8's `eu` jurisdiction (`pnpm doctor`); LG-R1, LG-R3, LG-R4 (production assignment and its `legal` event) |
| Failing until a content fix                        | CN-R1 and CN-R3 on `/economia-circular/paec-2030/` (hotlinked image)                                                                                       |
| Not applicable                                     | CN-C1 (Nomia has optional services), CN-C2 (content Site), LG-R2 (monolingual), LG-C1, and LG-C2 until the client confirms it serves consumers             |

Not verified: deployed captures, the consent database's jurisdiction, and
the CMS role assignment. These belong to the enablement gate, in
[the enablement plan](../plans/consent-enablement.md).
