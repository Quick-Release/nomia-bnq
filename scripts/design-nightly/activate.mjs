import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { activationDecision, compareNightlies, producers } from "./model.mjs";
import { api, latest, currentActionsJob } from "./github.mjs";
import { completeDeployment } from "./completion.mjs";

const site = process.env.GITHUB_REPOSITORY;
const environment = "nomia-design-nightly";
const recordPath = "nightly-result/deployment.json";
const record = JSON.parse(readFileSync(recordPath, "utf8"));
const m = record.manifest;
const save = () => writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`);
if (site !== "Quick-Release/nomia-bnq" || !/^[a-f0-9]{40}$/.test(record.snapshotSha))
  throw new Error("Invalid Nomia snapshot");
// One workflow concurrency group covers preparation, activation, refresh and
// manual selection. Never cancel an active Ploi deployment.
const currentJob = await currentActionsJob({
  site,
  runId: process.env.GITHUB_RUN_ID,
  attempt: process.env.GITHUB_RUN_ATTEMPT,
  jobName: process.env.GITHUB_JOB,
  headSha: process.env.GITHUB_SHA,
  refName: process.env.GITHUB_REF_NAME,
  runnerName: process.env.RUNNER_NAME,
});
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
      payload: deployment.payload,
      ref: deployment.ref,
      sha: deployment.sha,
      environment: deployment.environment,
      task: deployment.task,
      logUrl: statuses[0]?.log_url,
    });
  }
  if (deployments.length < 100) break;
}
if (activationDecision(m, history, record.selectedManually, currentJob, record) === "superseded") {
  record.state = "superseded";
  save();
  process.exit(0);
}
if (
  !record.selectedManually &&
  (
    await Promise.all(
      Object.entries(producers).map(
        async ([name, owner]) => compareNightlies(await latest(owner), record.manifests[name]) > 0,
      ),
    )
  ).some(Boolean)
) {
  record.state = "superseded";
  save();
  process.exit(0);
}
const deployment = await api(`${site}/deployments`, {
  ref: record.siteSha,
  environment,
  auto_merge: false,
  required_contexts: [],
  description: `Design ${m.version}; Content ${record.manifests.content.version}`,
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
  // Alchemy builds and deploys the frontend from this same snapshot. Keep both
  // targets under the existing lock and fence until publication refresh ends.
  execFileSync("pnpm", ["run", "deploy:frontend:raw"], { stdio: "inherit" });
  record.frontendCompletedAt = new Date().toISOString();
  save();
  execFileSync("pnpm", ["exec", "gq", "frontend", "refresh"], { stdio: "inherit" });
  record.state = "success";
  record.completedAt = new Date().toISOString();
  save();
  await completeDeployment(record);
} catch (error) {
  // A timeout or runner loss does not prove the remote deployment stopped.
  // Keep its durable in_progress fence until an operator reconciles it.
  record.state = "needs-reconciliation";
  save();
  throw error;
}
