# Nomia GQ Design nightly adoption

This is Nomia's opt-in consumer for the release design approved in
[GQ Design](t3-thread://v1/21e1a3cf-296b-4f5e-8fc4-e7fe4e5b1a44).
Nomia is the initial development Site: no traffic, breaking changes expected.
The implementation is disabled pending code review and setup. There is no
60-second deadline. No live deployment was performed during implementation.

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
and both matching npm `packages: [{name, version, asset, integrity, sha256}]`.
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
`gq frontend refresh` then refreshes stored publication output. No frontend
rebuild, automated test suite or smoke test runs in this nightly workflow.
Ordinary Site checks and the producer's PR formatting/lint/type checks and
patch/stable full-suite policy are retained.

One non-cancelling Actions concurrency group serializes nightly preparation,
activation, refresh and manual selection. Before activation it checks the latest
ready producer build again, skips superseded or already-successful builds, and
consults GitHub Deployments history. An unresolved deployment fences all further
nightly activation, including manual rollback. Each activation records Site SHA,
producer SHA/version/sequence, lock hash, snapshot SHA and workflow URL.
GitHub deployment success means both CMS deployment and publication refresh
completed; it is not evidence of automated behavioral testing. Producer stable
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
   `FRONTEND_REFRESH_TOKEN` from the protected secret store. Never commit or
   export whole Sigillo environments. The destination `github.token` receives
   `deployments: write`; the producer reader does not need Site write access.
3. Set repository variable `DESIGN_NIGHTLY_ENABLED=true`. In GQ Design, separately
   configure `NIGHTLY_DEPLOY_REPOSITORY=Quick-Release/nomia-bnq` and
   `NIGHTLY_DISPATCH_TOKEN` with destination contents write. Producer setup is
   owned by its separate session.
4. Confirm this deployment does not overlap the existing Cloudflare stable Site
   release pipeline or any operator-triggered Ploi release. Actions concurrency
   cannot serialize external deploy callers. A shared cross-pipeline activation
   lock would belong to `Quick-Release/gq-site` (`/data/code/getquick/gq-site`);
   this consumer does not change that blueprint or invent such an API.
5. Pilot manual selection, newest-ready bursts, interrupted activation recovery,
   refresh and rollback before relying on dispatches. Record observed latency.

Read-only setup inspection found no repository Actions secrets or variables and
no `nomia-design-nightly` environment (only `copilot`). Environment secrets have
not been provisioned or copied from existing Cloudflare CI. Actual credentials,
remote Composer installation and live activation remain unverified.

## Selection, rollback and recovery

Run **Nomia Design nightly** manually with an exact producer `tag` to select an
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
followed by `gq frontend refresh`. This is an operator recovery procedure, not
an automatic retry. The original exact R2 release archive is retained by the
existing release machinery. Actions artifacts expire after 90 days; archive a
needed bundle before expiry. No snapshot commit/tag is pushed to the Site repo.

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
reverse database/content changes. A manifest with optional
`migrations.destructive: true` fails closed and requires that separate reviewed
rollout; the current producer contract has no mandatory migration declaration,
so migration classification remains a release-author responsibility. Never push
a local database to Ploi or add an import to the export-only db-sync path.
