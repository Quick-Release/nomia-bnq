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
  assertPausedProductionTarget,
  finishRecord,
  prepare,
  siteTarget,
  snapshotIdentity,
  startRecord,
} from "./design-nightly/trial.mjs";

const ops = JSON.parse(readFileSync("gq.ops.json", "utf8"));
const paused = JSON.parse(readFileSync("design-nightly.json", "utf8"));
const target = siteTarget(ops);
const site = "Quick-Release/nomia-bnq";
const mainSha = "9".repeat(40);
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const sha1 = (bytes) => createHash("sha1").update(bytes).digest("hex");
const save = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const cleanEnv = () =>
  Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")));
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
// Stands in for offline `composer validate` (lock freshness).
const validOk = () => {};

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
const lockEntry = (m, zip) => ({
  name: m.plugin.name,
  version: m.plugin.composer.version,
  type: m.plugin.composer.type,
  dist: {
    type: "zip",
    url: `./nightly/${m.plugin.asset}`,
    reference: m.sourceSha,
    shasum: sha1(zip),
  },
});

const ZIPS = {
  live: Buffer.from("live design zip"),
  content: Buffer.from("content zip"),
  candidate: Buffer.from("candidate design zip"),
};

// A live-snapshot-shaped checkout, plus a candidate Design directory.
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "nomia-trial-"));
  const checkout = join(root, "checkout");
  const candidateDir = join(root, "candidate");
  const cms = join(checkout, "apps/cms");
  mkdirSync(join(cms, "nightly"), { recursive: true });
  mkdirSync(join(checkout, "apps/frontend"), { recursive: true });
  mkdirSync(join(checkout, "deploy/ploi"), { recursive: true });
  mkdirSync(candidateDir);
  const live = designManifest({
    sequence: 12,
    date: "20261026",
    base: "0.9.5",
    sourceSha: "8".repeat(40),
    zip: ZIPS.live,
  });
  const content = contentManifest(ZIPS.content);
  const candidate = designManifest({
    sequence: 13,
    date: "20261031",
    base: "0.9.6",
    sourceSha: "c".repeat(40),
    zip: ZIPS.candidate,
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
    "plugin-api-version": "2.11.0",
    packages: [
      lockEntry(content, ZIPS.content),
      lockEntry(live, ZIPS.live),
      { name: "roots/wordpress", version: "7.1.4", type: "metapackage" },
    ],
    "packages-dev": [],
  });
  save(join(cms, "nightly/design-release.json"), live);
  save(join(cms, "nightly/content-release.json"), content);
  writeFileSync(join(cms, "nightly", live.plugin.asset), ZIPS.live);
  writeFileSync(join(cms, "nightly", content.plugin.asset), ZIPS.content);
  writeFileSync(join(checkout, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  writeFileSync(join(checkout, "apps/frontend/package.json"), "{}\n");
  writeFileSync(join(checkout, "deploy/ploi/admin.sh"), "#!/bin/sh\n");
  writeFileSync(join(checkout, "VERSION"), "0.16.0\n");
  git(root, "init", "--quiet", "--template=", checkout);
  git(checkout, "add", "-A");
  git(checkout, "commit", "--quiet", "-m", "live snapshot");
  save(join(candidateDir, "design-release.json"), candidate);
  writeFileSync(join(candidateDir, candidate.plugin.asset), ZIPS.candidate);
  const id = snapshotIdentity(checkout);
  const expected = {
    snapshotSha: id.snapshotSha,
    composerLockSha256: id.composerLockSha256,
    pnpmLockSha256: id.pnpmLockSha256,
  };
  return { root, checkout, candidateDir, candidate, live, expected };
}

// Stands in for `composer update getquick/gq-design --no-install`.
const fakeUpdate =
  (m, { collateral = false } = {}) =>
  (cms) => {
    const path = join(cms, "composer.lock");
    const lock = readJson(path);
    lock["content-hash"] = "after";
    lock["plugin-api-version"] = "2.9.0"; // the local Composer's, not the baseline's
    lock.packages = lock.packages.map((p) =>
      p.name === m.plugin.name
        ? lockEntry(m, ZIPS.candidate)
        : collateral && p.name === "roots/wordpress"
          ? { ...p, version: "7.1.5" }
          : p,
    );
    save(path, lock);
  };

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
    { update: fakeUpdate(f.candidate), validate: validOk },
  );
  return { ...f, record };
}

// Rewrites the trial commit, as a forged snapshot would.
function amend(checkout, change) {
  change();
  git(checkout, "add", "-A", "-f");
  git(checkout, "commit", "--quiet", "--amend", "--no-edit");
}

