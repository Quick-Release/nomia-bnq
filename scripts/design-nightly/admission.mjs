// Read-only automatic admission before installs, snapshot downloads or bundles.
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { producers, activationDecision, nightlyTargetEnabled } from "./model.mjs";
import { latest, deploymentHistory, currentActionsJob } from "./github.mjs";

const site = process.env.GITHUB_REPOSITORY;
if (site !== "Quick-Release/nomia-bnq") throw new Error("Expected Nomia repository");
const json = (path) => JSON.parse(readFileSync(path, "utf8"));
if (!nightlyTargetEnabled(json("design-nightly.json"), json("gq.ops.json")))
  throw new Error("Nightly development target is not enabled or does not match");
const currentJob = await currentActionsJob({
  site,
  runId: process.env.GITHUB_RUN_ID,
  attempt: process.env.GITHUB_RUN_ATTEMPT,
  jobName: process.env.GITHUB_JOB,
  headSha: process.env.GITHUB_SHA,
  refName: process.env.GITHUB_REF_NAME,
  runnerName: process.env.RUNNER_NAME,
});
const manifests = Object.fromEntries(
  await Promise.all(
    Object.entries(producers).map(async ([name, owner]) => [name, await latest(owner)]),
  ),
);
const snapshot = {
  siteSha: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  frontendDeployment: true,
  manifests,
};
const decision = activationDecision(
  manifests.design,
  await deploymentHistory(site),
  false,
  currentJob,
  snapshot,
);
appendFileSync(process.env.GITHUB_OUTPUT, `needed=${decision === "activate"}\n`);
console.log(
  decision === "activate"
    ? "New Site/Design/Content snapshot required"
    : "No new Site/Design/Content snapshot; skipping preparation",
);
