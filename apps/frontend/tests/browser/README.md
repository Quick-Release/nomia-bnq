# Design presentation acceptance

Run `pnpm --filter @nomia-bnq/frontend test:presentation` after installing Chromium
with `pnpm --filter @nomia-bnq/frontend exec playwright install chromium`.
The tests compile this Site's production `global.css` through Vite/Tailwind and
render its Astro dispatcher or actual Layout. Client tests bundle the production
Site lifecycle entry and mount the owning content helpers.

The current local verification artifact is content
`getquick-content-634f58c-preview8.tgz`, SHA-256
`b6b4db473c00f6ade0d7c379ea83d4bb9e76a2360e0ee8ebbc6cfd32b627bebf`.
It bundles the exact canonical Design `634f58c8e42c8a1e7f8334e937126b472387d405`
pair (Design 0.9 / wire 2). Only the content facade is installed under ignored
`node_modules`; no renderer dependency, parser or mutable runtime source is copied.
Managed `@getquick/content` remains pinned at 0.3.1. A fresh install still requires
the coordinated content release and blueprint adoption before these consumers run.
A preview artifact is integration evidence, not release acceptance.

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
- Media: constructed responsive Image/Featured Image/Logo/Cover composition plus
  actual saved/public Image and Cover snapshots through all three adapters. The
  wrapper owns authored height; a captioned Image reserves its visible caption row
  inside that height. Direct media fills the remaining space. Cover foreground,
  background/overlay geometry, stacking, opacity and nested-media isolation pass.
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
  motion pause rules with the actual browser clock.
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
  are independent authorities; no arbitrary inline-script navigation is claimed.
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
