import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  activationDecision,
  validateManifest,
  snapshotComposer,
  newest,
  assertUnchangedDependencies,
} from "./design-nightly/model.mjs";

const fixture = () => ({
  schemaVersion: 1,
  migrations: { destructive: false },
  channel: "nightly",
  version: "0.9.2-nightly.20261025.42.1",
  tag: "v0.9.2-nightly.20261025.42.1",
  sourceSha: "a".repeat(40),
  sequence: 42,
  attempt: 1,
  plugin: {
    name: "getquick/gq-design",
    asset: "gq-design-0.9.2-nightly.20261025.42.1.zip",
    sha256: "b".repeat(64),
    composer: {
      name: "getquick/gq-design",
      type: "wordpress-plugin",
      version: "dev-nightly-20261025.42.1",
      autoload: { "psr-4": { "GetQuick\\Design\\": "src/" } },
    },
  },
  packages: ["@quick-release/design-contract", "@quick-release/design-renderer"].map((name) => ({
    name,
    version: "0.9.2-nightly.20261025.42.1",
    asset: `${name.split("/")[1]}.tgz`,
    sha256: "c".repeat(64),
    integrity: "sha512-abc",
  })),
});

test("binds staged metadata to immutable tag source and complete release", () => {
  const m = fixture();
  assert.equal(validateManifest(m, m.tag, m.sourceSha), m);
  assert.throws(() => validateManifest(m, m.tag, "d".repeat(40)), /identity/);
  const undeclared = structuredClone(m);
  delete undeclared.migrations;
  assert.throws(
    () => validateManifest(undeclared, undeclared.tag, undeclared.sourceSha),
    /migration declaration/,
  );
  const nonBoolean = structuredClone(m);
  nonBoolean.migrations.destructive = "false";
  assert.throws(
    () => validateManifest(nonBoolean, nonBoolean.tag, nonBoolean.sourceSha),
    /migration declaration/,
  );
  const destructive = structuredClone(m);
  destructive.migrations.destructive = true;
  assert.equal(validateManifest(destructive, destructive.tag, destructive.sourceSha), destructive);
  const wrong = structuredClone(m);
  wrong.plugin.composer.version = wrong.version;
  assert.throws(() => validateManifest(wrong, wrong.tag, wrong.sourceSha), /metadata/);
  const undeclaredAsset = structuredClone(m);
  delete undeclaredAsset.packages[0].asset;
  assert.throws(() => validateManifest(undeclaredAsset, m.tag, m.sourceSha), /lockstep/);
  const incomplete = structuredClone(m);
  incomplete.packages.pop();
  assert.throws(
    () => validateManifest(incomplete, incomplete.tag, incomplete.sourceSha),
    /lockstep/,
  );
  assert.equal(
    newest([
      { sequence: 42, attempt: 1 },
      { sequence: 41, attempt: 9 },
      { sequence: 42, attempt: 2 },
    ]).attempt,
    2,
  );
});

test("refuses collateral dependency changes", () => {
  const before = {
    packages: [
      { name: "other/pkg", version: "1" },
      { name: "getquick/gq-design", version: "old" },
    ],
  };
  assertUnchangedDependencies(before, {
    packages: [before.packages[0], { name: "getquick/gq-design", version: "new" }],
  });
  assert.throws(
    () => assertUnchangedDependencies(before, { packages: [{ name: "other/pkg", version: "2" }] }),
    /other than/,
  );
});

