# Design presentation acceptance

Run `pnpm --filter @nomia-bnq/frontend test:presentation` after installing Chromium
with `pnpm --filter @nomia-bnq/frontend exec playwright install chromium`.
The tests compile this Site's production `global.css` through Vite/Tailwind and
render its Astro dispatcher or actual Layout. Client tests bundle the production
Site lifecycle entry and mount the owning content helpers.

The supported registry install now uses `@getquick/site` 0.23.2 and the paired
`@getquick/content` / `getquick/gq-content` 0.3.2, with Composer Design 0.9.0.
The blueprint owns both content pins through `gq sync`; both lockfiles record
actual published packages. No local archive override remains in the install.
The content npm archive integrity is
`sha512-1EErw67A+On/M1AZDlk0DOMcBsRkJU6wK7t4b93BHayBn9y32s2IZKxsCf/jfxe/DfBlnhRYk66z4msarOsdCA==`;
the source release is `698b98965b8138d25e273d9cdafe84f8397ca66d`.

On 2026-10-24, `pnpm --filter @nomia-bnq/frontend test:presentation` passed
19/19 against this registry install. `pnpm verify --ci` passed all nine checks,
including 207 Frontend tests, 12 script tests and the CMS validation/lint/tests.
`pnpm exec gq sync --check` is clean. This closes the local install/adoption gap;
production deployment and after-deploy browser smoke are separate gates.

Earlier local candidate evidence used
`getquick-content-c4bcc5a-final-candidate.tgz` (SHA-256
`d9977fe89e6e76eead1761fa9591f5dc95322d15aa6cb557d3dec6ff164a2af2`),
content `cbb447f27174c12b01f4f4ec0848debda4609f6c` / canonical `c4bcc5a`.
The final implementation reviews at `be11d07` passed against preview10. These
historical local artifacts are provenance, not deployment dependencies.

Immutable producer snapshots and their hashes/provenance are documented in
`../fixtures/design-presentation/README.md`. Local stub delivery tests do not
claim new upstream HTTP requests or live publication-store verification.

## Covered slices

- Container: parsed Astro, neutral chrome and WordPress HTML; bare responsive caps,
  fractions, centering only when explicit, logical spacing, omission/reset,
  nested/narrow parents, RTL, native wide/full preservation and every breakpoint
  edge. Includes the real Gutenberg saved/sidebar document and public serializer.
- Theme: actual Layout with default and overridden responsive thresholds, spacing,
  font family, scoped reset and media containment. Complete CSS is generated from
  the delivered theme on each render.
- Site utility cascade: actual Layout/body scope and Nomia header rendering verify
  utility padding and typography survive the canonical reset in `@layer base`,
  while bare headings still reset and neutral authored controls remain authoritative.
  The production-shaped regression fails before this integration fix.
- Media: constructed responsive Image/Featured Image/Logo/Cover composition plus
  actual saved/public Image and Cover snapshots through all three adapters. The
  wrapper owns authored height; a captioned Image reserves its visible caption row
  and retained caption margins inside that height. Direct media fills the remaining space. Cover foreground,
  background/overlay geometry, stacking, opacity and nested-media isolation pass.
- Cover motion: provided neutral, saved, parsed, local and ordinary Entry compositions use the
  existing first-party WebM fixture in actual Layout/CSS. Shared SSR strips only
  direct decorative video autoplay, preserving source/poster and foreground video
  controls. The owning client plays, pauses and resumes with motion preferences,
  pauses on Astro cleanup and remounts without a Site playback policy. This is
  supporting browser context, not a newly captured CMS Cover video.
- Typography: actual saved/public default and override captures, null-content List
  and rich list items, nested markers/start/reversed, native Button URL/target/rel,
  rich links/strong/span and quoted titles, authored font/line-height/colors/radius,
  logical spacing and keyboard focus. Source-only Heading/Paragraph DTOs from the same real capture are separately
  exercised without their full wrappers, preserving inline semantic markup.
- Layout: final six-root actual saved/UI/REST fixture, parsed/chrome/body HTML,
  responsive tracks, gap/rowGap chronology/reset, Group mode, unequal non-stacking
  Columns, Column alignSelf, Spacer height, Separator opacity and narrow nesting.
  A second actual saved four-root fixture verifies canonical equal-column growth,
  fixed native 782px mobile stacking, vertical alignment and explicit overrides
  at 640/781/782/783/1024px in LTR and RTL. The Site legacy layout excludes
  adopted wrappers so its earlier mobile !important rule cannot defeat controls.
