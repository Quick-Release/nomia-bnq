import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { activationDecision } from "./model.mjs";
import { api, latest } from "./github.mjs";

const site = process.env.GITHUB_REPOSITORY;
const environment = "nomia-design-nightly";
const recordPath = "nightly-result/deployment.json";
const record = JSON.parse(readFileSync(recordPath, "utf8"));
const m = record.manifest;
const save = () => writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`);
const compare = (a, b) => a.sequence - b.sequence || a.attempt - b.attempt;
if (site !== "Quick-Release/nomia-bnq" || !/^[a-f0-9]{40}$/.test(record.snapshotSha))
  throw new Error("Invalid Nomia snapshot");
// One workflow concurrency group covers preparation, activation, refresh and
// manual selection. Never cancel an active Ploi deployment.
const history = [];
for (let page = 1; ; page++) {
  const deployments = await api(
    `${site}/deployments?environment=${environment}&per_page=100&page=${page}`,
  );
  for (const deployment of deployments) {
    const statuses = await api(`${site}/deployments/${deployment.id}/statuses?per_page=1`);
    history.push({
      id: deployment.id,
      state: statuses[0]?.state,
      manifest: deployment.payload?.manifest,
    });
  }
  if (deployments.length < 100) break;
}
if (activationDecision(m, history, record.selectedManually) === "superseded") {
  record.state = "superseded";
  save();
  process.exit(0);
}
if (!record.selectedManually && compare(await latest(), m) > 0) {
  record.state = "superseded";
  save();
  process.exit(0);
}
const deployment = await api(`${site}/deployments`, {
  ref: record.siteSha,
  environment,
  auto_merge: false,
  required_contexts: [],
  description: m.tag,
  transient_environment: true,
  production_environment: false,
  payload: record,
});
record.deploymentId = deployment.id;
record.state = "in_progress";
save();
await api(`${site}/deployments/${deployment.id}/statuses`, {
  state: "in_progress",
  log_url: record.runUrl,
  auto_inactive: false,
});
try {
  execFileSync(
    "pnpm",
    ["exec", "gq", "ploi", "release", "--ref", record.snapshotSha, "--git-dir", process.cwd()],
    { stdio: "inherit" },
  );
  record.cmsCompletedAt = new Date().toISOString();
  save();
  // Refresh publication output using the existing operation, no frontend build
  // or acceptance suite is required for this plugin-only adoption.
  execFileSync("pnpm", ["exec", "gq", "frontend", "refresh"], { stdio: "inherit" });
  record.state = "success";
  record.completedAt = new Date().toISOString();
  save();
  await api(`${site}/deployments/${deployment.id}/statuses`, {
    state: "success",
    log_url: record.runUrl,
    environment_url: "https://nomia-cms.bnq.pt",
    auto_inactive: true,
  });
} catch (error) {
  // A timeout or runner loss does not prove the remote deployment stopped.
  // Keep its durable in_progress fence until an operator reconciles it.
  record.state = "needs-reconciliation";
  save();
  throw error;
}
