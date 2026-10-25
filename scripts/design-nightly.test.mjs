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
