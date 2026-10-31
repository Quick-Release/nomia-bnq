// A one-off controlled GQ Design trial on paused production Nomia
// (docs/plans/controlled-release.md). Two parts, and neither one deploys:
//
//   prepare  Offline. From a clone of the live snapshot bundle, swap only
//            GQ Design for an exact verified nightly. Commit the trial
//            snapshot with apps/cms/nightly/trial.json. No secrets and no
//            network (Composer runs with COMPOSER_DISABLE_NETWORK=1).
//   record   GitHub ledger only. Start a durable deployment record in
//            nomia-design-nightly, or finish one. It must never run live
//            without the user's approval of the trial.
//
// The operator deploys separately, after approval:
// `gq ploi release --ref <snapshot> --git-dir <checkout>`.
//
//   node scripts/design-nightly/trial.mjs prepare --checkout DIR --design-dir DIR \
//     --source-sha SHA --expected-snapshot SHA --expected-composer-lock SHA256 \
//     --expected-pnpm-lock SHA256
//   node scripts/design-nightly/trial.mjs record start --kind trial|rollback \
//     --checkout DIR --main-sha SHA [--trial-deployment ID]
//   node scripts/design-nightly/trial.mjs record finish --id ID \
//     --state success|error|failure --description TEXT
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  assertUnchangedDependencies,
  compareNightlies,
  hash,
  nightlyTargetEnabled,
  producers,
  snapshotComposer,
  validateManifest,
} from "./model.mjs";

export const TRIAL_KIND = "nomia-controlled-design-trial";
export const ROLLBACK_KIND = "nomia-controlled-design-trial-rollback";
export const ENVIRONMENT = "nomia-design-nightly";
export const SITE = "Quick-Release/nomia-bnq";
const SHA = /^[a-f0-9]{40}$/;
const SHA256 = /^[a-f0-9]{64}$/;
// Paths a trial snapshot may change relative to the live snapshot.
const TRIAL_PATHS = /^apps\/cms\/(composer\.json|composer\.lock|nightly\/.+)$/;
const TERMINAL = ["success", "inactive", "failure", "error"];

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const saveJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function required(value, pattern, name) {
  if (typeof value !== "string" || !pattern.test(value)) throw new Error(`Invalid ${name}`);
  return value;
}

/** The identities a snapshot checkout carries: HEAD, lock digests, manifests. */
export function snapshotIdentity(checkout) {
  const cms = `${checkout}/apps/cms`;
  return {
    snapshotSha: git(checkout, "rev-parse", "HEAD"),
    composerLockSha256: hash(readFileSync(`${cms}/composer.lock`)),
    pnpmLockSha256: hash(readFileSync(`${checkout}/pnpm-lock.yaml`)),
    manifests: {
      design: readJson(`${cms}/nightly/design-release.json`),
      content: readJson(`${cms}/nightly/content-release.json`),
    },
  };
}

/** Fails unless the checkout is exactly the expected live snapshot. */
export function assertBaseline(identity, expected) {
  required(expected.snapshotSha, SHA, "expected snapshot");
  required(expected.composerLockSha256, SHA256, "expected Composer lock digest");
  required(expected.pnpmLockSha256, SHA256, "expected pnpm lock digest");
  if (identity.snapshotSha !== expected.snapshotSha)
    throw new Error("Checkout is not the expected live snapshot");
  if (identity.composerLockSha256 !== expected.composerLockSha256)
    throw new Error("Composer lock differs from the live snapshot");
  if (identity.pnpmLockSha256 !== expected.pnpmLockSha256)
    throw new Error("pnpm lock differs from the live snapshot");
}

/** Replaces the Design inline package repository in place; others untouched. */
export function swapDesignRepository(composer, manifest, zipSha1) {
  const at = composer.repositories.findIndex(
    (r) => r.type === "package" && r.package?.name === producers.design.plugin,
  );
  if (at < 0) throw new Error("Live snapshot has no Design package repository");
  const next = snapshotComposer(composer, manifest, zipSha1);
  return {
    ...next,
    repositories: composer.repositories.map((r, i) => (i === at ? next.repositories[0] : r)),
  };
}