test("Composer installs the bundled staged ZIP from a portable locked snapshot", () => {
  const root = mkdtempSync(join(tmpdir(), "nomia-nightly-"));
  try {
    execFileSync("python3", [
      "-c",
      'import zipfile,sys; z=zipfile.ZipFile(sys.argv[1],"w"); z.writestr("gq-design/src/Plugin.php","<?php // staged nightly"); z.writestr("gq-design/gq-design.php","<?php // entry"); z.close()',
      join(root, "plugin.zip"),
    ]);
    const m = fixture();
    const config = snapshotComposer(
      {
        name: "test/site",
        repositories: [],
        require: {},
        config: { "allow-plugins": false, "cache-dir": join(root, "cache") },
      },
      m,
    );
    config.repositories.push({
      type: "package",
      package: {
        name: "getquick/getquick-theme",
        version: "0.5.1",
        type: "metapackage",
        require: { "getquick/gq-design": ">=0.3.19 <1.0" },
      },
    });
    config.require["getquick/getquick-theme"] = "0.5.1";
    config.repositories.push({ packagist: false });
    config.repositories[0].package.dist.url = "./plugin.zip";
    writeFileSync(join(root, "composer.json"), JSON.stringify(config));
    const composer = (...args) =>
      execFileSync("composer", [...args, "--no-plugins", "--no-scripts", "--no-interaction"], {
        cwd: root,
        stdio: "pipe",
      });
    const baseline = structuredClone(config);
    baseline.require[m.plugin.name] = "0.9.0";
    baseline.repositories[0].package.version = "0.9.0";
    delete baseline.repositories[0].package.extra;
    writeFileSync(join(root, "composer.json"), JSON.stringify(baseline));
    composer("update", "--no-install");
    const before = JSON.parse(readFileSync(join(root, "composer.lock")));
    writeFileSync(join(root, "composer.json"), JSON.stringify(config));
    composer("update", "getquick/gq-design", "--no-install", "--minimal-changes");
    const lock = JSON.parse(readFileSync(join(root, "composer.lock")));
    assert.equal(
      lock.packages.find((p) => p.name === m.plugin.name).version,
      m.plugin.composer.version,
    );
    assert.equal(lock.packages.find((p) => p.name === m.plugin.name).dist.reference, m.sourceSha);
    assertUnchangedDependencies(before, lock);
    composer("install", "--prefer-dist");
    assert.match(
      readFileSync(join(root, "vendor/getquick/gq-design/src/Plugin.php"), "utf8"),
      /staged nightly/,
    );
    assert.match(
      readFileSync(join(root, "vendor/composer/autoload_psr4.php"), "utf8"),
      /gq-design/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("serial activation fences ambiguity, deduplicates and allows explicit rollback", () => {
  const candidate = fixture();
  const newer = { ...candidate, sequence: 43 };
  assert.equal(
    activationDecision(candidate, [{ id: 1, state: "success", manifest: newer }]),
    "superseded",
  );
  assert.equal(
    activationDecision(candidate, [{ id: 1, state: "success", manifest: candidate }]),
    "superseded",
  );
  assert.equal(
    activationDecision(candidate, [{ id: 1, state: "success", manifest: newer }], true),
    "activate",
  );
  assert.throws(
    () =>
      activationDecision(candidate, [
        { id: 1, state: "success", manifest: newer },
        { id: 2, state: "in_progress" },
      ]),
    /reconcile Ploi/,
  );
  assert.throws(
    () => activationDecision(candidate, [{ id: 2, state: "in_progress" }], true),
    /reconcile Ploi/,
  );
});

test("automatic selection resumes latest after manual rollback", () => {
  const candidate = fixture();
  const rolledBack = { ...candidate, sequence: 41 };
  assert.equal(
    activationDecision(candidate, [
      { id: 2, state: "success", manifest: rolledBack },
      { id: 1, state: "inactive", manifest: candidate },
    ]),
    "activate",
  );
  assert.equal(
    activationDecision(candidate, [
      { id: 2, state: "success", manifest: rolledBack },
      { id: 1, state: "success", manifest: candidate },
    ]),
    "activate",
  );
});

test("site changes deploy with the same Design nightly; only a complete matching pair deduplicates", () => {
  const candidate = fixture();
  const snapshot = { siteSha: "d".repeat(40), frontendDeployment: true };
  const deployed = {
    id: 1,
    state: "success",
    manifest: candidate,
    payload: { ...snapshot },
  };
  const decide = (entry) => activationDecision(candidate, [entry], false, undefined, snapshot);
  assert.equal(decide(deployed), "superseded");
  assert.equal(
    decide({ ...deployed, payload: { ...snapshot, siteSha: "e".repeat(40) } }),
    "activate",
  );
  assert.equal(decide({ ...deployed, payload: { siteSha: snapshot.siteSha } }), "activate");
  assert.equal(decide({ ...deployed, state: "error" }), "activate");
  assert.throws(() => decide({ ...deployed, state: "in_progress" }), /reconcile Ploi/);
  assert.equal(
    decide({ ...deployed, manifest: { ...candidate, sequence: candidate.sequence + 1 } }),
    "superseded",
  );
});

test("GitHub manifest acceptance requires all uploaded lockstep assets", async () => {
  const { manifest } = await import("./design-nightly/github.mjs");
  const m = fixture();
  const release = {
    tag_name: m.tag,
    draft: false,
    prerelease: true,
    assets: [
      { name: "design-release.json", state: "uploaded", url: "https://example.test/manifest" },
      ...[m.plugin.asset, ...m.packages.map((p) => p.asset)].map((name) => ({
        name,
        state: "uploaded",
      })),
    ],
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) =>
    new Response(
      JSON.stringify(
        String(url).includes("/git/ref/") ? { object: { type: "commit", sha: m.sourceSha } } : m,
      ),
    );
  try {
    assert.deepEqual(await manifest(release), m);
    for (const name of [m.plugin.asset, ...m.packages.map((p) => p.asset)]) {
      const missing = structuredClone(release);
      missing.assets = missing.assets.filter((a) => a.name !== name);
      await assert.rejects(manifest(missing), /Incomplete lockstep release assets/);
    }
    const pending = structuredClone(release);
    pending.assets.at(-1).state = "new";
    await assert.rejects(manifest(pending), /Incomplete lockstep release assets/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("current authenticated Actions job does not fence itself; every other unresolved record does", () => {
  const candidate = fixture();
  const currentJob = {
    jobUrl: "https://github.com/Quick-Release/nomia-bnq/actions/runs/40210286283/job/121219859253",
    headSha: "d".repeat(40),
    refName: "main",
    environment: "nomia-design-nightly",
  };
  const platform = {
    id: 7315646026,
    state: "in_progress",
    payload: {},
    ref: "main",
    sha: currentJob.headSha,
    environment: currentJob.environment,
    task: "deploy",
    logUrl: currentJob.jobUrl,
  };
  assert.equal(activationDecision(candidate, [platform], false, currentJob), "activate");
  for (const changed of [
    { logUrl: currentJob.jobUrl.replace("121219859253", "121219859254") },
    { logUrl: currentJob.jobUrl.replace("40210286283", "40210286282") },
    { sha: "e".repeat(40) },
    { ref: "feature/other" },
    { environment: "other" },
    { payload: { deploymentKind: "nomia-design-nightly" } },
    { payload: { manifest: candidate }, manifest: candidate },
  ])
    assert.throws(
      () => activationDecision(candidate, [{ ...platform, ...changed }], false, currentJob),
      /Unresolved deployment/,
    );
  assert.throws(() => activationDecision(candidate, [platform]), /Unresolved deployment/);
  assert.throws(
    () =>
      activationDecision(
        candidate,
        [{ ...platform, state: "waiting", logUrl: "https://example.test/other" }],
        false,
        currentJob,
      ),
    /Unresolved deployment/,
  );
});

test("current job identity comes from authenticated Actions API and exact run attempt", async () => {
  const { currentActionsJob } = await import("./design-nightly/github.mjs");
  const input = {
    site: "Quick-Release/nomia-bnq",
    runId: "40210286283",
    attempt: "2",
    jobName: "adopt",
    headSha: "d".repeat(40),
    refName: "main",
    runnerName: "GitHub Actions 1",
  };
  const job = {
    id: 123,
    name: input.jobName,
    run_id: Number(input.runId),
    head_sha: input.headSha,
    runner_name: input.runnerName,
    status: "in_progress",
    html_url: `https://github.com/${input.site}/actions/runs/${input.runId}/job/123`,
  };
  const originalFetch = globalThis.fetch;
  let jobs = [job];
  globalThis.fetch = async (url) => {
    assert.match(String(url), /\/runs\/40210286283\/attempts\/2\/jobs\?per_page=100$/);
    return new Response(JSON.stringify({ total_count: jobs.length, jobs }));
  };
  try {
    assert.equal((await currentActionsJob(input)).jobUrl, job.html_url);
    for (const change of [
      { status: "completed" },
      { head_sha: "e".repeat(40) },
      { runner_name: "other" },
      { run_id: 1 },
    ]) {
      jobs = [{ ...job, ...change }];
      await assert.rejects(currentActionsJob(input), /not uniquely authenticated/);
    }
    jobs = [job, job];
    await assert.rejects(currentActionsJob(input), /not uniquely authenticated/);
    jobs = [{ ...job, html_url: "https://example.test/spoof" }];
    await assert.rejects(currentActionsJob(input), /Unexpected current Actions job URL/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

const contentFixture = () => {
  const m = fixture();
  m.plugin.name = "getquick/gq-content";
  m.plugin.asset = `content-nightly-${m.version}.zip`;
  m.plugin.composer.name = m.plugin.name;
  m.plugin.composer.type = "wordpress-muplugin";
  m.packages = [
    { ...m.packages[0], name: "@getquick/content", asset: `getquick-content-${m.version}.tgz` },
  ];
  return m;
};

test("Content contract binds MU plugin and one frontend artifact to the same release", async () => {
  const { producers, verifyPackage, hash } = await import("./design-nightly/model.mjs");
  const { createHash } = await import("node:crypto");
  const m = contentFixture();
  assert.equal(validateManifest(m, m.tag, m.sourceSha, producers.content), m);
  assert.throws(() => validateManifest(m, m.tag, m.sourceSha), /metadata/);
  assert.throws(
    () => validateManifest({ ...m, packages: [] }, m.tag, m.sourceSha, producers.content),
    /lockstep/,
  );
  const bytes = Buffer.from("retained tarball");
  const p = {
    sha256: hash(bytes),
    integrity: `sha512-${createHash("sha512").update(bytes).digest("base64")}`,
  };
  verifyPackage(bytes, p);
  assert.throws(() => verifyPackage(Buffer.from("corrupted"), p), /SHA256/);
  assert.throws(() => verifyPackage(bytes, { ...p, integrity: "sha512-wrong" }), /integrity/);
});

test("Content release acceptance reads its own repository and completion marker", async () => {
  const { producers } = await import("./design-nightly/model.mjs");
  const { manifest } = await import("./design-nightly/github.mjs");
  const m = contentFixture();
  const release = {
    tag_name: m.tag,
    prerelease: true,
    assets: [
      { name: "content-release.json", state: "uploaded", url: "https://example.test/manifest" },
      ...[m.plugin.asset, m.packages[0].asset].map((name) => ({ name, state: "uploaded" })),
    ],
  };
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes("/git/ref/")) {
      assert.match(String(url), /repos\/Quick-Release\/gq-content\//);
      return new Response(JSON.stringify({ object: { type: "commit", sha: m.sourceSha } }));
    }
    return new Response(JSON.stringify(m));
  };
  try {
    assert.deepEqual(await manifest(release, producers.content), m);
    await assert.rejects(
      manifest({ ...release, assets: release.assets.slice(0, -1) }, producers.content),
      /Incomplete/,
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("shared snapshot compares producer sequences independently and deduplicates complete triples", () => {
  const design = fixture();
  const content = contentFixture();
  // Design and Content counters cannot be ordered against each other.
  content.sequence = 9000;
  const snapshot = {
    siteSha: "e".repeat(40),
    frontendDeployment: true,
    manifests: { design, content },
  };
  const entry = { id: 1, state: "success", manifest: design, payload: snapshot };
  const decide = (history, manual = false) =>
    activationDecision(design, history, manual, undefined, snapshot);
  assert.equal(decide([entry]), "superseded");
  assert.equal(decide([{ ...entry, payload: { ...snapshot, manifests: { design } } }]), "activate");
  const newer = { ...content, sequence: 9001 };
  assert.equal(
    decide([{ ...entry, payload: { ...snapshot, manifests: { design, content: newer } } }]),
    "superseded",
  );
  assert.equal(
    decide([{ ...entry, payload: { ...snapshot, manifests: { design, content: newer } } }], true),
    "activate",
  );
  assert.throws(() => decide([{ ...entry, state: "in_progress" }], true), /Unresolved/);
  assert.equal(
    decide([{ ...entry, payload: { ...snapshot, siteSha: "f".repeat(40) } }]),
    "activate",
  );
});

test("frontend graph guard permits only Content root version and artifact changes", async () => {
  const { dependencyGraph } = await import("./design-nightly/model.mjs");
  const before = [
    {
      name: "@nomia-bnq/frontend",
      dependencies: {
        "@getquick/content": {
          version: "0.3.2",
          resolved: "registry",
          dependencies: { dep: { version: "1", resolved: "exact" } },
        },
        other: { version: "1", resolved: "exact" },
      },
    },
  ];
  const after = structuredClone(before);
  after[0].dependencies["@getquick/content"].version = "0.3.3-nightly.20261025.42.1";
  after[0].dependencies["@getquick/content"].resolved = "file:nightly/exact.tgz";
  assert.deepEqual(dependencyGraph(before), dependencyGraph(after));
  after[0].dependencies["@getquick/content"].dependencies.dep.version = "2";
  assert.notDeepEqual(dependencyGraph(before), dependencyGraph(after));
});

test("retained Content tarball installs offline and reinstalls from its frozen snapshot lock", async () => {
  const { mkdirSync } = await import("node:fs");
  const root = mkdtempSync(join(tmpdir(), "nomia-content-tgz-"));
  try {
    mkdirSync(join(root, "package"));
    mkdirSync(join(root, "nightly"));
    const version = "0.3.3-nightly.20261025.42.1";
    writeFileSync(
      join(root, "package/package.json"),
      JSON.stringify({ name: "@getquick/content", version }),
    );
    execFileSync("tar", ["-czf", join(root, "nightly/content.tgz"), "package"], { cwd: root });
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({
        name: "proof",
        dependencies: { "@getquick/content": "file:nightly/content.tgz" },
      }),
    );
    const pnpm = (...args) =>
      execFileSync("pnpm", args, { cwd: root, stdio: "pipe", env: { ...process.env, CI: "true" } });
    pnpm("install", "--offline", "--no-frozen-lockfile", "--ignore-scripts");
    const lock = readFileSync(join(root, "pnpm-lock.yaml"), "utf8");
    assert.match(lock, /integrity: sha512-/);
    rmSync(join(root, "node_modules"), { recursive: true });
    pnpm("install", "--offline", "--frozen-lockfile", "--ignore-scripts");
    assert.equal(
      JSON.parse(readFileSync(join(root, "node_modules/@getquick/content/package.json"))).version,
      version,
    );
    assert.equal(readFileSync(join(root, "pnpm-lock.yaml"), "utf8"), lock);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("batched ledger status reads retain unresolved records and fail closed on partial results", async () => {
  const { deploymentStatuses } = await import("./design-nightly/github.mjs");
  const original = globalThis.fetch;
  let nodes = [
    { id: "one", latestStatus: { state: "IN_PROGRESS", logUrl: "https://example.test/job" } },
    { id: "two", latestStatus: null },
  ];
  globalThis.fetch = async () => new Response(JSON.stringify({ data: { nodes } }));
  try {
    assert.deepEqual(await deploymentStatuses([{ node_id: "one" }, { node_id: "two" }]), [
      { state: "in_progress", log_url: "https://example.test/job" },
      { state: undefined, log_url: undefined },
    ]);
    nodes = [nodes[0]];
    await assert.rejects(
      deploymentStatuses([{ node_id: "one" }, { node_id: "two" }]),
      /Incomplete/,
    );
    nodes = [null];
    await assert.rejects(deploymentStatuses([{ node_id: "one" }]), /identity/);
  } finally {
    globalThis.fetch = original;
  }
});

test("frontend graph guard expands pnpm's deduplicated Content subtree", async () => {
  const { dependencyGraph } = await import("./design-nightly/model.mjs");
  const stable = {
    version: "0.3.2",
    resolved: "registry",
    path: "/stable",
    dependencies: {
      zod: { version: "3.25.76", resolved: "zod-registry", path: "/zod" },
    },
  };
  const before = [
    { name: "tooling", dependencies: { "@getquick/content": stable } },
    {
      name: "@nomia-bnq/frontend",
      dependencies: {
        "@getquick/content": {
          version: stable.version,
          resolved: stable.resolved,
          path: stable.path,
          deduped: true,
          dedupedDependenciesCount: 1,
        },
      },
    },
  ];
  const after = structuredClone(before);
  after[1].dependencies["@getquick/content"] = {
    ...stable,
    version: "nightly",
    resolved: "file:exact.tgz",
    path: "/nightly",
  };
  assert.deepEqual(dependencyGraph(before), dependencyGraph(after));
  after[1].dependencies["@getquick/content"] = {
    ...after[1].dependencies["@getquick/content"],
    dependencies: { zod: { version: "4", resolved: "changed", path: "/changed" } },
  };
  assert.notDeepEqual(dependencyGraph(before), dependencyGraph(after));
});

test("automatic admission skips unchanged snapshots and preserves the unresolved fence", async () => {
  const { producers } = await import("./design-nightly/model.mjs");
  const root = mkdtempSync(join(tmpdir(), "nomia-admission-"));
  const output = join(root, "output");
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const manifests = { design: fixture(), content: contentFixture() };
  const values = {
    GITHUB_REPOSITORY: "Quick-Release/nomia-bnq",
    GITHUB_RUN_ID: "123",
    GITHUB_RUN_ATTEMPT: "1",
    GITHUB_JOB: "adopt",
    GITHUB_SHA: sha,
    GITHUB_REF_NAME: "main",
    RUNNER_NAME: "runner",
    GITHUB_OUTPUT: output,
  };
  const saved = Object.fromEntries(Object.keys(values).map((name) => [name, process.env[name]]));
  Object.assign(process.env, values);
  const original = globalThis.fetch;
  let deployedSha = sha;
  let state = "SUCCESS";
  globalThis.fetch = async (url, options) => {
    url = String(url);
    if (url.endsWith("/graphql"))
      return new Response(
        JSON.stringify({ data: { nodes: [{ id: "record", latestStatus: { state } }] } }),
      );
    if (url.includes("/jobs?"))
      return new Response(
        JSON.stringify({
          total_count: 1,
          jobs: [
            {
              id: 456,
              name: "adopt",
              head_sha: sha,
              run_id: 123,
              runner_name: "runner",
              status: "in_progress",
              html_url: "https://github.com/Quick-Release/nomia-bnq/actions/runs/123/job/456",
            },
          ],
        }),
      );
    if (url.includes("/deployments?"))
      return new Response(
        JSON.stringify([
          {
            id: 1,
            node_id: "record",
            payload: { manifests, siteSha: deployedSha, frontendDeployment: true },
          },
        ]),
      );
    const name = url.includes("gq-content") || url.includes("/content/") ? "content" : "design";
    const m = manifests[name];
    if (url.includes("/git/ref/"))
      return new Response(JSON.stringify({ object: { type: "commit", sha: m.sourceSha } }));
    if (url.includes("/releases?"))
      return new Response(
        JSON.stringify([
          {
            tag_name: m.tag,
            prerelease: true,
            assets: [
              {
                name: producers[name].manifestAsset,
                url: `https://example.test/${name}/manifest`,
                state: "uploaded",
              },
              ...[m.plugin.asset, ...m.packages.map((p) => p.asset)].map((name) => ({
                name,
                state: "uploaded",
              })),
            ],
          },
        ]),
      );
    if (url.endsWith("/manifest")) return new Response(JSON.stringify(m));
    throw new Error(`Unexpected admission request: ${url} ${options?.method}`);
  };
  try {
    await import("./design-nightly/admission.mjs?unchanged");
    assert.equal(readFileSync(output, "utf8"), "needed=false\n");
    writeFileSync(output, "");
    deployedSha = "f".repeat(40);
    await import("./design-nightly/admission.mjs?site-change");
    assert.equal(readFileSync(output, "utf8"), "needed=true\n");
    state = "IN_PROGRESS";
    await assert.rejects(import("./design-nightly/admission.mjs?fenced"), /Unresolved deployment/);
  } finally {
    globalThis.fetch = original;
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    rmSync(root, { recursive: true, force: true });
  }
});

test("completed no-op environment records do not obscure the deployed snapshot", () => {
  const candidate = fixture();
  const snapshot = {
    siteSha: "a".repeat(40),
    frontendDeployment: true,
    manifests: { design: candidate, content: contentFixture() },
  };
  const deployed = { id: 1, state: "success", payload: snapshot };
  const platform = {
    id: 2,
    state: "success",
    payload: {},
    githubApp: "github-actions",
    task: "deploy",
    environment: "nomia-design-nightly",
    ref: "main",
    sha: snapshot.siteSha,
    logUrl: "https://github.com/Quick-Release/nomia-bnq/actions/runs/123/job/456",
  };
  const decide = (entry) =>
    activationDecision(candidate, [entry, deployed], false, undefined, snapshot);
  assert.equal(decide(platform), "superseded");
  assert.equal(decide({ ...platform, githubApp: "unknown" }), "activate");
  assert.throws(() => decide({ ...platform, state: "in_progress" }), /Unresolved/);
});
