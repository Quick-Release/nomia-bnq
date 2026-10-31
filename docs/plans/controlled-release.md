# Nomia controlled release

Status: **nightly delivery paused** on 2026-10-31. The next stable release
is being prepared; nothing has been deployed since the pause.

The user chose: "Pause nightlies; prepare a controlled release." Nomia has
been production since go-live on 2026-10-29
([APA proxy and CMS move](apa-harica-proxy-and-cms-move.md)). Production
can't keep running
[development nightlies](design-nightly-adoption.md), whose path has no test
gate and deploys every `main` commit.

## Pause record

|                              |                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| Variable                     | Repository variable `DESIGN_NIGHTLY_ENABLED`                                                   |
| Before                       | `true`, updated 2026-10-29T15:50:53Z                                                           |
| After                        | `false`, updated 2026-10-31T10:33:59Z                                                          |
| In flight at pause           | None. No Nomia nightly run was queued or running.                                              |
| Unresolved deployment fences | None. Every `nomia-design-nightly` deployment had a `success`, `inactive` or `failure` status. |
| Last accepted activation     | Deployment 7451160872, run 41145930689. Status `success` at 2026-10-30T23:46:06Z.              |

The job's condition (`if: vars.DESIGN_NIGHTLY_ENABLED == 'true'`) applies to
every trigger: push to `main`, the five-minute schedule,
`repository_dispatch` from the producers and `workflow_dispatch`. With the
variable `false`, each of these runs the workflow, but the job is skipped
before checkout and before any credentials are used.
[`design-nightly.json`](../../design-nightly.json) adds a second, source-level
stop. Its `enabled: false` and `siteState: "production"` make
`scripts/design-nightly/run.mjs` refuse to prepare a snapshot, even if
someone re-enables the variable.

**Order of the pause.** The documented order turns producer dispatch off
first. Producer dispatch is configured in other repositories: `Quick-Release/gq-design`
(`NIGHTLY_DEPLOY_REPOSITORY`, `NIGHTLY_DISPATCH_TOKEN`) and
`Quick-Release/gq-content`. Their sessions own it. The consumer pause was
applied first because it stops every trigger, including dispatch events, and
nothing was in flight. Turn producer dispatch off in those repositories
before nightlies are re-enabled anywhere.

**GQ Design producer pause.** Reported by the Design session; this
repository did not read it.

- On gq-design `main` (`8f890c4`), the `notify-development-site` step
  dispatches only when `vars.NIGHTLY_DEPLOY_REPOSITORY` equals
  `Quick-Release/nomia-bnq`.
- That repository variable was deleted at 2026-10-31T10:46:06Z. A GET read
  back HTTP 404, and there is no organization-level fallback.
- No producer runs were queued or running. The dispatch token is unchanged.
  Building and publishing nightlies is unaffected; only Nomia notification
  stops.

GQ Content's producer pause has not been reported yet. Until it is, Content
completion events can still arrive. The paused workflow skips them.

## Live baseline (preserve it)

The last accepted activation deployed this snapshot:

- Site commit `0876e8a8534c35c7d0666758337cfe6ccbe7a742` (`main`).
- Snapshot commit `0749f2f5aa0a16dde34d484f768b4b6b0bc68c8e`. It was never
  pushed; it exists in the run's `snapshot.bundle`.
- GQ Design `v0.9.5-nightly.20261026.12.1` (source
  `8f890c471a40631634dc3f62e66a841a67c848f0`, ZIP sha256
  `a834c5c4d51eed3cd371accd5e988c418e24791531403658da5905f3eef5de2c`).
- GQ Content `v0.4.3-nightly.20261029.14.1`, both the CMS mu-plugin and the
  frontend `@getquick/content` package.
- Snapshot `apps/cms/composer.lock` sha256
  `02d58451c84a659245de7ebbba812aee2532f4b440edec8aa59292f3edabeb11`.
  `pnpm-lock.yaml` sha256
  `5d8bd833d4592f09f4c5f83cff99eafae7c9fd2c335007ca47f7529cde2b8b79`.
- Every other dependency, including gq-support `v0.1.10`, is `main`'s lock
  unchanged. The nightly guard rejects any other change.

The workflow artifacts `design-nightly-snapshot-41145930689-1` and
`design-nightly-result-41145930689-1` expire on 2027-01-28. Archive the
snapshot bundle before then. It is the byte-exact recovery source for this
baseline (see "Selection, rollback and recovery" in the nightly plan).

**The downgrade hazard.** `main` still locks stable GQ Design `0.9.4` and
GQ Content `0.4.2`, and the frontend pins `@getquick/content` `0.4.2`. A
`v*` tag on today's `main` would deploy those, which downgrades both the
CMS and the frontend below the live baseline. Don't tag until step 1 below
is done.

## Controlled release steps

