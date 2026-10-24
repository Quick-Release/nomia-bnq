# Immutable producer snapshots

Container snapshots copied byte for byte from `Quick-Release/gq-design` commit `4db472b` for
Nomia's production CSS consumer acceptance. These are fixtures, not copied
runtime implementations. Keep the snapshots unformatted.

| Snapshot                             | Upstream path                                                        | SHA-256                                                          |
| ------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| container-presentation.html          | tests/fixtures/container-presentation.html                           | 4dfa37339a789fbc2708f183f8050aed723160ebc0068baecef472f1a62bc7e9 |
| container-presentation-rendered.html | tests/fixtures/container-presentation-rendered.html                  | 4de246453e6ed3977082cb51676565b21723cba2ee22e46224887f750b82992d |
| container-presentation.json          | packages/design-contract/fixtures/blocks/container-presentation.json | 25ea94c114c1d9381b78a95a2043f9e67d459cabce29674a773886ccf3f966a4 |

The saved document comes from real Gutenberg nested Container sidebar controls:
Base half width, auto inline margins and padding 4; md full width; lg maximum
width lg. It serialized, parsed and re-rendered validly. The rendered HTML
comes from WordPress `do_blocks` with the neutral render filter. The JSON is
schema-valid public `TemplateSerializer` output from the same document.
This proves the serializer boundary, not an HTTP or GraphQL request. Actual
REST `getquickBlocks` evidence remains upstream in the coordinated #82 work.

## Native media

These snapshots come byte for byte from `Quick-Release/gq-design` commit
`c5dc50a`:

| Snapshot                       | Upstream path                                 | SHA-256                                                          |
| ------------------------------ | --------------------------------------------- | ---------------------------------------------------------------- |
| media-presentation-saved.html  | tests/fixtures/media-presentation/saved.html  | 656b3dbaf0037de44209119bc90a064201431077383e863dfa3477d061e73c92 |
| media-presentation-public.json | tests/fixtures/media-presentation/public.json | 0e600dd03a342a31d87832815eaa5a0da6203fdc4e2dbb8ffe00e626702988a7 |

The saved document was authored and reopened in real Gutenberg 7.0. The public
snapshot comes from WordPress parsing, the checkout's `TemplateSerializer` and
native `render_block` inside a read-only request. Image link/alt/caption and
Cover foreground are real producer output. Featured Image HTML is empty and
Site Logo assets are null because the producer has no post/site context.
Consumers must supply and verify those actual contexts; empty output proves
no rendering behavior. The neutral Cover node has null content and requires a
runtime adapter; its rendered HTML is separately available in `html[1]`.

These snapshots establish producer provenance. Current consumer coverage and
provided-context limitations are documented in `../../browser/README.md`.

## Video Hero

These two real Gutenberg saved documents are immutable snapshots from
`Quick-Release/gq-design` commit `4e6f3ddcc157fb16388d97c5bc93f4154b6d401a`:

| Snapshot                     | Upstream path                               | SHA-256                                                          |
| ---------------------------- | ------------------------------------------- | ---------------------------------------------------------------- |
| video-hero-presentation.html | tests/fixtures/video-hero-presentation.html | ceb2ddc6360274c5ab97e18836f3755df641fc720a5e2aefe931ff01b9c92239 |
| video-hero-youtube.html      | tests/fixtures/video-hero-youtube.html      | dbdf5b59fb89f673f8f780fbedae4360e60a76a31a6cdfd5461fde2d7440b4f4 |

The first document has a poster, nested accessible link, explicit contrast,
half width, 256px height and independent foreground flex/text alignment. It
does not contain a self-hosted video source and cannot prove video playback.
The YouTube document has a poster, localized title, nested link and Base cover,
md contain, lg reset. Deferred `data-src` must remain gated by the content
runtime's consent facade before the canonical client initializer attaches it.

The current production browser suite separately verifies runtime/style, reduced
motion and consent. The snapshots alone establish no consumer acceptance.

## Typography delivery

`typography-presentation-delivery.json` is an unchanged snapshot of
`tests/fixtures/typography-presentation-delivery.json` at gq-design
`b11b763dba06ddd2006b1f406c516c3d8e22ef1c`, SHA-256
`55916b46bbfed0bb4ee64bd89a0ff9c39ab5f4e8fe8039db0099dc3a94a32d77`.
Its default/override cases contain the real WordPress 7.0 inspector-edited,
saved/reopened document, public neutral nodes, rendered HTML, tokens and
captured post/site context. List root content is null; list-item rich text
lives in attributes.content. Saved documents and neutral nodes match across
theme changes. The preview template was fixture setup: the actual layout
endpoint rejected it with 422 for missing region references. This snapshot
provides no saved dynamic layout delivery proof. Nomia's production CSS test
checks parsed, chrome and body paths separately; snapshot presence alone does
not establish passing consumer acceptance.

## Layout and Carousel

`layout-presentation-saved.json` is the unchanged five-root snapshot at
`720b84a23f6bc6dae17901d749d204344781f2ae`, SHA-256
`682377d90e6d87554d31dd80062733a00a7054594fbca23fe7ec05131aec51f4`.
`layout-presentation-final.json` comes from the same upstream path at
`893ea2d4aba9ceaf8de4e83e71c679b34bb9c098`, SHA-256
`13bec5f6a2b8a427f919c35ca90d0ec192b5b876e4dcf184608a696f6c7d5630`.
The latter adds the sixth narrow nested Container/Grid root and gap shorthand
chronology. Both contain actual saved markup, WordPress rendered HTML and REST
nodes with provenance. The final snapshot is the production geometry input.

