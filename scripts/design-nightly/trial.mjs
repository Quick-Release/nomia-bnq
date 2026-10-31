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
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";
import { compareNightlies, hash, producers, snapshotComposer, validateManifest } from "./model.mjs";

export const TRIAL_KIND = "nomia-controlled-design-trial";
export const ROLLBACK_KIND = "nomia-controlled-design-trial-rollback";
export const ENVIRONMENT = "nomia-design-nightly";
export const SITE = "Quick-Release/nomia-bnq";
const SHA = /^[a-f0-9]{40}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const TERMINAL = ["success", "inactive", "failure", "error"];
const CMS = "apps/cms";
const DESIGN = producers.design.plugin;

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const saveJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
const gitBytes = (cwd, rev, path) =>
  execFileSync("git", ["show", `${rev}:${path}`], { cwd, maxBuffer: 256 * 1024 * 1024 });
const gitJson = (cwd, rev, path) => JSON.parse(gitBytes(cwd, rev, path).toString("utf8"));
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const identity = (value) => typeof value === "string" && value.trim() !== "";

function required(value, pattern, name) {
  if (typeof value !== "string" || !pattern.test(value)) throw new Error(`Invalid ${name}`);
  return value;
}

/**
 * Nomia as a paused production target: design-nightly.json explicitly
 * disabled for production, naming exactly the Site gq.ops.json describes.
 * Malformed, missing or offboarded configuration refuses.
 */
export function assertPausedProductionTarget(config, ops) {
  if (!isObject(config) || !isObject(ops) || !isObject(ops.domains) || !isObject(ops.ploi))
    throw new Error("Malformed nightly target or Site configuration");
  if (ops.offboarded !== undefined && ops.offboarded !== false) throw new Error("Offboarded Site");
  if (config.enabled !== false || config.siteState !== "production")
    throw new Error("design-nightly.json must be enabled: false, siteState: production");
  for (const [value, site] of [
    [config.adminDomain, ops.domains.admin],
    [config.frontendDomain, ops.domains.frontend],
    [config.ploiSiteId, ops.ploi.siteId],
  ])
    if (!identity(value) || !identity(site) || value !== site)
      throw new Error("design-nightly.json does not name this Site");
  if (!identity(ops.ploi.serverId)) throw new Error("gq.ops.json has no Ploi server");
}

/** The exact target a trial names, from gq.ops.json. */
export function siteTarget(ops) {
  return {
    admin: ops.domains.admin,
    frontend: ops.domains.frontend,
    ploiServerId: ops.ploi.serverId,
    ploiSiteId: ops.ploi.siteId,
    environment: "production",
  };
}

/** The identities a snapshot commit carries: lock digests and manifests. */
export function snapshotIdentity(checkout, rev = "HEAD") {
  return {
    snapshotSha: git(checkout, "rev-parse", `${rev}^{commit}`),
    composerLockSha256: hash(gitBytes(checkout, rev, `${CMS}/composer.lock`)),
    pnpmLockSha256: hash(gitBytes(checkout, rev, "pnpm-lock.yaml")),
    manifests: {
      design: gitJson(checkout, rev, `${CMS}/nightly/design-release.json`),
      content: gitJson(checkout, rev, `${CMS}/nightly/content-release.json`),
    },
  };
}

/** Fails unless the checkout's working tree equals HEAD exactly. */
export function assertClean(checkout) {
  if (git(checkout, "status", "--porcelain", "--untracked-files=all"))
    throw new Error("Snapshot checkout is not a clean commit");
}

/** Fails unless the baseline is exactly the expected live snapshot. */
export function assertBaseline(baseline, expected) {
  required(expected.snapshotSha, SHA, "expected snapshot");
  required(expected.composerLockSha256, SHA256, "expected Composer lock digest");
  required(expected.pnpmLockSha256, SHA256, "expected pnpm lock digest");
  if (baseline.snapshotSha !== expected.snapshotSha)
    throw new Error("Checkout is not the expected live snapshot");
  if (baseline.composerLockSha256 !== expected.composerLockSha256)
    throw new Error("Composer lock differs from the live snapshot");
  if (baseline.pnpmLockSha256 !== expected.pnpmLockSha256)
    throw new Error("pnpm lock differs from the live snapshot");
}