/** Fails unless only the Design lock entry changed and it is the candidate. */
export function assertTrialLock(before, after, manifest) {
  assertUnchangedDependencies(before, after, [producers.design.plugin]);
  const locked = after.packages.find((p) => p.name === producers.design.plugin);
  if (
    locked?.version !== manifest.plugin.composer.version ||
    locked.dist?.reference !== manifest.sourceSha ||
    locked.dist?.url !== `./nightly/${manifest.plugin.asset}`
  )
    throw new Error("Incorrect Composer lock");
}

/** Fails unless every changed path is a Composer file or a nightly artifact. */
export function assertTrialPaths(paths) {
  const outside = paths.filter((p) => !TRIAL_PATHS.test(p));
  if (outside.length) throw new Error(`Trial changes paths outside Design: ${outside.join(", ")}`);
}

const composerUpdate = (cms) =>
  execFileSync(
    "composer",
    [
      "update",
      producers.design.plugin,
      "--no-install",
      "--no-scripts",
      "--no-plugins",
      "--no-interaction",
      "--minimal-changes",
    ],
    {
      cwd: cms,
      stdio: "inherit",
      env: { ...process.env, COMPOSER_DISABLE_NETWORK: "1", COMPOSER_AUTH: "" },
    },
  );

/** Builds and commits the trial snapshot. Returns its trial record. */
export function prepare(
  { checkout, designDir, sourceSha, expected, target },
  { update = composerUpdate } = {},
) {
  required(sourceSha, SHA, "Design source SHA");
  const baseline = snapshotIdentity(checkout);
  assertBaseline(baseline, expected);
  const m = readJson(`${designDir}/design-release.json`);
  validateManifest(m, m.tag, sourceSha, producers.design);
  if (m.migrations.destructive) throw new Error("Destructive migration is not a trial");
  if (compareNightlies(m, baseline.manifests.design) <= 0)
    throw new Error("Candidate is not newer than the live Design nightly");
  const zip = readFileSync(`${designDir}/${m.plugin.asset}`);
  if (hash(zip) !== m.plugin.sha256) throw new Error("Plugin SHA256 mismatch");

  const cms = `${checkout}/apps/cms`;
  const before = readJson(`${cms}/composer.lock`);
  const zipSha1 = createHash("sha1").update(zip).digest("hex");
  saveJson(
    `${cms}/composer.json`,
    swapDesignRepository(readJson(`${cms}/composer.json`), m, zipSha1),
  );
  rmSync(`${cms}/nightly/${baseline.manifests.design.plugin.asset}`);
  copyFileSync(`${designDir}/${m.plugin.asset}`, `${cms}/nightly/${m.plugin.asset}`);
  copyFileSync(`${designDir}/design-release.json`, `${cms}/nightly/design-release.json`);
  update(cms);
  const after = readJson(`${cms}/composer.lock`);
  assertTrialLock(before, after, m);

  const record = {
    schemaVersion: 1,
    deploymentKind: TRIAL_KIND,
    status: "prepared-not-approved",
    target,
    baseline: {
      snapshotSha: baseline.snapshotSha,
      composerLockSha256: baseline.composerLockSha256,
      pnpmLockSha256: baseline.pnpmLockSha256,
      design: {
        tag: baseline.manifests.design.tag,
        sourceSha: baseline.manifests.design.sourceSha,
      },
      content: {
        tag: baseline.manifests.content.tag,
        sourceSha: baseline.manifests.content.sourceSha,
      },
    },
    candidate: {
      design: {
        tag: m.tag,
        sourceSha: m.sourceSha,
        pluginZipSha256: m.plugin.sha256,
        composerVersion: m.plugin.composer.version,
        migrationsDestructive: m.migrations.destructive,
      },
      composerLockSha256: hash(readFileSync(`${cms}/composer.lock`)),
    },
    rollback: { kind: "code-only", snapshotSha: baseline.snapshotSha, databaseRestore: false },
    nightlyReenable: "forbidden",
  };
  saveJson(`${cms}/nightly/trial.json`, record);
  git(
    checkout,
    "add",
    "-f",
    "apps/cms/composer.json",
    "apps/cms/composer.lock",
    "apps/cms/nightly",
  );
  const staged = git(checkout, "diff", "--cached", "--name-only").split("\n").filter(Boolean);
  assertTrialPaths(staged);
  const unstaged = git(checkout, "diff", "--name-only") + git(checkout, "ls-files", "--others");
  if (unstaged) throw new Error("Trial checkout has changes outside the staged trial");
  git(
    checkout,
    "-c",
    "user.name=Nomia trial",
    "-c",
    "user.email=nightly@getquick.io",
    "-c",
    "core.hooksPath=/dev/null",
    "commit",
    "--quiet",
    "-m",
    `Nomia Design trial ${m.tag} on snapshot ${baseline.snapshotSha.slice(0, 12)}`,
  );
  return { ...record, snapshotSha: git(checkout, "rev-parse", "HEAD") };
}

