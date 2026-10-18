// Read-only production log audit for the wpgraphql-blocks 502 investigation.
// Dumps the exact PHP warning shapes recorded in the nginx error logs around
// the storm (before the silence mu-plugin) and lists current mu-plugins.
// Logs are root-owned, so greps go through sudo -n (read-only).
//
//   pnpm exec gq sigillo run staging -- node scripts/ops/nomia-502-hotfix/log-audit-remote.mjs
const script = `#!/bin/bash
set -uo pipefail
echo "=== mu-plugins ==="
ls /home/nomiabnq/nomia-cms.bnq.pt/apps/cms/web/app/mu-plugins/ | sort
echo "=== wpgraphql-blocks occurrences per log file ==="
for log in /var/log/nginx/nomia-cms.bnq.pt-error.log /var/log/nginx/nomia-cms.bnq.pt-error.log.1 /var/log/php8.4-fpm.log; do
  if [ -r "$log" ]; then
    echo "--- $log: $(grep -c 'wpgraphql-blocks' "$log" || true)"
  elif sudo -n test -f "$log" 2>/dev/null; then
    echo "--- $log: $(sudo -n grep -c 'wpgraphql-blocks' "$log" || true)"
  else
    echo "--- $log: unreadable"
  fi
done
echo "=== sample lines (last 6, nginx error.log + rotated) ==="
grep -a 'wpgraphql-blocks' /var/log/nginx/nomia-cms.bnq.pt-error.log 2>/dev/null | tail -3
grep -a 'wpgraphql-blocks' /var/log/nginx/nomia-cms.bnq.pt-error.log.1 2>/dev/null | tail -3
echo "=== php fpm log (last 3 relevant) ==="
grep -a 'wpgraphql-blocks' /var/log/php8.4-fpm.log 2>/dev/null | tail -3
exit 0
`;
import { createPloiServerClient } from "../../../node_modules/@getquick/site/src/ploi/server-client.mjs";
const client = createPloiServerClient({
  token: process.env.PLOI_API_TOKEN,
  serverId: "102329",
  fetch,
});
const started = await client.request("POST", "/scripts/run", { content: script, user: "root" });
const id = started.data?.id ?? started.id;
console.log(`log-audit probe: ${id}`);
for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 4000));
  const status = (await client.request("GET", `/scripts/run/${id}`)).data ?? {};
  if (status.status === "finished" || status.status === "failed") {
    console.log("--- output ---");
    console.log(status.output ?? "");
    process.exit(0);
  }
  console.log(`poll ${i + 1}: ${status.status}`);
}
console.log("still running; check Ploi later.");