/** Replaces the Design inline package repository in place; others untouched. */
export function swapDesignRepository(composer, manifest, zipSha1) {
  const at = composer.repositories.findIndex(
    (r) => r.type === "package" && r.package?.name === DESIGN,
  );
  if (at < 0) throw new Error("Live snapshot has no Design package repository");
  const next = snapshotComposer(composer, manifest, zipSha1);
  return {
    ...next,
    repositories: composer.repositories.map((r, i) => (i === at ? next.repositories[0] : r)),
  };
}

// The lock without its Design entry and content-hash, for comparison.
const lockWithoutDesign = (lock) => ({
  ...lock,
  "content-hash": null,
  packages: (lock.packages ?? []).filter((p) => p.name !== DESIGN),
});

const offlineValidate = (cms) =>
  execFileSync("composer", ["validate", "--no-check-publish", "--no-check-all"], {
    cwd: cms,
    stdio: "ignore",
    env: { ...process.env, COMPOSER_DISABLE_NETWORK: "1", COMPOSER_AUTH: "" },
  });

/**
 * Verifies the committed trial snapshot against its baseline commit. HEAD
 * must be a clean single-commit child of the baseline that changes only
 * composer.json (the Design require and the Design repository, in place),
 * composer.lock (the Design entry and a content-hash Composer accepts),
 * design-release.json, the Design ZIP (old removed, new added) and
 * trial.json. Content, pnpm, the frontend, deploy/ and VERSION stay
 * byte-identical. Returns the candidate manifest.
 */
export function assertTrialSnapshot(checkout, baselineSha, { validate = offlineValidate } = {}) {
  assertClean(checkout);
  required(baselineSha, SHA, "baseline snapshot");
  if (git(checkout, "rev-parse", "HEAD^") !== baselineSha)
    throw new Error("Trial snapshot is not a single commit on its baseline");
  const base = snapshotIdentity(checkout, baselineSha);
  const m = gitJson(checkout, "HEAD", `${CMS}/nightly/design-release.json`);
  validateManifest(m, m.tag, m.sourceSha, producers.design);
  if (m.migrations.destructive) throw new Error("Destructive migration is not a trial");
  if (compareNightlies(m, base.manifests.design) <= 0)
    throw new Error("Candidate is not newer than the live Design nightly");

  const newZip = `${CMS}/nightly/${m.plugin.asset}`;
  const allowed = new Set([
    `M\t${CMS}/composer.json`,
    `M\t${CMS}/composer.lock`,
    `M\t${CMS}/nightly/design-release.json`,
    `A\t${CMS}/nightly/trial.json`,
    `D\t${CMS}/nightly/${base.manifests.design.plugin.asset}`,
    `A\t${newZip}`,
  ]);
  const delta = git(checkout, "diff", "--no-renames", "--name-status", baselineSha, "HEAD")
    .split("\n")
    .filter(Boolean);
  const unexpected = delta.filter((line) => !allowed.has(line));
  if (unexpected.length || delta.length !== allowed.size)
    throw new Error(`Trial changes outside Design: ${unexpected.join(", ") || "missing changes"}`);

  const zip = gitBytes(checkout, "HEAD", newZip);
  if (hash(zip) !== m.plugin.sha256) throw new Error("Plugin SHA256 mismatch");
  const zipSha1 = createHash("sha1").update(zip).digest("hex");
  const expectedComposer = swapDesignRepository(
    gitJson(checkout, baselineSha, `${CMS}/composer.json`),
    m,
    zipSha1,
  );
  if (!isDeepStrictEqual(gitJson(checkout, "HEAD", `${CMS}/composer.json`), expectedComposer))
    throw new Error("composer.json changes more than the Design require and repository");

  const before = gitJson(checkout, baselineSha, `${CMS}/composer.lock`);
  const after = gitJson(checkout, "HEAD", `${CMS}/composer.lock`);
  if (!isDeepStrictEqual(lockWithoutDesign(before), lockWithoutDesign(after)))
    throw new Error("composer.lock changes more than the Design entry");
  const locked = after.packages.find((p) => p.name === DESIGN);
  if (
    locked?.version !== m.plugin.composer.version ||
    locked.dist?.reference !== m.sourceSha ||
    locked.dist?.url !== `./nightly/${m.plugin.asset}` ||
    locked.dist?.shasum !== zipSha1
  )
    throw new Error("Incorrect Composer lock");
  try {
    validate(`${checkout}/${CMS}`);
  } catch {
    throw new Error("composer.lock content-hash does not match composer.json");
  }
  return m;
}

