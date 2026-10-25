import https from "node:https";

const transient = (error) =>
  error.retryable === true ||
  ["EPIPE", "ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "EAI_AGAIN", "ABORT_ERR"].includes(
    error.code ?? error.cause?.code,
  );

// Activation blocks the event loop for minutes. Never reuse its earlier fetch
// pool for completion: the peer may have closed an idle socket in the meantime.
export function statusRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      `https://api.github.com/repos/${path}`,
      {
        method,
        agent: false,
        signal: AbortSignal.timeout(15_000),
        headers: {
          Authorization: `Bearer ${process.env.SITE_GH_TOKEN}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "nomia-design-nightly",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
      (response) => {
        let text = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => (text += chunk));
        response.on("error", reject);
        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(
              Object.assign(new Error(`GitHub completion HTTP ${response.statusCode}`), {
                retryable: response.statusCode >= 500 || response.statusCode === 429,
              }),
            );
            return;
          }
          try {
            resolve(JSON.parse(text));
          } catch {
            reject(new Error("Invalid GitHub completion JSON response"));
          }
        });
      },
    );
    request.on("error", reject);
    request.end(body ? JSON.stringify(body) : undefined);
  });
}

// Only the same deployment's success status is repeatable. This function has
// no activation/refresh callback and cannot replay either remote operation.
export async function completeDeployment(record, send = statusRequest) {
  if (
    !Number.isSafeInteger(record.deploymentId) ||
    record.deploymentId <= 0 ||
    !/^https:\/\/github\.com\/Quick-Release\/nomia-bnq\/actions\/runs\/\d+$/.test(record.runUrl)
  )
    throw new Error("Invalid completion identity");
  const path = `Quick-Release/nomia-bnq/deployments/${record.deploymentId}/statuses`;
  const desired = {
    state: "success",
    log_url: record.runUrl,
    environment_url: "https://nomia-cms.bnq.pt",
    auto_inactive: true,
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await send("POST", path, desired);
      return;
    } catch (error) {
      if (!transient(error)) throw error;
      // A lost response can mean the POST was committed. Read before repeating
      // the status, and never overwrite an unrelated/terminal state.
      const statuses = await send("GET", `${path}?per_page=1`);
      const latest = statuses[0];
      if (
        latest?.state === desired.state &&
        latest.log_url === desired.log_url &&
        latest.environment_url === desired.environment_url
      )
        return;
      if (latest?.state !== "in_progress" || latest.log_url !== desired.log_url)
        throw new Error("Conflicting deployment completion; reconcile before retrying");
      if (attempt === 2) throw error;
    }
  }
}