/** The ledger payload for a trial or rollback, from a verified checkout. */
export function recordPayload({ kind, identity, mainSha, trialDeploymentId, baseline }) {
  if (![TRIAL_KIND, ROLLBACK_KIND].includes(kind)) throw new Error("Unknown record kind");
  required(mainSha, SHA, "main SHA");
  required(identity.snapshotSha, SHA, "snapshot SHA");
  if (kind === ROLLBACK_KIND && !Number.isSafeInteger(trialDeploymentId))
    throw new Error("A rollback names the trial deployment it reverses");
  for (const name of ["design", "content"])
    validateManifest(
      identity.manifests[name],
      identity.manifests[name].tag,
      identity.manifests[name].sourceSha,
      producers[name],
    );
  return {
    schemaVersion: 1,
    deploymentKind: kind,
    siteSha: mainSha,
    snapshotSha: identity.snapshotSha,
    composerLockSha256: identity.composerLockSha256,
    pnpmLockSha256: identity.pnpmLockSha256,
    manifests: identity.manifests,
    frontendDeployment: false,
    ...(kind === TRIAL_KIND ? { baseline } : { trialDeploymentId }),
  };
}

/**
 * Starts a durable ledger record. It refuses unless the nightly path is
 * paused, main is exactly `mainSha`, and no earlier record is unresolved.
 * `trial.json` must match the checkout for a trial; a rollback checkout must
 * be the trial's recorded baseline.
 */
export async function startRecord(
  { kind, checkout, mainSha, trialDeploymentId },
  { api, deploymentHistory, site = process.env.GITHUB_REPOSITORY ?? SITE, root = process.cwd() },
) {
  if (site !== SITE) throw new Error("Expected the Nomia repository");
  const ops = readJson(`${root}/gq.ops.json`);
  if (nightlyTargetEnabled(readJson(`${root}/design-nightly.json`), ops))
    throw new Error("Nightly delivery is enabled; a controlled trial needs it paused");
  let enabled;
  try {
    enabled = (await api(`${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`)).value;
  } catch (error) {
    if (!/GitHub 404/.test(String(error?.message))) throw error;
  }
  if (enabled !== undefined && enabled !== "false")
    throw new Error("DESIGN_NIGHTLY_ENABLED must be false for a controlled trial");
  const main = await api(`${site}/branches/main`);
  if (main?.commit?.sha !== required(mainSha, SHA, "main SHA"))
    throw new Error("main moved; bind the record to the current main commit");

  const identity = snapshotIdentity(checkout);
  let baseline;
  if (kind === TRIAL_KIND) {
    const trial = readJson(`${checkout}/apps/cms/nightly/trial.json`);
    if (
      trial.deploymentKind !== TRIAL_KIND ||
      trial.target?.admin !== ops.domains.admin ||
      trial.target?.ploiSiteId !== ops.ploi.siteId ||
      trial.candidate?.composerLockSha256 !== identity.composerLockSha256 ||
      trial.candidate?.design?.tag !== identity.manifests.design.tag ||
      trial.candidate?.design?.sourceSha !== identity.manifests.design.sourceSha ||
      trial.baseline?.content?.tag !== identity.manifests.content.tag
    )
      throw new Error("trial.json does not match the trial checkout");
    if (git(checkout, "rev-parse", "HEAD^") !== trial.baseline.snapshotSha)
      throw new Error("Trial snapshot is not a child of its recorded baseline");
    baseline = {
      snapshotSha: trial.baseline.snapshotSha,
      composerLockSha256: trial.baseline.composerLockSha256,
    };
  }

  const history = await deploymentHistory(site);
  for (const { id, state } of history)
    if (!TERMINAL.includes(state))
      throw new Error(`Unresolved deployment ${id}; reconcile Ploi before another record`);
  if (kind === ROLLBACK_KIND) {
    const reversed = history.find((entry) => entry.id === trialDeploymentId);
    if (reversed?.payload?.deploymentKind !== TRIAL_KIND)
      throw new Error("Rollback must name a recorded controlled trial");
    if (
      identity.snapshotSha !== reversed.payload.baseline?.snapshotSha ||
      identity.composerLockSha256 !== reversed.payload.baseline?.composerLockSha256
    )
      throw new Error("Rollback checkout is not the trial's recorded baseline");
  }
  const payload = recordPayload({ kind, identity, mainSha, trialDeploymentId, baseline });
  const deployment = await api(`${site}/deployments`, {
    ref: mainSha,
    environment: ENVIRONMENT,
    task: "deploy",
    auto_merge: false,
    required_contexts: [],
    description: `${kind}: Design ${identity.manifests.design.tag}`,
    transient_environment: false,
    production_environment: true,
    payload,
  });
  if (!Number.isSafeInteger(deployment?.id) || deployment.environment !== ENVIRONMENT)
    throw new Error("GitHub did not create the deployment record");
  await api(`${site}/deployments/${deployment.id}/statuses`, {
    state: "in_progress",
    auto_inactive: false,
    description: `${kind} started`,
  });
  return { id: deployment.id, payload };
}