// A fake GitHub API recording every call. `routes` maps "METHOD path" to a
// response, a function of the body, or an error to throw.
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
  return { api, calls, writes: () => calls.filter((c) => c.body !== undefined) };
}
const startRoutes = (overrides = {}) => ({
  [`GET ${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`]: { value: "false" },
  [`GET ${site}/branches/main`]: { commit: { sha: mainSha } },
  [`POST ${site}/deployments`]: (body) => ({ id: 77, environment: body.environment }),
  [`POST ${site}/deployments/77/statuses`]: {},
  ...overrides,
});
const liveHistory = (baselineSha) => async () => [
  { id: 1, state: "success", payload: {} },
  { id: 2, state: "success", payload: { snapshotSha: baselineSha } },
];

test("prepare swaps only GQ Design on the live snapshot and records the trial", () => {
  const t = preparedTrial();
  try {
    assert.equal(t.record.deploymentKind, TRIAL_KIND);
    assert.equal(t.record.baseline.snapshotSha, t.expected.snapshotSha);
    assert.equal(t.record.candidate.design.tag, t.candidate.tag);
    assert.equal(t.record.rollback.databaseRestore, false);
    assert.equal(git(t.checkout, "rev-parse", "HEAD^"), t.expected.snapshotSha);
    const changed = git(t.checkout, "diff", "--name-status", "--no-renames", "HEAD^", "HEAD");
    assert.deepEqual(changed.split("\n").sort(), [
      "A\tapps/cms/nightly/gq-design-0.9.6-nightly.20261031.13.1.zip",
      "A\tapps/cms/nightly/trial.json",
      "D\tapps/cms/nightly/gq-design-0.9.5-nightly.20261026.12.1.zip",
      "M\tapps/cms/composer.json",
      "M\tapps/cms/composer.lock",
      "M\tapps/cms/nightly/design-release.json",
    ]);
    assert.equal(
      readJson(join(t.checkout, "apps/cms/composer.lock"))["plugin-api-version"],
      "2.11.0",
    );
    const composer = readJson(join(t.checkout, "apps/cms/composer.json"));
    assert.deepEqual(
      composer.repositories.map((r) => r.package?.name ?? r.name),
      ["getquick/gq-content", "getquick/gq-design", "getquick"],
    );
    assert.equal(composer.require["getquick/gq-content"], "dev-nightly-20261029.14.1");
  } finally {
    rmSync(t.root, { recursive: true, force: true });
  }
});

