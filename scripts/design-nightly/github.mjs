import { producers, validateManifest, newest } from "./model.mjs";
const token = process.env.GH_TOKEN;
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
export async function api(path, body) {
  const requestHeaders =
    path.startsWith("Quick-Release/nomia-bnq/") && process.env.SITE_GH_TOKEN
      ? { ...headers, Authorization: `Bearer ${process.env.SITE_GH_TOKEN}` }
      : headers;
  const response = await fetch(`https://api.github.com/repos/${path}`, {
    method: body ? "POST" : "GET",
    headers: requestHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${path}`);
  return response.json();
}
export async function asset(release, name) {
  const entry = release.assets.find((a) => a.name === name && a.state === "uploaded");
  if (!entry) throw new Error(`Missing release asset ${name}`);
  const response = await fetch(entry.url, {
    headers: { ...headers, Accept: "application/octet-stream" },
  });
  if (!response.ok) throw new Error(`Asset download ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
export async function manifest(release, owner = producers.design) {
  const m = JSON.parse(await asset(release, owner.manifestAsset));
  const ref = await api(`${owner.repository}/git/ref/tags/${encodeURIComponent(release.tag_name)}`);
  let object = ref.object;
  for (let i = 0; object.type === "tag" && i < 5; i++)
    object = (await api(`${owner.repository}/git/tags/${object.sha}`)).object;
  if (object.type !== "commit" || release.draft || !release.prerelease)
    throw new Error("Expected published nightly tag at commit");
  validateManifest(m, release.tag_name, object.sha, owner);
  const requiredAssets = [m.plugin.asset, ...m.packages.map((p) => p.asset)];
  if (
    requiredAssets.some(
      (name) => !release.assets.some((asset) => asset.name === name && asset.state === "uploaded"),
    )
  )
    throw new Error("Incomplete lockstep release assets");
  return m;
}
export async function latest(owner = producers.design) {
  const ready = [];
  for (let page = 1; ; page++) {
    const releases = await api(`${owner.repository}/releases?per_page=100&page=${page}`);
    for (const release of releases.filter(
      (r) =>
        !r.draft &&
        r.prerelease &&
        /^v\d+\.\d+\.\d+-nightly\./.test(r.tag_name) &&
        r.assets.some((a) => a.name === owner.manifestAsset),
    )) {
      // A published completion manifest with invalid metadata must fail closed.
      const parts = /-nightly\.\d{8}\.(\d+)\.(\d+)$/.exec(release.tag_name);
      if (!parts) throw new Error("Invalid published nightly tag");
      ready.push({ release, sequence: Number(parts[1]), attempt: Number(parts[2]) });
    }
    if (releases.length < 100) break;
  }
  const m = newest(ready);
  if (!m) throw new Error("No complete nightly releases");
  return manifest(m.release, owner);
}

export async function currentActionsJob({
  site,
  runId,
  attempt,
  jobName,
  headSha,
  refName,
  runnerName,
}) {
  if (
    !/^\d+$/.test(runId ?? "") ||
    !/^\d+$/.test(attempt ?? "") ||
    !/^[a-f0-9]{40}$/.test(headSha ?? "") ||
    !jobName ||
    !refName ||
    !runnerName
  )
    throw new Error("Missing current Actions job identity");
  const result = await api(`${site}/actions/runs/${runId}/attempts/${attempt}/jobs?per_page=100`);
  const matches = result.jobs.filter(
    (job) =>
      job.name === jobName &&
      job.head_sha === headSha &&
      String(job.run_id) === runId &&
      job.runner_name === runnerName &&
      job.status === "in_progress",
  );
  if (result.total_count > 100 || matches.length !== 1)
    throw new Error("Current Actions job is not uniquely authenticated");
  const jobUrl = `https://github.com/${site}/actions/runs/${runId}/job/${matches[0].id}`;
  if (matches[0].html_url !== jobUrl) throw new Error("Unexpected current Actions job URL");
  return { jobUrl, headSha, refName, environment: "nomia-design-nightly" };
}

// One GraphQL batch per REST deployment page retains every historical fence
// without one status request per record on the five-minute admission check.
export async function deploymentStatuses(deployments) {
  if (!deployments.length) return [];
  if (deployments.some((d) => typeof d.node_id !== "string"))
    throw new Error("Missing deployment node identity");
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...headers, Authorization: `Bearer ${process.env.SITE_GH_TOKEN}` },
    body: JSON.stringify({
      query:
        "query($ids:[ID!]!){nodes(ids:$ids){... on Deployment{id latestStatus{state logUrl}}}}",
      variables: { ids: deployments.map((d) => d.node_id) },
    }),
  });
  if (!response.ok) throw new Error(`Deployment status batch HTTP ${response.status}`);
  const result = await response.json();
  if (
    result.errors?.length ||
    !Array.isArray(result.data?.nodes) ||
    result.data.nodes.length !== deployments.length
  )
    throw new Error("Incomplete deployment status batch");
  return result.data.nodes.map((node, index) => {
    if (node?.id !== deployments[index].node_id)
      throw new Error("Deployment status identity mismatch");
    return { state: node.latestStatus?.state?.toLowerCase(), log_url: node.latestStatus?.logUrl };
  });
}
