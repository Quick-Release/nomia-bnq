// Nomia development CMS and frontend. No automated suites run on this path.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  producers,
  hash,
  snapshotComposer,
  assertUnchangedDependencies,
  dependencyGraph,
  verifyPackage,
} from "./model.mjs";

const root = process.cwd();
const token = process.env.GH_TOKEN;
const site = process.env.GITHUB_REPOSITORY;
import { api, asset, manifest, latest } from "./github.mjs";
const run = (command, args, cwd = root) => execFileSync(command, args, { cwd, stdio: "inherit" });
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const save = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);

if (!token || site !== "Quick-Release/nomia-bnq")
  throw new Error("Expected authenticated Nomia repository");
const required = [
  "COMPOSER_AUTH",
  "PLOI_API_TOKEN",
  "RELEASES_R2_ACCESS_KEY_ID",
  "RELEASES_R2_SECRET_ACCESS_KEY",
  "FRONTEND_REFRESH_TOKEN",
  "CLOUDFLARE_API_TOKEN",
  "PUBLICATION_EVENT_SECRET",
  "CONSENT_READ_TOKEN",
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Missing deployment credentials: ${missing.join(", ")}`);
const ops = json("gq.ops.json");
const config = json("design-nightly.json");
if (
  config.enabled !== true ||
  config.siteState !== "development-no-traffic" ||
  ops.offboarded ||
  config.adminDomain !== ops.domains.admin ||
  config.frontendDomain !== ops.domains.frontend ||
  config.ploiSiteId !== ops.ploi.siteId
)
  throw new Error("Nightly development target is not enabled or does not match");
const manual = process.env.GITHUB_EVENT_NAME === "workflow_dispatch";
const event = json(process.env.GITHUB_EVENT_PATH);
const sitePush = process.env.GITHUB_EVENT_NAME === "push" && event.ref === "refs/heads/main";
const dispatched = Object.entries(producers).find(
  ([name, owner]) =>
    event.action === `gq_${name}_nightly` &&
    event.client_payload?.repository === owner.repository &&
    event.client_payload?.manifestAsset === owner.manifestAsset,
);
if (!manual && !sitePush && process.env.GITHUB_EVENT_NAME !== "schedule" && !dispatched)
  throw new Error("Unexpected dispatch");
const manifests = {};
const cms = resolve("apps/cms");
const before = json(`${cms}/composer.lock`);
let composer = json(`${cms}/composer.json`);
mkdirSync(`${cms}/nightly`, { recursive: true });
const graph = () =>
  dependencyGraph(
    JSON.parse(
      execFileSync("pnpm", ["list", "--recursive", "--depth", "Infinity", "--json"], {
        encoding: "utf8",
        maxBuffer: 32 * 1024 * 1024,
      }),
    ),
  );
const graphBefore = graph();
for (const [name, owner] of Object.entries(producers)) {
  const tag = manual ? event.inputs?.[name === "design" ? "tag" : "content_tag"] : null;
  const release = tag
    ? await api(`${owner.repository}/releases/tags/${encodeURIComponent(tag)}`)
    : null;
  const m = release ? await manifest(release, owner) : await latest(owner);
  const selected =
    release ?? (await api(`${owner.repository}/releases/tags/${encodeURIComponent(m.tag)}`));
  if (m.migrations.destructive)
    throw new Error(
      "Destructive migration requires a reviewed recoverable DB/content snapshot and separate rollout",
    );
  const zip = await asset(selected, m.plugin.asset);
  if (hash(zip) !== m.plugin.sha256) throw new Error("Plugin SHA256 mismatch");
  writeFileSync(`${cms}/nightly/${m.plugin.asset}`, zip);
  save(`${cms}/nightly/${owner.manifestAsset}`, m);
  composer = snapshotComposer(composer, m, createHash("sha1").update(zip).digest("hex"));
  manifests[name] = m;
  if (name === "content") {
    const p = m.packages[0];
    const tgz = await asset(selected, p.asset);
    verifyPackage(tgz, p);
    mkdirSync("apps/frontend/nightly", { recursive: true });
    writeFileSync(`apps/frontend/nightly/${p.asset}`, tgz);
    // Inspect the archive's own identity before installing its verified bytes.
    const packed = JSON.parse(
      execFileSync("tar", ["-xOf", `apps/frontend/nightly/${p.asset}`, "package/package.json"], {
        encoding: "utf8",
      }),
    );
    if (packed.name !== p.name || packed.version !== m.version)
      throw new Error("Content tarball identity mismatch");
    const frontend = json("apps/frontend/package.json");
    frontend.dependencies[p.name] = `file:nightly/${p.asset}`;
    save("apps/frontend/package.json", frontend);
  }
}
save(`${cms}/composer.json`, composer);
run(
  "composer",
  [
    "update",
    ...Object.values(producers).map((p) => p.plugin),
    "--no-install",
    "--no-scripts",
    "--no-interaction",
    "--minimal-changes",
  ],
  cms,
);
const after = json(`${cms}/composer.lock`);
assertUnchangedDependencies(
  before,
  after,
  Object.values(producers).map((p) => p.plugin),
);
for (const m of Object.values(manifests)) {
  const locked = after.packages.find((p) => p.name === m.plugin.name);
  if (
    locked?.version !== m.plugin.composer.version ||
    locked.dist?.reference !== m.sourceSha ||
    locked.dist?.url !== `./nightly/${m.plugin.asset}`
  )
    throw new Error("Incorrect Composer lock");
}
// Offline resolution preserves already locked transitive dependencies; new
// requirements need deliberate Site adoption. Scripts do not run on this path.
run("pnpm", ["install", "--offline", "--no-frozen-lockfile", "--ignore-scripts"]);
if (JSON.stringify(graphBefore) !== JSON.stringify(graph()))
  throw new Error("Nightly changed frontend/tooling dependencies; explicit Site adoption required");
const installed = json("apps/frontend/node_modules/@getquick/content/package.json");
if (installed.name !== "@getquick/content" || installed.version !== manifests.content.version)
  throw new Error("Incorrect installed Content package");
const m = manifests.design;
const siteSha = git("rev-parse", "HEAD");
const record = {
  schemaVersion: 1,
  deploymentKind: "nomia-design-nightly",
  frontendDeployment: true,
  siteSha,
  manifest: m, // Keep the historical Design ledger field readable.
  manifests,
  pnpmLockSha256: hash(readFileSync("pnpm-lock.yaml")),
  composerLockSha256: hash(readFileSync(`${cms}/composer.lock`)),
  runUrl: `https://github.com/${site}/actions/runs/${process.env.GITHUB_RUN_ID}`,
  selectedManually: manual,
};
save(`${cms}/nightly/deployment.json`, record);
// Commit only in this ephemeral checkout, never push or tag the snapshot.
run("git", [
  "add",
  "-f",
  "apps/cms/composer.json",
  "apps/cms/composer.lock",
  "apps/cms/nightly",
  "apps/frontend/package.json",
  "apps/frontend/nightly",
  "pnpm-lock.yaml",
]);
run("git", [
  "-c",
  "user.name=Nomia nightly",
  "-c",
  "user.email=nightly@getquick.io",
  "-c",
  "core.hooksPath=/dev/null",
  "commit",
  "-m",
  `Nomia snapshot ${m.tag} ${manifests.content.tag}`,
]);
const snapshotSha = git("rev-parse", "HEAD");
mkdirSync("nightly-result", { recursive: true });
run("git", ["bundle", "create", resolve("nightly-result/snapshot.bundle"), "HEAD"]);
save("nightly-result/deployment.json", { ...record, snapshotSha, state: "prepared" });
// Workflow artifact preserves the exact tree, lock and ZIP before any mutation.
writeFileSync(process.env.GITHUB_OUTPUT, `snapshot=${snapshotSha}\ntag=${m.tag}\n`, { flag: "a" });
