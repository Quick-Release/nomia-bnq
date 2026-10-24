# Design presentation acceptance

Run `pnpm --filter @nomia-bnq/frontend test:presentation` after installing Chromium
with `pnpm --filter @nomia-bnq/frontend exec playwright install chromium`.
The tests compile this Site's production `global.css` through Vite/Tailwind and
render its Astro dispatcher or actual Layout. Client tests bundle the production
Site lifecycle entry and mount the owning content helpers.

The current local verification artifact is content
`getquick-content-6695e02-preview6.tgz`, SHA-256
`65c6c0db764bf1556854a2aa41c0fc634103ef02fa7e7d0710e8c4f01b636fed`.
It bundles the exact canonical Design `6695e0245ae7d7a883276d7cac88152346a35191`
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
  logical spacing and keyboard focus. The newer inline capture retains full saved
  wrappers; source-only inline DTO delivery is a separate additive package gate.
- Layout: final six-root actual saved/UI/REST fixture, parsed/chrome/body HTML,
  responsive tracks, gap/rowGap chronology/reset, Group mode, unequal non-stacking
  Columns, Column alignSelf, Spacer height, Separator opacity and narrow nesting.
  This does not substitute for the forthcoming canonical equal-column growth,
  default mobile stacking and vertical-alignment baseline matrix.
- Carousel: actual saved document and public HTTP node through three adapters;
  ordered slides/link/foreground, hidden navigation, responsive explicit/Auto
  height, linked-image fill and display removal/restoration. The Site lifecycle
  cleans up and remounts the canonical browser initializer. Visible arrows,
  indicators and autoplay focus/hover behavior need their own Site case.
- Hero: actual saved poster and localized YouTube documents through parsed,
  reconstructed chrome and HTML helpers; actual Layout/CSS, late scoped media
  reset, box/foreground geometry, keyboard links, reduced motion and responsive
  iframe cover/contain based on the actual media box. The first snapshot is
  poster-only; it proves no self-hosted playback. These direct adapter tests do
  not exercise the consent controller's grant/revoke flow.
- Navigation: immutable actual saved/public `802c9a1` composition through the
  actual DesignPatternRegion and neutral helper in production Layout/CSS; custom
  and referenced native trees, resolved page lists, Instagram identity, source
  child spacing/color, current route, keyboard submenu/Escape/focus, mobile
  overlay open/close, default 64rem and override 70rem edges, cleanup/remount.
  Ordinary untouched WordPress body HTML and language switchers remain separate
  integration gates.
- Query: refreshed `6b5f746` standard Post fixture, authoritative Beta/Gamma order
  with no reslice, synchronous callbacks and the actual DesignPatternRegion
  preload through the existing EntryByUri reader against stubbed responses holding
  untouched captured GraphQL records. Recursive matching PostContent, transparent
  references, responsive Grid/Heading and real Button `#details`/text/tag/style/
  focus are measured at 767/768/1000px. No custom-post-type fetch or raw parsed
  saved Query selection engine is inferred.

## Remaining frontend gates

Actual contextual Featured Image and primary/dark/title branding fallback are
not covered by the producer's empty contexts. Native navigation chrome uses the actual saved producer capture; language
switcher browser coverage remains absent. The ordinary body HTML delivery path must also
be distinguished from chrome's neutral renderer: saved native WordPress lifecycle
attributes alone do not establish that this Site has mounted their interaction.
Administration isolation, producer HTTP/GraphQL probes and editor authoring are
their owners' evidence, separate from these Site checks.