test("prepare refuses a different baseline, collateral changes, wrong sources and stale locks", () => {
  const cases = [
    [
      (f) => ({ expected: { ...f.expected, snapshotSha: "1".repeat(40) } }),
      /expected live snapshot/,
    ],
    [(f) => ({ expected: { ...f.expected, composerLockSha256: "2".repeat(64) } }), /Composer lock/],
    [
      (f) => ({ update: fakeUpdate(f.candidate, { collateral: true }) }),
      /more than the Design entry/,
    ],
    [() => ({ sourceSha: "f".repeat(40) }), /Invalid nightly identity/],
    [
      () => ({
        validate: () => {
          throw new Error("exit 2");
        },
      }),
      /content-hash/,
    ],
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
            { update: o.update ?? fakeUpdate(f.candidate), validate: o.validate ?? validOk },
          ),
        error,
      );
    } finally {
      rmSync(f.root, { recursive: true, force: true });
    }
  }
  // The live Design nightly is not newer than itself; a dirty checkout refuses.
  const f = fixture();
  try {
    save(join(f.candidateDir, "design-release.json"), f.live);
    writeFileSync(join(f.candidateDir, f.live.plugin.asset), ZIPS.live);
    const args = (designDir) => ({
      checkout: f.checkout,
      designDir,
      sourceSha: f.live.sourceSha,
      expected: f.expected,
      target,
    });
    assert.throws(() => prepare(args(f.candidateDir), { validate: validOk }), /not newer/);
    writeFileSync(join(f.checkout, "stray.txt"), "x");
    assert.throws(() => prepare(args(f.candidateDir), { validate: validOk }), /not a clean commit/);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test("only an explicitly paused, well-formed production target is accepted", () => {
  assertPausedProductionTarget(paused, ops);
  const bad = [
    [null, ops],
    [paused, null],
    [[], ops],
    [paused, { ...ops, domains: null }],
    [paused, { ...ops, offboarded: true }],
    [paused, { ...ops, offboarded: "no" }],
    [{ ...paused, enabled: undefined }, ops],
    [{ ...paused, enabled: "false" }, ops],
    [{ ...paused, enabled: true }, ops],
    [{ ...paused, siteState: "development-no-traffic" }, ops],
    [
      { enabled: false, siteState: "production" },
      { domains: {}, ploi: {} },
    ],
    [
      { ...paused, adminDomain: "" },
      { ...ops, domains: { ...ops.domains, admin: "" } },
    ],
    [{ ...paused, ploiSiteId: Number(ops.ploi.siteId) }, ops],
    [paused, { ...ops, ploi: { ...ops.ploi, serverId: "" } }],
  ];
  for (const [config, siteOps] of bad)
    assert.throws(() => assertPausedProductionTarget(config, siteOps));
});

test("record start binds a verified trial to the ledger's live snapshot and current main", async () => {
  const t = preparedTrial();
  try {
    const gh = fakeGitHub(startRoutes());
    const result = await startRecord(
      { kind: TRIAL_KIND, checkout: t.checkout, mainSha },
      {
        api: gh.api,
        deploymentHistory: liveHistory(t.expected.snapshotSha),
        site,
        validate: validOk,
      },
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

test("record start writes nothing for unpaused, unreadable or malformed pause state", async () => {
  const t = preparedTrial();
  const history = liveHistory(t.expected.snapshotSha);
  const run = (routes, extra = {}) => {
    const gh = fakeGitHub(startRoutes(routes));
    return {
      gh,
      promise: startRecord(
        { kind: TRIAL_KIND, checkout: t.checkout, mainSha },
        { api: gh.api, deploymentHistory: history, site, validate: validOk, ...extra },
      ),
    };
  };
  try {
    for (const [routes, error] of [
      [
        { [`GET ${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`]: { value: "true" } },
        /exactly false/,
      ],
      [{ [`GET ${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`]: {} }, /exactly false/],
      [
        { [`GET ${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`]: { value: "FALSE" } },
        /exactly false/,
      ],
      [
        { [`GET ${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`]: new Error("GitHub 404: x") },
        /unreadable/,
      ],
      [
        { [`GET ${site}/actions/variables/DESIGN_NIGHTLY_ENABLED`]: new Error("GitHub 403: x") },
        /unreadable/,
      ],
      [{ [`GET ${site}/branches/main`]: { commit: { sha: "8".repeat(40) } } }, /main moved/],
    ]) {
      const a = run(routes);
      await assert.rejects(a.promise, error);
      assert.deepEqual(a.gh.writes(), []);
    }
    // Malformed or unpaused local configuration: no GitHub call at all.
    for (const config of [{ ...paused, enabled: true }, { enabled: false }, null]) {
      const root = mkdtempSync(join(tmpdir(), "nomia-root-"));
      try {
        save(join(root, "gq.ops.json"), ops);
        save(join(root, "design-nightly.json"), config);
        const a = run({}, { root });
        await assert.rejects(a.promise);
        assert.deepEqual(a.gh.calls, []);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
    await assert.rejects(
      startRecord(
        { kind: TRIAL_KIND, checkout: t.checkout, mainSha },
        { api: fakeGitHub(startRoutes()).api, deploymentHistory: history, site: "Other/repo" },
      ),
      /Nomia repository/,
    );
  } finally {
    rmSync(t.root, { recursive: true, force: true });
  }
});

test("record start writes nothing for dirty, forged or Content-changing snapshots", async () => {
  const forgeries = [
    [
      "dirty checkout",
      (t) => writeFileSync(join(t.checkout, "stray.txt"), "x"),
      /not a clean commit/,
    ],
    [
      "changed Content manifest",
      (t) =>
        amend(t.checkout, () => {
          const path = join(t.checkout, "apps/cms/nightly/content-release.json");
          save(path, { ...readJson(path), sourceSha: "f".repeat(40) });
        }),
      /outside Design/,
    ],
    [
      "changed Content ZIP",
      (t) =>
        amend(t.checkout, () =>
          writeFileSync(
            join(t.checkout, "apps/cms/nightly/content-nightly-0.4.3-nightly.20261029.14.1.zip"),
            "other",
          ),
        ),
      /outside Design/,
    ],
    [
      "changed pnpm lock",
      (t) => amend(t.checkout, () => writeFileSync(join(t.checkout, "pnpm-lock.yaml"), "x\n")),
      /outside Design/,
    ],
    [
      "changed VERSION",
      (t) => amend(t.checkout, () => writeFileSync(join(t.checkout, "VERSION"), "0.17.0\n")),
      /outside Design/,
    ],
    [
      "edited trial.json",
      (t) =>
        amend(t.checkout, () => {
          const path = join(t.checkout, "apps/cms/nightly/trial.json");
          save(path, { ...readJson(path), nightlyReenable: "allowed" });
        }),
      /trial.json does not match/,
    ],
    [
      "Design ZIP that is not the manifest's",
      (t) =>
        amend(t.checkout, () =>
          writeFileSync(join(t.checkout, "apps/cms/nightly", t.candidate.plugin.asset), "forged"),
        ),
      /Plugin SHA256 mismatch/,
    ],
    [
      "extra composer.json change",
      (t) =>
        amend(t.checkout, () => {
          const path = join(t.checkout, "apps/cms/composer.json");
          const composer = readJson(path);
          composer.require["getquick/gq-support"] = "^0.1.4";
          save(path, composer);
        }),
      /composer.json changes more/,
    ],
    [
      "extra lock change",
      (t) =>
        amend(t.checkout, () => {
          const path = join(t.checkout, "apps/cms/composer.lock");
          const lock = readJson(path);
          lock.packages[2] = { ...lock.packages[2], version: "7.1.5" };
          save(path, lock);
        }),
      /composer.lock changes more/,
    ],
    [
      "changed lock metadata",
      (t) =>
        amend(t.checkout, () => {
          const path = join(t.checkout, "apps/cms/composer.lock");
          save(path, { ...readJson(path), "plugin-api-version": "2.9.0" });
        }),
      /composer.lock changes more/,
    ],
  ];
  for (const [name, forge, error] of forgeries) {
    const t = preparedTrial();
    try {
      forge(t);
      const gh = fakeGitHub(startRoutes());
      await assert.rejects(
        startRecord(
          { kind: TRIAL_KIND, checkout: t.checkout, mainSha },
          {
            api: gh.api,
            deploymentHistory: liveHistory(t.expected.snapshotSha),
            site,
            validate: validOk,
          },
        ),
        error,
        name,
      );
      assert.deepEqual(gh.writes(), [], name);
    } finally {
      rmSync(t.root, { recursive: true, force: true });
    }
  }
  // A stale content-hash, an open fence, or a ledger naming a different live
  // snapshot: nothing is written.
  const t = preparedTrial();
  try {
    const cases = [
      [
        {
          validate: () => {
            throw new Error("exit 2");
          },
        },
        /content-hash/,
      ],
      [
        { deploymentHistory: async () => [{ id: 5, state: "in_progress", payload: {} }] },
        /Unresolved/,
      ],
      [{ deploymentHistory: liveHistory("1".repeat(40)) }, /single commit on its baseline/],
      [
        { deploymentHistory: async () => [{ id: 1, state: "success", payload: {} }] },
        /no live snapshot/,
      ],
    ];
    for (const [options, error] of cases) {
      const gh = fakeGitHub(startRoutes());
      await assert.rejects(
        startRecord(
          { kind: TRIAL_KIND, checkout: t.checkout, mainSha },
          {
            api: gh.api,
            deploymentHistory: liveHistory(t.expected.snapshotSha),
            site,
            validate: validOk,
            ...options,
          },
        ),
        error,
      );
      assert.deepEqual(gh.writes(), []);
    }
    // The environment's branch policy rejects the record: no status follows.
    const gh = fakeGitHub(
      startRoutes({ [`POST ${site}/deployments`]: new Error(`GitHub 422: ${site}/deployments`) }),
    );
    await assert.rejects(
      startRecord(
        { kind: TRIAL_KIND, checkout: t.checkout, mainSha },
        {
          api: gh.api,
          deploymentHistory: liveHistory(t.expected.snapshotSha),
          site,
          validate: validOk,
        },
      ),
      /GitHub 422/,
    );
    assert.equal(gh.calls.filter((c) => c.key.includes("/statuses")).length, 0);
    const wrongEnv = fakeGitHub(
      startRoutes({ [`POST ${site}/deployments`]: { id: 77, environment: "production" } }),
    );
    await assert.rejects(
      startRecord(
        { kind: TRIAL_KIND, checkout: t.checkout, mainSha },
        {
          api: wrongEnv.api,
          deploymentHistory: liveHistory(t.expected.snapshotSha),
          site,
          validate: validOk,
        },
      ),
      /did not create/,
    );
    assert.equal(wrongEnv.calls.filter((c) => c.key.includes("/statuses")).length, 0);
  } finally {
    rmSync(t.root, { recursive: true, force: true });
  }
});

test("a rollback record must reverse a recorded trial with its exact baseline", async () => {
  const t = preparedTrial();
  const routes = startRoutes({
    [`POST ${site}/deployments`]: (body) => ({ id: 78, environment: body.environment }),
    [`POST ${site}/deployments/78/statuses`]: {},
  });
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
  try {
    git(t.checkout, "checkout", "--quiet", "--detach", t.expected.snapshotSha);
    const result = await startRecord(
      { kind: ROLLBACK_KIND, checkout: t.checkout, mainSha, trialDeploymentId: 77 },
      { api: fakeGitHub(routes).api, deploymentHistory: async () => [trialEntry], site },
    );
    assert.equal(result.payload.snapshotSha, t.expected.snapshotSha);
    assert.equal(result.payload.trialDeploymentId, 77);
    assert.equal(result.payload.manifests.design.sequence, 12);
    for (const [id, history, error] of [
      [1, [{ id: 1, state: "success", payload: {} }], /recorded controlled trial/],
      [Number.NaN, [trialEntry], /recorded controlled trial/],
    ]) {
      const gh = fakeGitHub(routes);
      await assert.rejects(
        startRecord(
          { kind: ROLLBACK_KIND, checkout: t.checkout, mainSha, trialDeploymentId: id },
          { api: gh.api, deploymentHistory: async () => history, site },
        ),
        error,
      );
      assert.deepEqual(gh.writes(), []);
    }
    git(t.checkout, "checkout", "--quiet", "--detach", t.record.snapshotSha);
    const gh = fakeGitHub(routes);
    await assert.rejects(
      startRecord(
        { kind: ROLLBACK_KIND, checkout: t.checkout, mainSha, trialDeploymentId: 77 },
        { api: gh.api, deploymentHistory: async () => [trialEntry], site },
      ),
      /recorded baseline/,
    );
    assert.deepEqual(gh.writes(), []);
  } finally {
    rmSync(t.root, { recursive: true, force: true });
  }
});

test("record finish validates the record before setting one final state", async () => {
  const snapshotSha = "5".repeat(40);
  const record = (overrides = {}) => ({
    id: 77,
    environment: ENVIRONMENT,
    ref: mainSha,
    payload: {
      schemaVersion: 1,
      deploymentKind: TRIAL_KIND,
      siteSha: mainSha,
      snapshotSha,
      frontendDeployment: false,
    },
    ...overrides,
  });
  const routes = (deployment, latest = "in_progress") => ({
    [`GET ${site}/deployments/77`]: deployment,
    [`GET ${site}/deployments/77/statuses?per_page=1`]: [{ state: latest }],
    [`POST ${site}/deployments/77/statuses`]: {},
  });
  for (const state of ["success", "error", "failure"]) {
    const gh = fakeGitHub(routes(record()));
    await finishRecord({ id: 77, state, description: "Recorded" }, { api: gh.api, site });
    assert.equal(gh.calls.at(-1).body.state, state);
  }
  const refusals = [
    [{ id: 77, deployment: record({ environment: "production" }) }, /Not a controlled trial/],
    [{ id: 77, deployment: record({ ref: "8".repeat(40) }) }, /Not a controlled trial/],
    [
      {
        id: 77,
        deployment: record({
          payload: { ...record().payload, deploymentKind: "nomia-design-nightly" },
        }),
      },
      /Not a controlled trial/,
    ],
    [
      {
        id: 77,
        deployment: record({ payload: { ...record().payload, frontendDeployment: true } }),
      },
      /Not a controlled trial/,
    ],
    [{ id: 77, deployment: record({ id: 78 }) }, /Not a controlled trial/],
    [{ id: 77, deployment: record(), latest: "success" }, /in-progress/],
    [{ id: 0, deployment: record() }, /Invalid deployment id/],
    [{ id: -1, deployment: record() }, /Invalid deployment id/],
    [{ id: Number.NaN, deployment: record() }, /Invalid deployment id/],
    [{ id: "77", deployment: record() }, /Invalid deployment id/],
    [{ id: 77, deployment: record(), state: "inactive" }, /Invalid final state/],
    [{ id: 77, deployment: record(), description: " " }, /description/],
  ];
  for (const [c, error] of refusals) {
    const gh = fakeGitHub(routes(c.deployment, c.latest));
    await assert.rejects(
      finishRecord(
        { id: c.id, state: c.state ?? "success", description: c.description ?? "x" },
        { api: gh.api, site },
      ),
      error,
    );
    assert.deepEqual(gh.writes(), []);
  }
});