/** Fails unless trial.json describes exactly this snapshot and target. */
export function assertTrialRecord(trial, checkout, baselineSha, m, target) {
  const base = snapshotIdentity(checkout, baselineSha);
  const head = snapshotIdentity(checkout);
  const baseline = {
    snapshotSha: base.snapshotSha,
    composerLockSha256: base.composerLockSha256,
    pnpmLockSha256: base.pnpmLockSha256,
    design: { tag: base.manifests.design.tag, sourceSha: base.manifests.design.sourceSha },
    content: { tag: base.manifests.content.tag, sourceSha: base.manifests.content.sourceSha },
  };
  const candidate = {
    design: {
      tag: m.tag,
      sourceSha: m.sourceSha,
      pluginZipSha256: m.plugin.sha256,
      composerVersion: m.plugin.composer.version,
      migrationsDestructive: m.migrations.destructive,
    },
    composerLockSha256: head.composerLockSha256,
  };
  if (
    trial?.schemaVersion !== 1 ||
    trial.deploymentKind !== TRIAL_KIND ||
    !isDeepStrictEqual(trial.target, target) ||
    !isDeepStrictEqual(trial.baseline, baseline) ||
    !isDeepStrictEqual(trial.candidate, candidate) ||
    trial.rollback?.kind !== "code-only" ||
    trial.rollback?.snapshotSha !== base.snapshotSha ||
    trial.rollback?.databaseRestore !== false ||
    trial.nightlyReenable !== "forbidden"
  )
    throw new Error("trial.json does not match the trial snapshot");
}