/** Finishes a started record: success, error or failure. */
export async function finishRecord(
  { id, state, description },
  { api, site = process.env.GITHUB_REPOSITORY ?? SITE },
) {
  if (site !== SITE) throw new Error("Expected the Nomia repository");
  if (!["success", "error", "failure"].includes(state)) throw new Error("Invalid final state");
  if (typeof description !== "string" || !description.trim())
    throw new Error("A final state needs a description");
  const deployment = await api(`${site}/deployments/${id}`);
  if (![TRIAL_KIND, ROLLBACK_KIND].includes(deployment?.payload?.deploymentKind))
    throw new Error("Not a controlled trial record");
  const statuses = await api(`${site}/deployments/${id}/statuses?per_page=1`);
  if (statuses?.[0]?.state !== "in_progress")
    throw new Error("Only an in-progress record can be finished");
  await api(`${site}/deployments/${id}/statuses`, {
    state,
    auto_inactive: false,
    description: description.slice(0, 140),
  });
  return { id, state };
}

function options(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i].startsWith("--")) throw new Error(`Unexpected argument ${argv[i]}`);
    result[argv[i].slice(2)] = argv[i + 1];
  }
  return result;
}

async function main(argv) {
  const [command, ...rest] = argv;
  if (command === "prepare") {
    const o = options(rest);
    const ops = readJson("gq.ops.json");
    const record = prepare({
      checkout: o.checkout,
      designDir: o["design-dir"],
      sourceSha: o["source-sha"],
      expected: {
        snapshotSha: o["expected-snapshot"],
        composerLockSha256: o["expected-composer-lock"],
        pnpmLockSha256: o["expected-pnpm-lock"],
      },
      target: {
        admin: ops.domains.admin,
        frontend: ops.domains.frontend,
        ploiServerId: ops.ploi.serverId,
        ploiSiteId: ops.ploi.siteId,
        environment: "production",
      },
    });
    console.log(JSON.stringify(record, null, 2));
    return;
  }
  if (command === "record") {
    const [action, ...more] = rest;
    const o = options(more);
    const { api, deploymentHistory } = await import("./github.mjs");
    if (!process.env.GH_TOKEN || !process.env.SITE_GH_TOKEN)
      throw new Error("GH_TOKEN and SITE_GH_TOKEN are required");
    if (action === "start") {
      const kind = { trial: TRIAL_KIND, rollback: ROLLBACK_KIND }[o.kind];
      if (!kind) throw new Error("--kind trial|rollback");
      const result = await startRecord(
        {
          kind,
          checkout: o.checkout,
          mainSha: o["main-sha"],
          trialDeploymentId: o["trial-deployment"] ? Number(o["trial-deployment"]) : undefined,
        },
        { api, deploymentHistory },
      );
      console.log(JSON.stringify({ id: result.id, kind, snapshotSha: result.payload.snapshotSha }));
      return;
    }
    if (action === "finish") {
      console.log(
        JSON.stringify(
          await finishRecord(
            { id: Number(o.id), state: o.state, description: o.description },
            { api },
          ),
        ),
      );
      return;
    }
  }
  throw new Error("Usage: trial.mjs prepare … | record start … | record finish …");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href)
  await main(process.argv.slice(2));