`carousel-presentation-saved.json` comes from upstream
`tests/fixtures/carousel-presentation.json` at `0be23e8f4b80f11ad59a4cf2c87256ba6f526308`,
SHA-256 `c6a4a538e525ca0e6764c244a7ffdc5ddaa7f731bff2acd48e28ff93d0b16c6b`.
`carousel-presentation-public.json` comes from
`packages/design-contract/fixtures/blocks/carousel-presentation.json` at
`3232d3c22e5f50162e5a5761bb9e8345ce32b46a`, SHA-256
`ddb58fb636e28b3da412575775b22a0f73aae30f3afbb5d1728a007a4a7cc6f2`.
The public snapshot is actual HTTP REST producer output from the same saved
three-slide document; upstream also verified GraphQL tree equality. Nomia's
local test does not make a new upstream HTTP request.

## Query composition

`query-composition/` snapshots upstream paths of the same names at `6b5f746`.
The upstream README is retained unchanged. `post-public.json` SHA-256 is
`74af8206e68cddc5a2488f7a460ccf5f99ac435bbd8608a28729f17205af782b`;
`post-saved.html` is `b353c7430aa9a2edcb9cabacc46581b015f23fa3cc3b4eb65e4028335a8e158f`.
Producer-selected standard Post items retain order and untouched published
GraphQL records. The Site must preload those records through its existing
content reader and pass synchronous contexts to the renderer. No query
selection engine or published custom-post-type support is inferred.

The additional `typography-inline-delivery.json` preserves the newer actual
producer capture at `57f5ba68b1bee247fc453389699d39fa6ab79e33`, after required
producer/security changes `8204e858` and `57f5ba68`. Its SHA-256 is
`de1acd7589c1ef52d95bf212f21e20e18be4cb243d45d5f6dbd49d80593b7921`.
Heading/Paragraph attributes.content is sanitized inline HTML; their node.content
retains the separate full native wrapper. The production typography test uses
this refreshed capture to verify nested links, strong/span markup and quoted
`>` titles without a Site wrapper parser. The earlier b11b763 snapshot remains
unchanged. Both captures retain the explicit rejected dynamic layout limitation.

## Navigation

`navigation-presentation/` contains byte-for-byte upstream files at
`802c9a198471497760328e585aadbd5726d8c660` from
`tests/fixtures/producer/navigation-presentation/`. Its original `SHA256SUMS`
verifies all six payloads. `nodes.json` is the exact anonymous HTTP200
getquickBlocks array after real Gutenberg save/reload; `public-rest.json` retains
the response, with actual saved page/reference markup and rendered HTML separate.
Provenance records disposable identities and source commit `4db8b85ea01d3a690322f02bf9c07b5f39f0c1cd`.
Resolved published destinations, omitted draft, custom/native navigation,
page-list descendants and Social Links are actual producer output. URLs are no
longer live. This capture has no language switcher and proves no language-browser
acceptance. Nomia chrome rendering and ordinary saved body HTML need separate
interaction checks.

## Final native Columns and Hero delivery

`native-columns-structural-saved.json` is copied unchanged from upstream
`tests/fixtures/native-columns-structural-saved.json` at `3a5d6be`, SHA-256
`adf20a3ca0ffe09581e0544e61237a561121e9d52edb7bcb1e83e4029daab501`.
It captures actual saved/reopened four-root native Columns, their public nodes
and rendered HTML. It covers fixed native 782px stacking, unequal non-stacking
widths, equal growth, native vertical alignment and explicit neutral overrides.

`video-hero-saved-public.json` is the unchanged public fixture at
`e696635af5fdb4f841debe78f9372ebbf07b6bf0`, upstream
`packages/design-contract/fixtures/blocks/video-hero-saved.json`, SHA-256
`0fc5b229f2e67658fb2844098bfa56eea3891b658747990d678a399b377a9cc2`.
It uses the registered REST dispatcher, not an external HTTP request, and retains
the actual saved nested links as sanitized paragraph attributes.content.
Previously captured published HTML bytes are unchanged.

## Conditional language captures

`language-navigation/` is the complete immutable bundle at
`e1984c714c6dc4887324ce2729f6aba2765eea77`; its SHA256SUMS verifies 14 payloads.
`language-navigation-flags/` is the separate complete bundle at
`ed0afd9c3f4e7307a3204aa9bf846c3db96429e7`; SHA256SUMS verifies 16 payloads/assets.
Original README, notices, manifests and provenance are preserved in each bundle.
These are actual Free Polylang 3.8.10 / WordPress 7 owned EN/FR inputs. Explicitly
language-resolved public layout nodes and ordinary post nodes/rendered HTML are
independent authorities; their current metadata is not asserted equal. Actual
force_home URLs are retained even when noTranslation metadata is true. The
original capture has null flag URLs; the separate flag capture includes the exact
HTTP200 PNG assets and their original URLs. Tests may serve those captured bytes
at the original URLs, never rewrite the DTO. No Pro capability is inferred.

The tiny `../media/hero-test.webm` is a deterministic first-party browser playback
fixture, not captured CMS content. It is one second of black 320×180 VP8 at 10fps,
created with `ffmpeg -f lavfi -i color=black:s=320x180:r=10 -t 1 -an -c:v libvpx -b:v 50k hero-test.webm`.

`language-navigation-a11y/` is the separate complete actual future capture at
`2e7e447fb27dfc8d9b750d96b6aabed177363cc2`, after native producer filter
`e2cc4dc10334952dd1ead10b6c2ffc622e2b2d88`. Its original SHA256SUMS verifies
14 payloads. Only missing native flags-only/null-flag accessible names were
repaired by the producer; URL/content/options/current authorities are unchanged.
It is the native null-flag body accessibility input, while the old captures remain
unchanged historical evidence and ed0afd9 remains the actual PNG authority.
