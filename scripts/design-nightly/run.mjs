// Nomia development CMS and frontend. No automated suites run on this path.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { producer, hash, snapshotComposer, assertUnchangedDependencies } from "./model.mjs";

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
if (
  !manual &&
  !sitePush &&
  (event.action !== "gq_design_nightly" ||
    event.client_payload?.repository !== producer ||
    event.client_payload?.manifestAsset !== "design-release.json")
)
  throw new Error("Unexpected dispatch");
const tag = manual ? event.inputs?.tag : null;
const release = tag ? await api(`${producer}/releases/tags/${encodeURIComponent(tag)}`) : null;
const m = release ? await manifest(release) : await latest();
const selected = release ?? (await api(`${producer}/releases/tags/${encodeURIComponent(m.tag)}`));
if (m.migrations?.destructive)
  throw new Error(
    "Destructive migration requires a reviewed recoverable DB/content snapshot and separate rollout",
  );
const zip = await asset(selected, m.plugin.asset);
if (hash(zip) !== m.plugin.sha256) throw new Error("Plugin SHA256 mismatch");
const cms = resolve("apps/cms");
mkdirSync(`${cms}/nightly`, { recursive: true });
writeFileSync(`${cms}/nightly/${m.plugin.asset}`, zip);
save(`${cms}/nightly/design-release.json`, m);
const before = json(`${cms}/composer.lock`);
save(
  `${cms}/composer.json`,
  snapshotComposer(json(`${cms}/composer.json`), m, createHash("sha1").update(zip).digest("hex")),
);
run(
  "composer",
  [
    "update",
    "getquick/gq-design",
    "--no-install",
    "--no-scripts",
    "--no-interaction",
    "--minimal-changes",
  ],
  cms,
);
const after = json(`${cms}/composer.lock`);
assertUnchangedDependencies(before, after);
const locked = after.packages.find((p) => p.name === m.plugin.name);
if (
  locked?.version !== m.plugin.composer.version ||
  locked.dist?.reference !== m.sourceSha ||
  locked.dist?.url !== `./nightly/${m.plugin.asset}`
)
  throw new Error("Incorrect Composer lock");
const siteSha = git("rev-parse", "HEAD");
const record = {
  schemaVersion: 1,
  deploymentKind: "nomia-design-nightly",
  frontendDeployment: true,
  siteSha,
  manifest: m,
  composerLockSha256: hash(readFileSync(`${cms}/composer.lock`)),
  runUrl: `https://github.com/${site}/actions/runs/${process.env.GITHUB_RUN_ID}`,
  selectedManually: manual,
};
save(`${cms}/nightly/deployment.json`, record);
// Commit only in this ephemeral checkout, never push or tag the snapshot.
run("git", ["add", "-f", "apps/cms/composer.json", "apps/cms/composer.lock", "apps/cms/nightly"]);
run("git", [
  "-c",
  "user.name=Nomia nightly",
  "-c",
  "user.email=nightly@getquick.io",
  "-c",
  "core.hooksPath=/dev/null",
  "commit",
  "-m",
  `Nomia snapshot ${m.tag}`,
]);
const snapshotSha = git("rev-parse", "HEAD");
mkdirSync("nightly-result", { recursive: true });
run("git", ["bundle", "create", resolve("nightly-result/snapshot.bundle"), "HEAD"]);
save("nightly-result/deployment.json", { ...record, snapshotSha, state: "prepared" });
// Workflow artifact preserves the exact tree, lock and ZIP before any mutation.
writeFileSync(process.env.GITHUB_OUTPUT, `snapshot=${snapshotSha}\ntag=${m.tag}\n`, { flag: "a" });
