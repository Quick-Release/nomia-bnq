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
The generated document is a consumer fixture, not evidence of an editor save
or public CMS round trip; that coordinated producer evidence remains upstream.

This is staged integration, not release acceptance. Resolved theme/reset and
layout, media, Carousel and navigation families need their final public helper
artifacts and separate saved-composition browser coverage. In particular,
Carousel interaction and null-saved navigation require the content runtime's
supported rendering and mounting interface.
