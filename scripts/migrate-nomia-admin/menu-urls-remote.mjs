// Read-only: lists production CMS nav menu items (titles + urls) so their
// targets can be compared with the frontend's served URIs.
//
//   pnpm exec gq sigillo run staging -- node scripts/migrate-nomia-admin/menu-urls-remote.mjs
const script = `#!/bin/bash
set -uo pipefail
cd /home/nomiabnq/nomia-cms.bnq.pt/apps/cms || exit 1
for m in $(wp term list nav_menu --field=name 2>/dev/null); do
  echo "== $m =="
  wp menu item list "$m" --fields=title,url --format=csv 2>/dev/null | tail -n +2 | head -40
done
exit 0
`;
import { createPloiServerClient } from "../../node_modules/@getquick/site/src/ploi/server-client.mjs";
const client = createPloiServerClient({
  token: process.env.PLOI_API_TOKEN,
  serverId: "102329",
  fetch,
});
const started = await client.request("POST", "/scripts/run", { content: script, user: "nomiabnq" });
const id = started.data?.id ?? started.id;
console.log(`menu probe: ${id}`);
for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 4000));
  const status = (await client.request("GET", `/scripts/run/${id}`)).data ?? {};
  if (status.status === "finished" || status.status === "failed") {
    console.log("--- output ---");
    console.log((status.output ?? "").trim());
    process.exit(0);
  }
}
console.log("still running; check Ploi later.");