1. **Adopt a stable baseline at or above the live nightlies.** Wait for
   stable GQ Design and GQ Content releases that contain everything in
   `v0.9.5-nightly.20261026.12.1` and `v0.4.3-nightly.20261029.14.1`. Their
   owners confirm that. Then adopt them in one reviewed PR that changes only
   those packages: the Composer constraint and lock, the frontend pin and
   `pnpm-lock.yaml`. Every other lock entry must stay byte-identical, as the
   nightly guard enforces.
   - Nightly ZIPs are never committed to `main`.
   - If no stable release can cover the nightlies, the user decides whether
     production stays on the snapshot. In that case, no release happens until
     one exists.
   - Coverage on 2026-10-31: no stable GQ Design release covers the live
     Design source `8f890c4`. The latest stable, `0.9.4`, lacks `68f280d`
     (editor canvas `2xl`). The Design session is preparing a covering
     stable release as a PR with tests, with no tag, publish, merge, deploy
     or re-enable. Content coverage is not yet assessed.
   - The Design release policy may require a new nightly, from the commit
     that prepares the stable release, to be tested on Nomia first. That is
     still being verified, and it is not approval to trial on production.
     Any Nomia trial of a candidate needs its own explicit, authoritative
     approval. It would run under the nightly reservation's exclusion steps,
     and nightlies stay off until then.
   - Keep three things separate. A controlled Design/Content trial or
     release on Nomia is one. The gq-support WordPress recovery drill on a
     real staging installation is another. The Banquinha dashboard E2E
     tests are a third. Passing one is no evidence for the others.
2. **Release validation.** Run the authenticated live editor acceptance
   checks against the release candidate before publishing. See
   [release validation](design-nightly-adoption.md#release-validation).
3. **Release.** The release is a `v*` tag (`pnpm push <fix|minor|major>`).
   Cloudflare CI's release step (`infra/ci`, `scripts/ci-release.mjs`) runs
   `gq ploi release` and then the frontend deploy. Only one release runs at a
   time, and only with nightly delivery paused.
4. **Verify after the deploy:**
   - the served `RELEASE` commit equals the tag;
   - the Ploi deploy status (`NOMIA_BNQ_DEPLOY_STATUS=success`);
   - the installed plugin versions match the released lock;
   - `gq frontend refresh` against `nomia.bnq.pt` completed.

## Single approved package updates (gq-support and others)

Each later package update is its own PR:

- `composer.json` changes only that package's constraint.
- The lock changes only that package's entry and `content-hash`. Every
  other entry must be byte-identical; reuse `assertUnchangedDependencies`
  from `scripts/design-nightly/model.mjs` with that one package allowed.
- The lock entry's version, and its Composer package commit
  (`source.reference` / `dist.reference`), must match the approved release.
- The Composer commit and tag are not the package's source-main commit.
  The release workflow publishes the assembled files to a separate Composer
  commit and tag. Record both identities.
- Prove the exact approved files and version. Don't compare ZIP bytes: the
  registry may repack the archive. The authoritative approval record that
  states which files and version are approved is still to be defined, by
  the GETQUICK platform (gq-site or its service). Until it exists, there is
  no Support production update. Don't invent a manifest format or a
  verification key.

With nightly delivery paused, merging such a PR to `main` deploys nothing.
It ships in the next controlled release.

**gq-support specifically.** The first signed gq-support release will be
`0.1.11`. Nomia's existing constraint `^0.1.3` already allows it, so the
update changes only the lock entry. `composer.json` stays as it is. A 0.2
line would pull in Design and theme versions that are on hold, and no 0.2
has been published. Until the approved controlled rollout, Nomia keeps its
current lock (gq-support `v0.1.10`) and the live nightlies.

No production key and no production update until both of these pass:

- The dashboard tests on Banquinha staging.
- A WordPress recovery drill on a real WordPress staging installation, not
  the dashboard Worker: install signed `0.1.11`, update to `0.1.12`, then
  recover to `0.1.11` using lock snapshots.

A recovery target must be an earlier verified signed release. "Signed"
means gq-support's authenticated plugin version and file claims. The target
also needs its served contract and compatibility with the live schema
proven. The unsigned `v0.1.10` that production has today is not an approved
recovery target.

## Recovery

- Roll back code by releasing the previous release's lock snapshot through
  the same release path.
- A database restore is not plugin rollback. It has its own ledger and
  maintenance procedure.
- Before step 1 lands, the only recovery for the live baseline is the
  run 41145930689 snapshot bundle, using the operator procedure in the
  nightly plan.
- The older stable lock checked in on `main` (Design 0.9.4, Content 0.4.2)
  is not a rollback target. Production has never run it together with
  today's schema and content, and deploying it would be a downgrade.

## Evidence to archive

These prove the live baseline. Workflow artifacts expire on 2027-01-28.
Archiving them is coordinated outside this repository.

- `design-nightly-snapshot-41145930689-1`: `snapshot.bundle`, which holds
  snapshot commit `0749f2f5…`, plus `deployment.json`.
- `design-nightly-result-41145930689-1`: the final `deployment.json`, with
  state `success` and the CMS and frontend completion times.
- GitHub deployment 7451160872, with its payload and statuses.
- The R2 release archive that `gq ploi release` uploaded for that
  deployment, under `nomia-bnq-releases/admin/`.

## Remaining controls

- `v*` tags still deploy through Cloudflare CI whatever the variable says.
  Don't push one until steps 1 and 2 are done. A switch that disables only
  deployments is a blueprint (gq-site) request.
- Ploi deployments from its UI or API, and local `pnpm ploi:release`, are
  human-controlled. Don't run them outside a controlled release.
- `main` has no branch protection. Pushes run the paused workflow, which
  skips.
- To resume nightlies, the user must decide again. Resuming means reverting
  `design-nightly.json` and setting the variable, which would put
  development builds back on production.