- Carousel: actual saved document and public HTTP node through three adapters;
  ordered slides/link/foreground, hidden navigation, responsive explicit/Auto
  height, linked-image fill and display removal/restoration. The Site lifecycle
  cleans up and remounts the canonical browser initializer. A separate enabled-control variant of the captured slides verifies visible
  arrows/indicators/colors, keyboard navigation and autoplay focus/hover/reduced
  motion pause rules with the actual browser clock. Foreground link/button
  Arrow/Home/End keys cannot hide the focused slide; persistent navigation
  control shortcuts remain active. This regression fails on preview8 and passes
  on preview9 without any Site runtime handler change.
- Hero: actual saved poster and localized YouTube documents through parsed,
  reconstructed chrome and HTML helpers; actual Layout/CSS, late scoped media
  reset, box/foreground geometry, keyboard links, reduced motion and responsive
  iframe cover/contain based on the actual media box. The first snapshot remains poster-only. A supplied first-party WebM source
  separately verifies actual browser playback and reduced motion. Actual Site
  runtime gating and the existing consent client/UI/endpoint stub verify grant
  restores the deferred iframe under the canonical direct media target and
  revoke removes it, without a second Site media observer.
- Navigation: immutable actual saved/public `802c9a1` composition through the
  actual DesignPatternRegion and neutral helper in production Layout/CSS; custom
  and referenced native trees, resolved page lists, Instagram identity, source
  child spacing/color, current route, keyboard submenu/Escape/focus, mobile
  overlay open/close, default 64rem and override 70rem edges, cleanup/remount.
  The actual entry reader also delivers the unchanged captured WP HTML through
  owning runtime enhancement and the same mount, preserving its separate source
  URL authority and WP hooks. Conditional language is verified separately against actual Free Polylang inputs.
- Conditional language: immutable EN/FR Free Polylang captures, preserving actual
  force_home URLs and current metadata, names+flags/flags-only/dropdown variants,
  null-flag accessible fallback, exact captured PNG decoding at original URLs,
  keyboard/Escape focus and RTL logical placement. Separate ordinary body entry
  delivery uses the new native accessible-name capture, preserving source HTML
  current state and selected options. Layout nodes and ordinary post metadata
  are independent authorities. Scriptless published Entry selects use the owning
  client controller with exact captured option URLs and native Home/End keys; unsafe values are blocked,
  cleanup removes the handler and remount restores it. No inline scripts execute.
- Query: refreshed `6b5f746` standard Post fixture, authoritative Beta/Gamma order
  with no reslice, synchronous callbacks and the actual DesignPatternRegion
  preload through the existing EntryByUri reader against stubbed responses holding
  untouched captured GraphQL records. Recursive matching PostContent, transparent
  references, responsive Grid/Heading and real Button `#details`/text/tag/style/
  focus are measured at 767/768/1000px. No custom-post-type fetch or raw parsed
  saved Query selection engine is inferred.

## Evidence limits and adoption prerequisites

Actual Layout/entry context propagation is checked using explicitly supplied
publication data: Featured Image height/link/alt and primary/dark/primary fallback/
title fallback. These are consumer context variants, not new CMS producer captures. Native navigation and language browser checks use their actual saved producer
captures and independent layout/body authorities. Ordinary body HTML and neutral chrome remain distinct authorities. Their
navigation is now separately tested through the supported runtime enhancement;
source attributes alone are never counted as working interaction.
Administration isolation, producer HTTP/GraphQL probes and editor authoring are
their owners' evidence, separate from these Site checks.

The current verified snapshots exercise bounded enabled-family behavior, not
fleet or complete catalog release acceptance. Root/plugin submenu alias/padding
regressions remain with their owners; the Site adds no policy override. A public
neutral Cover node without minHeight/unit cannot establish an attrs-only authored
500px minimum; saved HTML remains its source authority. Query support uses the
existing standard Post/Page URI reader, not published CPT fetching or a raw saved
Query selection engine. The Home delivery currently supplies no post media field;
Featured Image context proof is the explicit Layout context and published entry
reader, not an invented front-page media lookup.