const composerUpdate = (cms) =>
  execFileSync(
    "composer",
    [
      "update",
      DESIGN,
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

// Composer records the plugin API version of whichever Composer wrote the
// lock. Keep the baseline's, so the lock differs only in the Design entry and
// content-hash (Composer's content-hash doesn't cover this field).
export function keepPluginApiVersion(lockPath, baselineText) {
  const field = /"plugin-api-version": "[^"]*"/;
  const original = baselineText.match(field)?.[0];
  if (!original) return;
  const text = readFileSync(lockPath, "utf8");
  if (!field.test(text)) throw new Error("Composer lock lost its plugin-api-version");
  writeFileSync(lockPath, text.replace(field, original));
}

/** Builds, commits and verifies the trial snapshot. Returns its trial record. */
export function prepare(
  { checkout, designDir, sourceSha, expected, target },
  { update = composerUpdate, validate = offlineValidate } = {},
) {
  required(sourceSha, SHA, "Design source SHA");
  assertClean(checkout);
  const baseline = snapshotIdentity(checkout);
  assertBaseline(baseline, expected);
  const m = readJson(`${designDir}/design-release.json`);
  validateManifest(m, m.tag, sourceSha, producers.design);
  if (m.migrations.destructive) throw new Error("Destructive migration is not a trial");
  if (compareNightlies(m, baseline.manifests.design) <= 0)
    throw new Error("Candidate is not newer than the live Design nightly");
  const zip = readFileSync(`${designDir}/${m.plugin.asset}`);
  if (hash(zip) !== m.plugin.sha256) throw new Error("Plugin SHA256 mismatch");

  const cms = `${checkout}/${CMS}`;
  const zipSha1 = createHash("sha1").update(zip).digest("hex");
  saveJson(
    `${cms}/composer.json`,
    swapDesignRepository(readJson(`${cms}/composer.json`), m, zipSha1),
  );
  rmSync(`${cms}/nightly/${baseline.manifests.design.plugin.asset}`);
  copyFileSync(`${designDir}/${m.plugin.asset}`, `${cms}/nightly/${m.plugin.asset}`);
  copyFileSync(`${designDir}/design-release.json`, `${cms}/nightly/design-release.json`);
  const lockBefore = readFileSync(`${cms}/composer.lock`, "utf8");
  update(cms);
  keepPluginApiVersion(`${cms}/composer.lock`, lockBefore);

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
  git(checkout, "add", "-A", "-f", "--", CMS);
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
  assertTrialSnapshot(checkout, baseline.snapshotSha, { validate });
  assertTrialRecord(record, checkout, baseline.snapshotSha, m, target);
  return { ...record, snapshotSha: git(checkout, "rev-parse", "HEAD") };
}

/** The ledger payload for a trial or rollback, from a verified checkout. */
export function recordPayload({ kind, identity: id, mainSha, trialDeploymentId, baseline }) {
  if (![TRIAL_KIND, ROLLBACK_KIND].includes(kind)) throw new Error("Unknown record kind");
  required(mainSha, SHA, "main SHA");
  required(id.snapshotSha, SHA, "snapshot SHA");
  if (kind === ROLLBACK_KIND && !(Number.isSafeInteger(trialDeploymentId) && trialDeploymentId > 0))
    throw new Error("A rollback names the trial deployment it reverses");
  for (const name of ["design", "content"])
    validateManifest(
      id.manifests[name],
      id.manifests[name].tag,
      id.manifests[name].sourceSha,
      producers[name],
    );
  return {
    schemaVersion: 1,
    deploymentKind: kind,
    siteSha: mainSha,
    snapshotSha: id.snapshotSha,
    composerLockSha256: id.composerLockSha256,
    pnpmLockSha256: id.pnpmLockSha256,
    manifests: id.manifests,
    frontendDeployment: false,
    ...(kind === TRIAL_KIND ? { baseline } : { trialDeploymentId }),
  };
}

// The newest successful record that names a deployed snapshot: what is live.
const effectiveSnapshot = (history) =>
  history.find((entry) => entry.state === "success" && SHA.test(entry.payload?.snapshotSha ?? ""));

/**
 * Starts a durable ledger record. It refuses unless Nomia is a paused
 * production target (design-nightly.json, and the repository variable
 * exactly "false"), main is exactly `mainSha`, and no earlier record is
 * unresolved. A trial's baseline must be the ledger's live snapshot, and its
 * committed snapshot and trial.json pass the same checks as `prepare`. A
 * rollback must name a recorded trial and check out that trial's baseline.
 */
export async function startRecord(
  { kind, checkout, mainSha, trialDeploymentId },
  {
    api,
    deploymentHistory,
    site = process.env.GITHUB_REPOSITORY ?? SITE,
    root = process.cwd(),
    validate = offlineValidate,
  },
) {
  if (site !== SITE) throw new Error("Expected the Nomia repository");
  if (![TRIAL_KIND, ROLLBACK_KIND].includes(kind)) throw new Error("Unknown record kind");
  const ops = readJson(`${root}/gq.ops.json`);
  assertPausedProductionTarget(readJson(`${root}/design-nightly.json`), ops);
  let variable;
  try {
    variable = await api(`${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`);
  } catch (error) {
    throw new Error(`DESIGN_NIGHTLY_ENABLED is unreadable: ${error?.message ?? error}`);
  }
  if (variable?.value !== "false")
    throw new Error("DESIGN_NIGHTLY_ENABLED must be exactly false for a controlled trial");
  const main = await api(`${site}/branches/main`);
  if (main?.commit?.sha !== required(mainSha, SHA, "main SHA"))
    throw new Error("main moved; bind the record to the current main commit");

  assertClean(checkout);
  const history = await deploymentHistory(site);
  for (const { id, state } of history)
    if (!TERMINAL.includes(state))
      throw new Error(`Unresolved deployment ${id}; reconcile Ploi before another record`);

  const id = snapshotIdentity(checkout);
  let baseline;
  if (kind === TRIAL_KIND) {
    const live = effectiveSnapshot(history);
    if (!live) throw new Error("The ledger names no live snapshot");
    const baselineSha = live.payload.snapshotSha;
    const m = assertTrialSnapshot(checkout, baselineSha, { validate });
    const trial = gitJson(checkout, "HEAD", `${CMS}/nightly/trial.json`);
    assertTrialRecord(trial, checkout, baselineSha, m, siteTarget(ops));
    baseline = { snapshotSha: baselineSha, composerLockSha256: trial.baseline.composerLockSha256 };
  } else {
    const reversed = history.find((entry) => entry.id === trialDeploymentId);
    if (reversed?.payload?.deploymentKind !== TRIAL_KIND)
      throw new Error("Rollback must name a recorded controlled trial");
    if (
      id.snapshotSha !== reversed.payload.baseline?.snapshotSha ||
      id.composerLockSha256 !== reversed.payload.baseline?.composerLockSha256
    )
      throw new Error("Rollback checkout is not the trial's recorded baseline");
  }
  const payload = recordPayload({ kind, identity: id, mainSha, trialDeploymentId, baseline });
  const deployment = await api(`${site}/deployments`, {
    ref: mainSha,
    environment: ENVIRONMENT,
    task: "deploy",
    auto_merge: false,
    required_contexts: [],
    description: `${kind}: Design ${id.manifests.design.tag}`,
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
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid deployment id");
  if (!["success", "error", "failure"].includes(state)) throw new Error("Invalid final state");
  if (typeof description !== "string" || !description.trim())
    throw new Error("A final state needs a description");
  const deployment = await api(`${site}/deployments/${id}`);
  const p = deployment?.payload;
  if (
    deployment?.id !== id ||
    deployment.environment !== ENVIRONMENT ||
    ![TRIAL_KIND, ROLLBACK_KIND].includes(p?.deploymentKind) ||
    p.schemaVersion !== 1 ||
    p.frontendDeployment !== false ||
    !SHA.test(p.snapshotSha ?? "") ||
    !SHA.test(p.siteSha ?? "") ||
    deployment.ref !== p.siteSha
  )
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
    if (!argv[i].startsWith("--") || argv[i + 1] === undefined)
      throw new Error(`Unexpected argument ${argv[i]}`);
    result[argv[i].slice(2)] = argv[i + 1];
  }
  return result;
}

const positiveId = (value) => (/^[1-9]\d*$/.test(value ?? "") ? Number(value) : Number.NaN);

async function main(argv) {
  const [command, ...rest] = argv;
  if (command === "prepare") {
    const o = options(rest);
    const ops = readJson("gq.ops.json");
    assertPausedProductionTarget(readJson("design-nightly.json"), ops);
    const record = prepare({
      checkout: o.checkout,
      designDir: o["design-dir"],
      sourceSha: o["source-sha"],
      expected: {
        snapshotSha: o["expected-snapshot"],
        composerLockSha256: o["expected-composer-lock"],
        pnpmLockSha256: o["expected-pnpm-lock"],
      },
      target: siteTarget(ops),
    });
    console.log(JSON.stringify(record, null, 2));
    return;
  }
  if (command === "record") {
    const [action, ...more] = rest;
    const o = options(more);
    if (!process.env.GH_TOKEN || !process.env.SITE_GH_TOKEN)
      throw new Error("GH_TOKEN and SITE_GH_TOKEN are required");
    const { api, deploymentHistory } = await import("./github.mjs");
    if (action === "start") {
      const kind = { trial: TRIAL_KIND, rollback: ROLLBACK_KIND }[o.kind];
      if (!kind) throw new Error("--kind trial|rollback");
      const result = await startRecord(
        {
          kind,
          checkout: o.checkout,
          mainSha: o["main-sha"],
          trialDeploymentId: kind === ROLLBACK_KIND ? positiveId(o["trial-deployment"]) : undefined,
        },
        { api, deploymentHistory },
      );
      console.log(JSON.stringify({ id: result.id, kind, snapshotSha: result.payload.snapshotSha }));
      return;
    }
    if (action === "finish") {
      const result = await finishRecord(
        { id: positiveId(o.id), state: o.state, description: o.description },
        { api },
      );
      console.log(JSON.stringify(result));
      return;
    }
  }
  throw new Error("Usage: trial.mjs prepare … | record start … | record finish …");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href)
  await main(process.argv.slice(2));
