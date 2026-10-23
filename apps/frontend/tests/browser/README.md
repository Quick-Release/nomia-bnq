# Design presentation acceptance

`pnpm --filter @nomia-bnq/frontend test:container` compiles the Site's actual
`global.css` with Vite/Tailwind before constructing a saved block document.
It measures Chromium geometry through the local Astro `WpBlockRenderer`,
`renderDesignPattern` (chrome), and `renderWordPressBlocks` (HTML delivery).
The Layout supplies the same complete `presentationStyleSheet()` at runtime.
Install Chromium with `pnpm --filter @nomia-bnq/frontend exec playwright install chromium`.

The first Container integration was verified using the immutable
`getquick-content-f3292fe-preview1.tgz` artifact supplied by the content owner,
SHA-256 `9330e47f449358842f9c149d24a612bbb341eab28d4e7c43412e7748cbfe1510`.
It bundles the canonical Design foundation at `f3292fe`; no shared source is
copied into this repository. The preview was installed only under ignored
`node_modules`, without changing managed dependency pins or the lockfile.
The pinned `@getquick/content` 0.3.1 does not provide these helpers: a normal
fresh install requires the coordinated content release and blueprint adoption
before this staged consumer implementation can run.

Covered geometry: bare responsive caps without centering or padding, explicit
centering and logical spacing, fractions, independent max width, upward omitted
overrides, explicit resets, narrow parents, isolated child variables, RTL, and
immediately below/at/above all default breakpoints. Native wide/full wrappers
are present but their distinct geometry awaits the shared alignment fix.
The generated document is a consumer fixture, not evidence of an editor save
or public CMS round trip; that coordinated producer evidence remains upstream.

This is staged integration, not release acceptance. Resolved theme/reset and
layout, media, Carousel and navigation families need their final public helper
artifacts and separate saved-composition browser coverage. In particular,
Carousel interaction and null-saved navigation require the content runtime's
supported rendering and mounting interface.
