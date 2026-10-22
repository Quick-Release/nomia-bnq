# Consent and legal pages: enablement

How Nomia's adoption of CONSENT-1 and LEGAL-1
([ADR 0001](../adr/0001-adopt-consent-and-legal-pages.md)) reaches production,
how to check it, and how to undo it. Each step below changes production. None
of them was run when the integration branch was opened. **Running them needs
the separate enablement approval** that ticket 17 of gq-platform#203 reserves.
A merge to `main` deploys nothing. The release tag of step 4 does.

## 1. Approval and readiness

- The production enablement approval is recorded on
  [#51](https://github.com/Quick-Release/nomia-bnq/issues/51).
- gq-platform's ADR 0008 legal review status is noted there: the copy,
  6-month validity, 5-year retention and the controller/processor DPA
  (gq-platform#204). Enabling before that review is the approver's call.

## 2. Secrets (Sigillo staging, then the CI Worker and the CMS)

```sh
pnpm frontend:secrets   # generates CONSENT_READ_TOKEN in Sigillo staging when missing
pnpm ci:deploy          # binds it to the CI Worker, which passes it to Frontend deploys
pnpm ploi:events        # the CMS .env: GETQUICK_CONSENT_READ_TOKEN, GETQUICK_FRONTEND_URL
```

## 3. Content (production CMS, by an editor)

Re-host the third-party images found in the local copy of production content.
Upload each to the media library and replace its `src`:

- `paec-2030` (page, served at `/economia-circular/paec-2030/`):
  `https://apambiente.pt/sites/default/files/inline-images/image_15.png`.
  This blocks enablement: the route fails CN-R1.
- `atividade-no2`, `atividade-no3` and
  `o-biochar-biocarvao-pode-ajudar-ou-nao-os-microrganismos-do-solo`
  (`recursos_educativos`): images on `mlgczzplk1pi.i.optimole.com`. These
  entries aren't served by the Frontend yet. Fix them before custom post
  types are served.

To find any added since, list the published entries with an absolute
`src` and drop the ones on `nomia-media.bnq.pt`:
`wp db query "SELECT ID, post_type, post_name FROM wp_posts WHERE post_status = 'publish' AND post_content LIKE '%src=\"https://%'"`.

## 4. Release

This release also carries the move onto the gq-content package pair 0.2.0
(`@getquick/site` 0.20.0, `"contentRuntime": "package"`). The CMS plugin and
the Frontend runtime have to ship together. Release with `pnpm push minor`;
the CI Worker deploys on the `v*` tag:

1. Ploi deploys the CMS. `getquick/gq-content` 0.2.0 replaces the copied
   event mu-plugins and keeps their options, meta, retries and crontab line.
   `getquick/gq-config` 0.4.3 comes with it. The plugin sends the `legal` and
   `analytics` settings events.
2. The Frontend deploys on the package runtime. Its publication store's
   migrations are the package's, byte-identical, so nothing is reapplied.
   The deploy also creates:
   - `nomia-bnq-fe-consent` in jurisdiction `eu`, retained in production;
   - the `CONSENT_RATE_LIMITER` binding;
   - the `nomia-bnq-consent-purge` cron Worker, daily at 03:17 UTC.
3. Run `pnpm frontend:refresh` for the whole Site, so every page and the
   chrome are stored by the package runtime, with the Legal Contract. Until
   it finishes, Nomia-block pages render without their blocks: run it
   straight after the deploy.

## 5. Assign the legal pages (production CMS, an administrator)

In `https://nomia-cms.bnq.pt/wp/wp-admin/`, open **GETQUICK** (the
`getquick-options` page), then the **Legal** tab:

1. **Data controller → Legal name**: the controller's legal name, as the
   client confirms it.
2. **Data controller → Privacy contact email**: the client's privacy address.
   Add **Data protection officer** if one is appointed.
3. **Legal pages → Privacy policy**: "Política de Privacidade" (page 90,
   `/politica-de-privacidade/`).
4. **Legal pages → Cookie policy**: the same page, until a separate cookie
   policy is published. LEGAL-1 allows this. The page's text should cover
   cookies, the consent banner and the services in [ADR 0001](../adr/0001-adopt-consent-and-legal-pages.md):
   YouTube, Google Maps, and GA4 if it is turned on. Writing that text is the
   client's job, not GETQUICK's.
5. **Portuguese consumers**: leave off unless the client confirms it is a
   business serving consumers. That is a legal-review question (LG-C2).
6. Save. gq-config fires `getquick_config_legal_changed`, and the CMS sends
   the `legal` settings event that refreshes every page's chrome.

The draft "Privacy Policy" (page 3, WordPress's default) stays a draft. Don't
assign it.

Check with WP-CLI on the CMS server:

```sh
wp eval 'echo wp_json_encode( getquick_config_legal_readiness() );'   # ready: true
wp eval 'echo wp_json_encode( getquick_config_legal_contract() );'    # roles, controller
```

The local DDEV CMS (`nomia-bnq-admin`) runs from the main checkout. When it
was checked, it had gq-config 0.4.1, which has no Legal tab, so the
assignment wasn't rehearsed there. To rehearse it, install this branch's CMS
(`pnpm cms:composer`) in a local CMS, then repeat the steps above against
`https://nomia-bnq-admin.ddev.site`.

## 6. Verify (each result goes on #51)

```sh
pnpm doctor               # the consent database's jurisdiction is eu (CONSENT-1 evidence 5)
pnpm frontend:events:check   # the CMS plugin's events reach the Frontend
pnpm site:check           # legal-pages, consent-runtime, third-party-hosts (homepage)
pnpm --filter @nomia-bnq/frontend consent:captures https://nomia.bnq.pt \
  / /contactos/ /economia-circular/paec-2030/ /politica-de-privacidade/ /teste-blocos/
```

`consent:captures` runs gq-content's shared suite in Chromium against the
deployed origin, with no interaction and after Reject all. It also scans each
route's raw HTML and legal links. Evidence goes to
`apps/frontend/.proofs/consent/`. Add the `videos` entry that carries the
`core/embed` once custom post types are served.

Then, by hand, in a private window:

1. Accept all, then reload. The banner is gone.
2. Open GETQUICK → Consent and look the consent ID up. The panel shows it
   under **Cookie settings**. One `accept_all` record should be there.
3. Withdraw from **Cookie settings**. A `withdraw` record is added.

## 7. Rollback

- **Consent only:** release a revert of the consent commits. Pages stop
  rendering the banner. The runtime's `consent` configuration goes away, so
  embeds load as before.
  - The consent database and its purge Worker stay. The Blueprint keeps
    declaring them while `@getquick/content` is installed, which it is for
    the content runtime. Records are kept and purged under CN-R10.
  - Visitors' `gq_consent` cookies are harmless and expire on their own.
- **Everything:** release a revert of this merge, the content-pair move
  included. CMS and Frontend go back together: the copied mu-plugins can't
  load beside `getquick/gq-content`, and the copied runtime's migrations are
  byte-identical, so the store carries over.
  - Without `@getquick/content`, the deploy stops declaring the purge
    Worker. If that rollback lasts, purge by hand, or redeploy the purge
    Worker alone.
- gq-config 0.4.3 can stay in either case. Its Legal tab and Contract don't
  affect a Frontend that doesn't read them.
- **Never** delete or recreate `nomia-bnq-fe-consent` to "reset" it. Its
  jurisdiction can't be set again, and its records must be kept.
