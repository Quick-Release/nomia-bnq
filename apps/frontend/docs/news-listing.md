# Notícias

The CMS page at `/noticias/` (page 757) owns its hero and introductory text.
The Site appends the standard WordPress post listing below it. Do not add a
static coming-soon paragraph to the CMS: it would survive publication of news.

`readNews` calls the content runtime's public `listPosts` API with the current
language, 12 items per page and the `pagina` query parameter. A confirmed total
of zero shows exactly **Brevemente disponível**. A positive total shows news
links and pagination without that message. Requests beyond the final page
redirect to the last page. Unavailable data returns HTTP 503 and the listing's
unavailable message, never a claim that there are no posts. Visits read only
the publication store.

## Initial adoption

The feature is disabled in `src/config/news-listing.ts` until its runtime and
store prerequisites are ready. The installed 0.6.1 does not have `listPosts`.

1. Adopt a stable Content pair containing gq-content PR 65 (merged source
   `d5f3b02f151b616c411aa978e862c532c52db5d8`) through the blueprint's managed
   pins. Update the blueprint pin and run `gq sync`, then update the locks.
   Verify the release manifest and installed API. The matching
   `0.6.2-nightly.20261110.20.1` artifact exists, but is not a production
   adoption: Nomia's nightly path remains disabled.
2. Deploy that runtime with `NEWS_LISTING_ENABLED = false`. Follow the
   repository's controlled-release procedure and current local deploy notes.
3. Run `pnpm frontend:refresh --url https://nomia.bnq.pt`. Complete the initial
   inventory and confirm stored standard entries now carry the runtime's
   post/page discriminator. Legacy entries otherwise produce unavailable.
   Use the public `listPosts` API to establish that readiness, not a CMS
   count or an assumption that a successful page request proves readiness.
4. Set `NEWS_LISTING_ENABLED = true`, validate, and release the Site. Confirm
   `/noticias/` responds with HTTP 200 and the exact empty message when the
   confirmed total is zero. Confirm the CMS hero remains intact. Verify the
   live page at `https://bioeconomia.apambiente.pt/noticias/`.

Local coverage: `node --experimental-strip-types --test tests/news-listing.test.mjs`
from `apps/frontend`; `pnpm check` from the repository root.
