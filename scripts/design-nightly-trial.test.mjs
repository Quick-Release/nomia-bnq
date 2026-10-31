import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ENVIRONMENT,
  ROLLBACK_KIND,
  TRIAL_KIND,
  assertTrialPaths,
  finishRecord,
  prepare,
  snapshotIdentity,
  startRecord,
} from "./design-nightly/trial.mjs";

const ops = JSON.parse(readFileSync("gq.ops.json", "utf8"));
const target = {
  admin: ops.domains.admin,
  frontend: ops.domains.frontend,
  ploiServerId: ops.ploi.serverId,
  ploiSiteId: ops.ploi.siteId,
  environment: "production",
};
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const save = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const git = (cwd, ...args) =>
  execFileSync(
    "git",
    [
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.test",
      "-c",
      "commit.gpgsign=false",
      "-c",
      "core.hooksPath=/dev/null",
      ...args,
    ],
    { cwd, encoding: "utf8", env: cleanEnv() },
  ).trim();
function cleanEnv() {
  return Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")),
  );
}

function designManifest({ sequence, date, base, sourceSha, zip }) {
  const version = `${base}-nightly.${date}.${sequence}.1`;
  return {
    schemaVersion: 1,
    migrations: { destructive: false },
    channel: "nightly",
    version,
    tag: `v${version}`,
    sourceSha,
    sequence,
    attempt: 1,
    plugin: {
      name: "getquick/gq-design",
      asset: `gq-design-${version}.zip`,
      sha256: sha256(zip),
      composer: {
        name: "getquick/gq-design",
        type: "wordpress-plugin",
        version: `dev-nightly-${date}.${sequence}.1`,
      },
    },
    packages: ["@quick-release/design-contract", "@quick-release/design-renderer"].map((name) => ({
      name,
      version,
      asset: `${name.split("/")[1]}.tgz`,
      sha256: "c".repeat(64),
      integrity: "sha512-abc",
    })),
  };
}
function contentManifest(zip) {
  const version = "0.4.3-nightly.20261029.14.1";
  return {
    schemaVersion: 1,
    migrations: { destructive: false },
    channel: "nightly",
    version,
    tag: `v${version}`,
    sourceSha: "e".repeat(40),
    sequence: 14,
    attempt: 1,
    plugin: {
      name: "getquick/gq-content",
      asset: `content-nightly-${version}.zip`,
      sha256: sha256(zip),
      composer: {
        name: "getquick/gq-content",
        type: "wordpress-muplugin",
        version: "dev-nightly-20261029.14.1",
      },
    },
    packages: [
      {
        name: "@getquick/content",
        version,
        asset: `getquick-content-${version}.tgz`,
        sha256: "d".repeat(64),
        integrity: "sha512-def",
      },
    ],
  };
}
const inlinePackage = (m) => ({
  type: "package",
  package: {
    name: m.plugin.name,
    version: m.plugin.composer.version,
    type: m.plugin.composer.type,
    dist: { type: "zip", url: `./nightly/${m.plugin.asset}`, reference: m.sourceSha },
  },
});
const lockEntry = (m) => ({
  name: m.plugin.name,
  version: m.plugin.composer.version,
  type: m.plugin.composer.type,
  dist: { type: "zip", url: `./nightly/${m.plugin.asset}`, reference: m.sourceSha },
});

