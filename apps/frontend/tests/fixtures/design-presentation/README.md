# Immutable producer snapshots

Copied byte for byte from `Quick-Release/gq-design` commit `4db472b` for
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

These immutable inputs are staged for the next media acceptance step. Their
presence does not claim the still-pending shared structural CSS, contextual
featured/branding rendering, or neutral Cover chrome adapter has passed.

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

Consumer runtime/style and reduced-motion acceptance are pending the next
content artifact. These snapshots alone do not assert those behaviors pass.
