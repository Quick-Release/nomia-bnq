# Design presentation acceptance

`pnpm --filter @nomia-bnq/frontend test:container` compiles the Site's actual
`global.css` with Vite/Tailwind before constructing a saved block document.
It measures Chromium geometry through the local Astro `WpBlockRenderer`,
`renderDesignPattern` (chrome), and `renderWordPressBlocks` (HTML delivery).
The Layout supplies the same complete `presentationStyleSheet()` at runtime.
Install Chromium with `pnpm --filter @nomia-bnq/frontend exec playwright install chromium`.

The first Container integration was verified using the immutable
`getquick-content-8f18a4a-preview2.tgz` artifact supplied by the content owner,
SHA-256 `86081fa39782e25b61f301b7cc9d55236871dd8afd1e4d4b06679d5b321a79e9`.
It bundles the canonical Design renderer at `8f18a4a` and contract at `f3292fe`; no shared source is
copied into this repository. The preview was installed only under ignored
`node_modules`, without changing managed dependency pins or the lockfile.
The pinned `@getquick/content` 0.3.1 does not provide these helpers: a normal
fresh install requires the coordinated content release and blueprint adoption
before this staged consumer implementation can run.

Covered geometry: bare responsive caps without centering or padding, explicit
centering and logical spacing, fractions, independent max width, upward omitted
overrides, explicit resets, narrow parents, isolated child variables, RTL, and
immediately below/at/above all default breakpoints. Native wide/full geometry
retains Site alignment until an explicit neutral override applies upward.
Nested native alignments fit their parent; viewport breakouts apply only to
direct article children. HTML-only delivery preserves already saved variables.
The generated document remains a consumer fixture. A second test consumes the
immutable real Gutenberg saved document, WordPress-rendered HTML and public
serializer output from the same producer document; provenance and checksums
are in `../fixtures/design-presentation/README.md`. This is serializer-boundary
evidence, not an HTTP/GraphQL request; the public REST producer case remains
in the coordinated upstream work.

This is staged integration, not release acceptance. Resolved theme/reset and
layout, media, Carousel and navigation families need their final public helper
artifacts and separate saved-composition browser coverage. In particular,
Carousel interaction and null-saved navigation require the content runtime's
supported rendering and mounting interface.

## Media slice

`pnpm --filter @nomia-bnq/frontend test:presentation` runs the Container and
media consumer suites. Media integration uses content preview3,
`getquick-content-e60e095-preview3.tgz`, SHA-256
`055215e3ef45a983b397d86923c23188175304bddc0186731d029a2f3291fe47`.
It bundles the canonical target metadata/compiler; there is no Site property
parser or duplicated value grammar.

The constructed saved composition exercises Image, Featured Image, Site Logo
and Cover through the Astro dispatcher, chrome renderer and WordPress HTML
renderer. It checks wrapper fractions, direct-media fit/focal point/height/
radius, upward overrides, saved image links/picture sources/captions/alt, Cover
overlay opacity and isolation from nested media. Cover's HTML input includes
complete rendered foreground HTML, as the content runtime expects. This fixture
is not an actual HTTP delivery capture or a substitute for the pending immutable
real Gutenberg Image/public producer fixture.

Pending media acceptance: shared direct media/link fill structure, native Cover
minimum-height neutralization on authored sizing, resolved-theme variations,
and the immutable real producer fixture. The current test does not claim those
cases. Other family acceptance remains pending its owning runtime artifacts.

## Layout family readiness

The Columns/Column Astro adapter attaches canonical variables to its rebuilt
native wrapper while retaining native flex basis, vertical-alignment classes,
ordered children and `isStackedOnMobile`. Existing semantic adapter tests pass.
This wiring is not family geometry acceptance.

The content preview3 model predates layout commit `50bcb31`. With that commit's
real neutral fixture, current production Grid CSS still renders one/two/three
tracks at 767/768/1280px instead of authored two/four/reset. Group display,
Column alignSelf, Spacer height and Separator marginInline fail the preview3
model's validation. An updated content artifact must adopt the family model
and remove the old Grid resolver before the Site can validate layout geometry.
