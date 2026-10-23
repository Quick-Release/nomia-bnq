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
