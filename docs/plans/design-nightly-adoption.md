# Nomia development nightlies

Nomia is an opted-in development Site with no traffic; breaking changes are
expected. Merges to this Site's `main` and completed GQ Design nightlies both
start **Nomia nightly**. Each run selects current Site main and the newest ready
immutable Design build, then deploys the CMS, builds/deploys the frontend, and
refreshes published content. Manual inputs select exact Design and Site sources
for investigation or rollback. There is no clock-based nightly schedule.

No test suite or acceptance suite gates this development delivery path. Locked
installs, artifact verification, successful builds and deployment completion are
required. The workflow retains the non-cancelling `nomia-cms-deployment` lock and
GitHub deployment fence through both deployments and publication refresh. The
existing `DESIGN_NIGHTLY_ENABLED` variable controls the whole path.

The initial plugin-only pilot succeeded on 2026-10-25 in
[run 40215540844](https://github.com/Quick-Release/nomia-bnq/actions/runs/40215540844).
The historical setup audit below describes the earlier disabled state, not the
current opt-in. Full-site deployment completion is recorded separately in each
run's deployment artifact, including CMS and frontend completion timestamps.

## Release validation

Authenticated live editor acceptance checks against a deployed CMS are reserved
for deliberate stable patch (fix), minor and major releases. Run them against
the stable release candidate before publishing.

Nightly publication, adoption, deployment and post-deploy verification exclude
these checks, whether automated or performed manually by an agent. Nightly
completion uses artifact integrity, successful builds, deployment status and
publication refresh. Local fixture and regression tests retain their existing
PR and stable-release policy.

## Released and installed baseline

GQ Design `v0.9.1` is already a published stable release (2026-10-25), not
an adopted nightly. At the audit, Nomia `origin/main` is
`19f1d4632ae66078bbdccfbf0b4654547f42dcc8`; its requirement remains `^0.9.0`
and its exact Composer lock still selects stable `0.9.0`. This PR preserves
both checked-in Composer files. Neither a published release nor a local
producer proof establishes what is deployed or manually tested on Nomia.

The producer root version `0.9.1` yields the next nightly base `0.9.2`;
there is no prerequisite to publish or deploy a `0.9.1` nightly. Selecting
latest stable `0.9.1` for Nomia would be a separate explicit stable adoption,
with verified registry discovery and its reviewed lock update. The nightly
consumer instead starts from the selected Site commit's existing lock, replaces
only Design with the chosen immutable nightly, and rejects changes to other
locked dependencies. Manual selection of an older artifact is an explicit
rollback; automatic delivery never rewrites the checked-in stable baseline.

## Delivery contract

GQ Design sends `repository_dispatch` type `gq_design_nightly` with
`client_payload` containing `repository: Quick-Release/gq-design`, `tag`,
`version`, `sourceSha`, and `manifestAsset: design-release.json`.
The event wakes the consumer; automatic selection queries the newest completed
release by integer `sequence`, then `attempt`. Payload arrival order never
selects an older build over a newer ready build.

The authenticated prerelease must contain `design-release.json` and
`gq-design-VERSION.zip`. Manifest schema 1 carries `channel: nightly`, `version`,
`tag`, `sourceSha`, `sequence`, `attempt`, `plugin: {name, asset, sha256, composer}`
`migrations: {destructive: boolean}`, and both matching npm `packages: [{name, version, asset, integrity, sha256}]`.
The manifest is the producer's completion marker after all artifacts exist.
The consumer resolves annotated or lightweight Git tags to confirm `sourceSha`,
checks the plugin SHA256 and preserves the producer manifest. It installs only
the CMS plugin; Nomia has no Design npm dependency to update.

Plugin/npm/tag versions are `X.Y.Z-nightly.YYYYMMDD.RUN.ATTEMPT`.
Composer's runtime metadata uses `dev-nightly-YYYYMMDD.RUN.ATTEMPT` because its
version parser rejects that nightly SemVer. The consumer adds a numeric Composer dev branch alias (`X.Y.Z.x-dev`) so the
existing theme’s `>=0.3.19 <1.0` constraint accepts the exact nightly branch.
The exact ZIP is authoritative:
raw tag archives have the original unstaged version and must never be installed.
The shared Composer registry continues serving other packages unchanged.

## Snapshot and activation

The workflow selects Nomia main (or a specified full main-ancestor SHA for a
manual run). It creates an ephemeral commit containing an exact Composer package
repository and requirement, resolved lock, bundled version-specific plugin ZIP,
producer manifest and deployment record in `apps/cms/nightly/`. Composer's ZIP
checksum is also populated, so cached or corrupted bytes fail installation.
Only `getquick/gq-design` may change in the dependency graph; new transitive
requirements fail for explicit Site adoption. All other locked packages remain
unchanged. Only runtime Composer metadata is copied; no raw-source fallback is
available.

The snapshot Git bundle and deployment record are uploaded before activation.
`gq ploi release --ref SNAPSHOT_SHA --git-dir CHECKOUT` packages that exact commit
through the existing R2/Ploi path and verifies the reported deployed commit.
No new gq flags or managed-file changes are needed. The normal CMS deploy
installs the locked artifact, activates plugins and runs existing deploy steps.
After both deployments, `gq frontend refresh` refreshes stored publication output.
The existing `pnpm run deploy:frontend:raw` command builds and deploys the
frontend from the same snapshot before refresh. No automated test suite or smoke
test runs in this nightly workflow.
Ordinary Site checks and the producer's PR formatting/lint/type checks and
patch/stable full-suite policy are retained.

One non-cancelling Actions concurrency group serializes nightly preparation,
activation, refresh and manual selection. Before activation it checks the latest
ready producer build again, skips superseded builds or an already-successful identical Site/Design pair
whose frontend was also deployed, and
consults GitHub Deployments history. Actions itself creates an environment
record before the job starts; the consumer excludes only the empty platform
record whose exact job URL, run attempt, runner, ref and commit are established
through the authenticated Actions API. Snapshot deployment records carry
`deploymentKind: nomia-design-nightly` and a manifest; those and all unrelated
unresolved records remain fenced. An unresolved deployment fences all further
nightly activation, including manual rollback. Each activation records Site SHA,
producer SHA/version/sequence, lock hash, snapshot SHA and workflow URL.
GitHub deployment success means CMS deployment, frontend build/deployment and
publication refresh completed; it is not evidence of automated behavioral testing. Producer stable
promotion must select exactly the recorded `manifest.sourceSha` previously
manually tested on Nomia, then pass its deliberate release suites.

If a newer release becomes ready after activation has begun, the in-flight
deploy finishes and a subsequent queued run selects the newest ready build.
A single Site provides no minimum testing window for intermediate versions.

## Setup after review

1. Merge this implementation. Confirm both Nomia hostnames still serve only the
   development Site with no traffic. Set `design-nightly.json` `enabled: true`
   in a reviewed change; leave the target hostname and Ploi ID checks intact.
   Disable adoption before moving the Site into traffic-serving operation.
2. Create GitHub environment `nomia-design-nightly`. Add environment secrets
   `DESIGN_NIGHTLY_READ_TOKEN` (fine-grained contents read for private
   `Quick-Release/gq-design`), `COMPOSER_AUTH`, `PLOI_API_TOKEN`,
   `RELEASES_R2_ACCESS_KEY_ID`, `RELEASES_R2_SECRET_ACCESS_KEY`, and
   `FRONTEND_REFRESH_TOKEN`, `CLOUDFLARE_API_TOKEN`,
   `PUBLICATION_EVENT_SECRET` and `CONSENT_READ_TOKEN` from the protected secret
   store. If the Site uses the GraphQL Access identity, also supply the paired
   `GQ_AUTH_GRAPHQL_CLIENT_ID` and `GQ_AUTH_GRAPHQL_CLIENT_SECRET`. Never commit or
   export whole Sigillo environments. The destination `github.token` receives
   `deployments: write`; the producer reader does not need Site write access.
3. Set repository variable `DESIGN_NIGHTLY_ENABLED=true`. In GQ Design, separately
   configure `NIGHTLY_DEPLOY_REPOSITORY=Quick-Release/nomia-bnq` and
   `NIGHTLY_DISPATCH_TOKEN` with destination contents write. Producer setup is
   owned by its separate session.
4. Apply the explicit operating reservation below: no Site stable-tag releases
   or out-of-band manual Ploi deployments while nightly delivery is enabled.
   Actions concurrency serializes the nightly path through `gq frontend refresh`;
   the reservation excludes other callers for that entire interval. No shared
   server wrapper or new deployment API is needed for this accepted mode.
5. Confirm the Ploi target PHP version satisfies the artifact’s runtime Composer
   requirement. The real producer proof requires PHP `>=8.4.1`; preparation uses
   PHP 8.4. A bounded read-only SSH probe confirmed live PHP `8.4.27`; do not
   override platform requirements to force installation.
6. Before enabling the cross-repository release flow, complete the separate
   registry-owned release-channel gate and stable-discovery changes. The staged
   nightly ZIP bypasses registry lookup for this plugin; that does not establish
   that the registry excludes untested nightlies or discovers tested stable
   releases correctly. Registry readiness must be confirmed by its owning
   session, without changing that repository from this worktree.
7. Pilot manual selection, newest-ready bursts, interrupted activation recovery,
   refresh and rollback before relying on dispatches. Record observed latency.

Setup audit (2026-10-25): environment `nomia-design-nightly` exists with a
main-only deployment branch policy. Five scoped secrets were copied from the
existing protected Nomia staging store without values in argv, files or logs:
`COMPOSER_AUTH`, `PLOI_API_TOKEN`, `RELEASES_R2_ACCESS_KEY_ID`,
`RELEASES_R2_SECRET_ACCESS_KEY`, and `FRONTEND_REFRESH_TOKEN`.
`DESIGN_NIGHTLY_READ_TOKEN` is still absent in environment metadata; the user’s
private browser wizard provisions it and the producer’s separate dispatch token.
No local user/admin credential is reused as a CI secret. Secret existence is not
a successful permissions or installation test; the pilot must verify actual
asset reads, remote Composer installation, refresh and recovery.

The existing local SSH identity works without new credential/known-host writes.
The target reports Site release `0.11.0`, commit
`19f1d4632ae66078bbdccfbf0b4654547f42dcc8`, and PHP `8.4.27`; the CMS responds
with `X-Robots-Tag: noindex, nofollow`. Its no-traffic development eligibility is
the user’s explicit designation. Ploi site reads work; one-off script execution
returns HTTP 403 for the existing token, so read-only verification used SSH.
The repository opt-in variable remains unset/false and producer dispatch stays
off. The first available pilot candidate is
`v0.9.2-nightly.20261025.1.1`, source
`8cb64b8b1fda138810d8456237a26579b4122ee1`; availability is not deployment or
manual-test evidence.

## Operating reservation

The user explicitly reserved Nomia: **“Reserve Nomia for nightlies; no stable-tag
or manual Ploi deployments while enabled.”** This operational exclusion is the
accepted alternative to a shared lock across deployment systems. It applies
from the start of nightly activation through completion of the supported
`gq frontend refresh`, including retries/reconciliation until resolved.

While nightly delivery is enabled:

- Do not create or push Site `v*` release tags: those trigger the managed
  Cloudflare stable deployment pipeline. Ordinary branch/main checks continue.
- Do not trigger Ploi deployments from its UI/API, local `gq ploi release`,
  `pnpm ploi:release`, or an independent recovery bundle. All operators and
  sessions must honor the reservation.
- Select or roll back a nightly through **Nomia nightly** manual workflow
  inputs when possible: it shares the non-cancelling nightly concurrency group.

Before any exceptional stable-tag, manual Ploi or out-of-band bundle recovery:

1. Keep/turn producer dispatch off first and set `DESIGN_NIGHTLY_ENABLED=false`
   in Nomia. These stop admission of new work; they do not stop an active deploy.
2. Drain queued work and allow active nightly preparation, Ploi activation and
   frontend refresh to finish. Do not cancel an in-flight deployment. Reconcile
   all unresolved GitHub deployment records with Ploi and the served `RELEASE`;
   no remote deploy or refresh may still be running.
3. Run the exceptional operation alone, using `gq frontend refresh` where needed,
   and verify its result before ending the reservation exception.
4. Re-establish the reservation and verify the Site is still eligible. Resume
   consumer admission only after the pilot/recovery evidence passes; enable
   producer dispatch last.

Do not proceed if exclusion cannot be maintained: leave delivery paused. The
installed blueprint has no deployment-only CI-disable switch; disabling all CI,
editing managed paths or substituting another refresh mechanism is not part of
this opt-in.

## Selection, rollback and recovery

Run **Nomia nightly** manually with an exact producer `tag` to select an
older artifact. Supply the recorded full `site_ref` to use the same Site code
and dependency baseline as that earlier deployment. Empty `tag` selects the
newest completed release. Later automatic runs resume newest-ready selection;
manual selection does not pin a channel indefinitely. Pause dispatch adoption
with `DESIGN_NIGHTLY_ENABLED=false` for a longer investigation.

For byte-exact recovery, download the original workflow artifact
`design-nightly-snapshot-RUN-ATTEMPT`; it contains `snapshot.bundle` and
`deployment.json`. Clone the bundle into an isolated temporary checkout, verify
its HEAD equals the recorded `snapshotSha`, and inspect its Composer lock hash
and bundled ZIP SHA256 against the record. After resolving any in-progress
fence and excluding other deploy callers, use the existing protected-secret
invocation of `gq ploi release --ref SNAPSHOT_SHA --git-dir SNAPSHOT_CHECKOUT`,
followed by `pnpm run deploy:frontend:raw` with the protected frontend secrets
and `gq frontend refresh`. This restores the frontend code from that checkout
as well as its CMS. The managed deployment applies forward-only D1 migrations;
code rollback does not reverse them. This is an operator recovery procedure, not
an automatic retry. The original exact R2 release archive is retained by the
existing release machinery. Actions artifacts expire after 90 days; archive a
needed bundle before expiry. No snapshot commit/tag is pushed to the Site repo.

Completion uses a fresh HTTPS connection after the synchronous deployment and
refresh commands. Only the final success-status operation has bounded transient
transport retries (three POST attempts, each request limited to 15 seconds).
After an uncertain POST, it first reads that deployment’s latest status: matching
success completes reconciliation; only this run’s existing `in_progress` status
allows another identical success POST. Other states, denied access or exhausted
transport attempts fail closed. Deployment and frontend refresh are never retried
by this completion handler.

A failed/timed-out/cancelled activation deliberately leaves its GitHub deployment
`in_progress`. Inspect Ploi's status/log and the served `RELEASE` commit first.
Do not clear the fence while the remote process could still be running. After
reconciliation, record a GitHub deployment status (`success` only if deployment
and refresh completed, otherwise `error` with a diagnostic URL), then rerun or
select an older build. A partial deploy can require rollback even if the
workflow never reached refresh.

Routine code deployments take no database snapshot. Before introducing a
**destructive** migration, disable automatic adoption and obtain a recoverable
DB/content snapshot with an inspected restore path. Code rollback does not
reverse database/content changes. Every manifest must declare a boolean
`migrations.destructive`; missing or non-boolean declarations are rejected.
`true` fails closed and requires that separate reviewed rollout. The producer’s
tracked `nightly-release-policy.json` supplies this declaration; authors must
set `destructiveMigrations: true` before merging destructive changes.
Classification remains a release-author responsibility. Never push
a local database to Ploi or add an import to the export-only db-sync path.

## Local producer proof

The producer's staged `0.9.2-nightly.20261025.900001.1` proof for source
`9d6b80de27b2c38429a38ac5bf4d596c3473fcad` passed the consumer model,
ZIP SHA256 validation and comparison of embedded runtime Composer metadata.
An isolated Composer install of that real ZIP also passed with the exact alias,
ZIP checksum, runtime PHP requirement and existing theme's Design version range.
The regenerated proof includes the mandatory boolean migration declaration.
These were local artifact checks; live GitHub tag resolution, Ploi PHP/runtime,
activation, refresh and rollback remain unverified. This does not establish
that the proof source has been deployed or manually tested on Nomia.