// A live-snapshot-shaped checkout, plus a candidate Design directory.
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "nomia-trial-"));
  const checkout = join(root, "checkout");
  const candidateDir = join(root, "candidate");
  const cms = join(checkout, "apps/cms");
  mkdirSync(join(cms, "nightly"), { recursive: true });
  mkdirSync(candidateDir);
  const liveZip = Buffer.from("live design zip");
  const contentZip = Buffer.from("content zip");
  const candidateZip = Buffer.from("candidate design zip");
  const live = designManifest({
    sequence: 12,
    date: "20261026",
    base: "0.9.5",
    sourceSha: "8".repeat(40),
    zip: liveZip,
  });
  const content = contentManifest(contentZip);
  const candidate = designManifest({
    sequence: 13,
    date: "20261031",
    base: "0.9.6",
    sourceSha: "c".repeat(40),
    zip: candidateZip,
  });
  save(join(cms, "composer.json"), {
    name: "fixture/cms",
    repositories: [
      inlinePackage(content),
      inlinePackage(live),
      { name: "getquick", type: "composer", url: "https://proxy.composer.getquick.io" },
    ],
    require: {
      "getquick/gq-content": content.plugin.composer.version,
      "getquick/gq-design": live.plugin.composer.version,
      "roots/wordpress": "7.1.4",
    },
  });
  save(join(cms, "composer.lock"), {
    "content-hash": "before",
    packages: [
      lockEntry(content),
      lockEntry(live),
      { name: "roots/wordpress", version: "7.1.4", type: "metapackage" },
    ],
    "packages-dev": [],
  });
  save(join(cms, "nightly/design-release.json"), live);
  save(join(cms, "nightly/content-release.json"), content);
  writeFileSync(join(cms, "nightly", live.plugin.asset), liveZip);
  writeFileSync(join(cms, "nightly", content.plugin.asset), contentZip);
  writeFileSync(join(checkout, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  git(root, "init", "--quiet", "--template=", checkout);
  git(checkout, "add", "-A");
  git(checkout, "commit", "--quiet", "-m", "live snapshot");
  save(join(candidateDir, "design-release.json"), candidate);
  writeFileSync(join(candidateDir, candidate.plugin.asset), candidateZip);
  const identity = snapshotIdentity(checkout);
  const expected = {
    snapshotSha: identity.snapshotSha,
    composerLockSha256: identity.composerLockSha256,
    pnpmLockSha256: identity.pnpmLockSha256,
  };
  return { root, checkout, candidateDir, candidate, expected };
}

// Stands in for `composer update getquick/gq-design --no-install`.
const fakeUpdate =
  (m, { collateral = false } = {}) =>
  (cms) => {
    const path = join(cms, "composer.lock");
    const lock = JSON.parse(readFileSync(path, "utf8"));
    lock["content-hash"] = "after";
    lock.packages = lock.packages.map((p) =>
      p.name === m.plugin.name
        ? lockEntry(m)
        : collateral && p.name === "roots/wordpress"
          ? { ...p, version: "7.1.5" }
          : p,
    );
    save(path, lock);
  };

test("prepare swaps only GQ Design on the live snapshot and records the trial", () => {
  const f = fixture();
  try {
    const record = prepare(
      {
        checkout: f.checkout,
        designDir: f.candidateDir,
        sourceSha: f.candidate.sourceSha,
        expected: f.expected,
        target,
      },
      { update: fakeUpdate(f.candidate) },
    );
    assert.equal(record.deploymentKind, TRIAL_KIND);
    assert.equal(record.baseline.snapshotSha, f.expected.snapshotSha);
    assert.equal(record.candidate.design.tag, f.candidate.tag);
    assert.equal(record.rollback.databaseRestore, false);
    assert.equal(git(f.checkout, "rev-parse", "HEAD^"), f.expected.snapshotSha);
    const changed = git(f.checkout, "diff", "--name-only", "HEAD^", "HEAD").split("\n");
    assert.deepEqual(
      changed.sort(),
      [
        "apps/cms/composer.json",
        "apps/cms/composer.lock",
        "apps/cms/nightly/design-release.json",
        `apps/cms/nightly/${f.candidate.plugin.asset}`,
        "apps/cms/nightly/gq-design-0.9.5-nightly.20261026.12.1.zip",
        "apps/cms/nightly/trial.json",
      ].sort(),
    );
    const composer = JSON.parse(readFileSync(join(f.checkout, "apps/cms/composer.json"), "utf8"));
    // Content's inline repository keeps its place; Design's is replaced in place.
    assert.deepEqual(
      composer.repositories.map((r) => r.package?.name ?? r.name),
      ["getquick/gq-content", "getquick/gq-design", "getquick"],
    );
    assert.equal(composer.require["getquick/gq-content"], "dev-nightly-20261029.14.1");
    assert.equal(snapshotIdentity(f.checkout).pnpmLockSha256, f.expected.pnpmLockSha256);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test("prepare refuses a different baseline, collateral changes and older candidates", () => {
  const cases = [
    [
      (f) => ({ expected: { ...f.expected, snapshotSha: "1".repeat(40) } }),
      /expected live snapshot/,
    ],
    [(f) => ({ expected: { ...f.expected, composerLockSha256: "2".repeat(64) } }), /Composer lock/],
    [(f) => ({ update: fakeUpdate(f.candidate, { collateral: true }) }), /other than selected/],
    [(f) => ({ sourceSha: "f".repeat(40) }), /Invalid nightly identity/],
  ];
  for (const [change, error] of cases) {
    const f = fixture();
    try {
      const o = change(f);
      assert.throws(
        () =>
          prepare(
            {
              checkout: f.checkout,
              designDir: f.candidateDir,
              sourceSha: o.sourceSha ?? f.candidate.sourceSha,
              expected: o.expected ?? f.expected,
              target,
            },
            { update: o.update ?? fakeUpdate(f.candidate) },
          ),
        error,
      );
    } finally {
      rmSync(f.root, { recursive: true, force: true });
    }
  }
  // The live Design nightly itself is not newer than the live Design nightly.
  const f = fixture();
  try {
    const live = JSON.parse(
      readFileSync(join(f.checkout, "apps/cms/nightly/design-release.json"), "utf8"),
    );
    save(join(f.candidateDir, "design-release.json"), live);
    writeFileSync(join(f.candidateDir, live.plugin.asset), Buffer.from("live design zip"));
    assert.throws(
      () =>
        prepare(
          {
            checkout: f.checkout,
            designDir: f.candidateDir,
            sourceSha: live.sourceSha,
            expected: f.expected,
            target,
          },
          { update: fakeUpdate(live) },
        ),
      /not newer/,
    );
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
  assert.throws(() => assertTrialPaths(["apps/frontend/package.json"]), /outside Design/);
  assert.throws(() => assertTrialPaths(["deploy/ploi/admin.sh"]), /outside Design/);
});

// A fake GitHub API recording every call. `routes` maps "METHOD path" to a
// response or an error to throw.
function fakeGitHub(routes) {
  const calls = [];
  const api = async (path, body) => {
    const key = `${body ? "POST" : "GET"} ${path}`;
    calls.push({ key, body });
    const route = routes[key];
    if (route instanceof Error) throw route;
    if (route === undefined) throw new Error(`Unexpected GitHub call ${key}`);
    return typeof route === "function" ? route(body) : route;
  };
  return { api, calls };
}
const site = "Quick-Release/nomia-bnq";

function preparedTrial() {
  const f = fixture();
  const record = prepare(
    {
      checkout: f.checkout,
      designDir: f.candidateDir,
      sourceSha: f.candidate.sourceSha,
      expected: f.expected,
      target,
    },
    { update: fakeUpdate(f.candidate) },
  );
  return { ...f, record };
}

test("record start binds a paused, fenced trial record to current main", async () => {
  const t = preparedTrial();
  const mainSha = "9".repeat(40);
  try {
    const gh = fakeGitHub({
      [`GET ${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`]: { value: "false" },
      [`GET ${site}/branches/main`]: { commit: { sha: mainSha } },
      [`POST ${site}/deployments`]: (body) => ({ id: 77, environment: body.environment }),
      [`POST ${site}/deployments/77/statuses`]: {},
    });
    const history = async () => [{ id: 1, state: "success", payload: {} }];
    const result = await startRecord(
      { kind: TRIAL_KIND, checkout: t.checkout, mainSha },
      { api: gh.api, deploymentHistory: history, site },
    );
    assert.equal(result.id, 77);
    const created = gh.calls.find((c) => c.key === `POST ${site}/deployments`).body;
    assert.equal(created.ref, mainSha);
    assert.equal(created.environment, ENVIRONMENT);
    assert.equal(created.production_environment, true);
    assert.equal(created.payload.deploymentKind, TRIAL_KIND);
    assert.equal(created.payload.siteSha, mainSha);
    assert.equal(created.payload.snapshotSha, t.record.snapshotSha);
    assert.equal(created.payload.baseline.snapshotSha, t.expected.snapshotSha);
    assert.equal(created.payload.manifests.design.tag, t.candidate.tag);
    assert.equal(created.payload.manifests.content.tag, "v0.4.3-nightly.20261029.14.1");
    assert.equal(created.payload.frontendDeployment, false);
    assert.equal(gh.calls.at(-1).body.state, "in_progress");
  } finally {
    rmSync(t.root, { recursive: true, force: true });
  }
});

test("record start refuses enabled delivery, moved main, open fences and policy failures", async () => {
  const t = preparedTrial();
  const mainSha = "9".repeat(40);
  const base = {
    [`GET ${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`]: { value: "false" },
    [`GET ${site}/branches/main`]: { commit: { sha: mainSha } },
    [`POST ${site}/deployments`]: (body) => ({ id: 77, environment: body.environment }),
    [`POST ${site}/deployments/77/statuses`]: {},
  };
  const resolved = async () => [{ id: 1, state: "success", payload: {} }];
  const attempt = (routes, history = resolved) => {
    const gh = fakeGitHub({ ...base, ...routes });
    return {
      gh,
      run: startRecord(
        { kind: TRIAL_KIND, checkout: t.checkout, mainSha },
        { api: gh.api, deploymentHistory: history, site },
      ),
    };
  };
  try {
    let a = attempt({
      [`GET ${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`]: { value: "true" },
    });
    await assert.rejects(a.run, /must be false/);
    a = attempt({ [`GET ${site}/branches/main`]: { commit: { sha: "8".repeat(40) } } });
    await assert.rejects(a.run, /main moved/);
    a = attempt({}, async () => [{ id: 5, state: "in_progress", payload: {} }]);
    await assert.rejects(a.run, /Unresolved deployment 5/);
    // The environment's deployment branch policy rejects the record: nothing
    // else is written.
    a = attempt({ [`POST ${site}/deployments`]: new Error(`GitHub 422: ${site}/deployments`) });
    await assert.rejects(a.run, /GitHub 422/);
    assert.equal(a.gh.calls.filter((c) => c.key.includes("/statuses")).length, 0);
    // A response that is not a deployment in the right environment.
    a = attempt({ [`POST ${site}/deployments`]: { message: "Merged" } });
    await assert.rejects(a.run, /did not create/);
    assert.equal(a.gh.calls.filter((c) => c.key.includes("/statuses")).length, 0);
    await assert.rejects(
      startRecord(
        { kind: TRIAL_KIND, checkout: t.checkout, mainSha },
        { api: fakeGitHub(base).api, deploymentHistory: resolved, site: "Other/repo" },
      ),
      /Nomia repository/,
    );
    // trial.json must match the checkout's lock.
    const trialPath = join(t.checkout, "apps/cms/nightly/trial.json");
    const trial = JSON.parse(readFileSync(trialPath, "utf8"));
    save(trialPath, {
      ...trial,
      candidate: { ...trial.candidate, composerLockSha256: "0".repeat(64) },
    });
    a = attempt({});
    await assert.rejects(a.run, /does not match/);
  } finally {
    rmSync(t.root, { recursive: true, force: true });
  }
});

test("a rollback record must reverse a recorded trial with its exact baseline", async () => {
  const t = preparedTrial();
  const mainSha = "9".repeat(40);
  try {
    const routes = {
      [`GET ${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`]: { value: "false" },
      [`GET ${site}/branches/main`]: { commit: { sha: mainSha } },
      [`POST ${site}/deployments`]: (body) => ({ id: 78, environment: body.environment }),
      [`POST ${site}/deployments/78/statuses`]: {},
    };
    const trialEntry = {
      id: 77,
      state: "error",
      payload: {
        deploymentKind: TRIAL_KIND,
        baseline: {
          snapshotSha: t.expected.snapshotSha,
          composerLockSha256: t.expected.composerLockSha256,
        },
      },
    };
    // The rollback checkout is the live snapshot itself.
    git(t.checkout, "checkout", "--quiet", "--detach", t.expected.snapshotSha);
    const gh = fakeGitHub(routes);
    const result = await startRecord(
      { kind: ROLLBACK_KIND, checkout: t.checkout, mainSha, trialDeploymentId: 77 },
      { api: gh.api, deploymentHistory: async () => [trialEntry], site },
    );
    assert.equal(result.payload.snapshotSha, t.expected.snapshotSha);
    assert.equal(result.payload.trialDeploymentId, 77);
    assert.equal(result.payload.manifests.design.sequence, 12);
    // Not the trial's baseline: refused.
    git(t.checkout, "checkout", "--quiet", "--detach", t.record.snapshotSha);
    await assert.rejects(
      startRecord(
        { kind: ROLLBACK_KIND, checkout: t.checkout, mainSha, trialDeploymentId: 77 },
        { api: fakeGitHub(routes).api, deploymentHistory: async () => [trialEntry], site },
      ),
      /recorded baseline/,
    );
    // Not a trial record: refused.
    await assert.rejects(
      startRecord(
        { kind: ROLLBACK_KIND, checkout: t.checkout, mainSha, trialDeploymentId: 1 },
        {
          api: fakeGitHub(routes).api,
          deploymentHistory: async () => [{ id: 1, state: "success", payload: {} }],
          site,
        },
      ),
      /recorded controlled trial/,
    );
  } finally {
    rmSync(t.root, { recursive: true, force: true });
  }
});

test("record finish sets one final state on an in-progress trial record only", async () => {
  const routes = (latest, kind = TRIAL_KIND) => ({
    [`GET ${site}/deployments/77`]: { id: 77, payload: { deploymentKind: kind } },
    [`GET ${site}/deployments/77/statuses?per_page=1`]: [{ state: latest }],
    [`POST ${site}/deployments/77/statuses`]: {},
  });
  let gh = fakeGitHub(routes("in_progress"));
  await finishRecord(
    { id: 77, state: "success", description: "Acceptance passed" },
    { api: gh.api, site },
  );
  assert.equal(gh.calls.at(-1).body.state, "success");
  gh = fakeGitHub(routes("in_progress"));
  await finishRecord(
    { id: 77, state: "error", description: "Rolled back by 78" },
    { api: gh.api, site },
  );
  assert.equal(gh.calls.at(-1).body.state, "error");
  await assert.rejects(
    finishRecord(
      { id: 77, state: "success", description: "x" },
      { api: fakeGitHub(routes("success")).api, site },
    ),
    /in-progress/,
  );
  await assert.rejects(
    finishRecord(
      { id: 77, state: "success", description: "x" },
      { api: fakeGitHub(routes("in_progress", "nomia-design-nightly")).api, site },
    ),
    /Not a controlled trial/,
  );
  await assert.rejects(
    finishRecord(
      { id: 77, state: "inactive", description: "x" },
      { api: fakeGitHub(routes("in_progress")).api, site },
    ),
    /Invalid final state/,
  );
  await assert.rejects(
    finishRecord(
      { id: 77, state: "success", description: " " },
      { api: fakeGitHub(routes("in_progress")).api, site },
    ),
    /description/,
  );
});
