// Lists production's published page URIs and per-URI state from the CMS
// (read-only) so the missing tombstones can be matched against them.
//
//   pnpm exec gq sigillo run staging -- node scripts/migrate-nomia-admin/page-uris-remote.mjs
const script = `#!/bin/bash
set -uo pipefail
cd /home/nomiabnq/nomia-cms.bnq.pt/apps/cms || exit 1
printf 'URI\\tSTATUS\\tID\\n'
wp post list --post_type=page --post_status=publish --posts_per_page=200 --fields=ID,post_name,post_title --format=csv 2>/dev/null | tail -n +2 | sort -n | while IFS=, read -r id name title; do
  url=$(wp post url "$id" 2>/dev/null)
  uri=$(printf '%s' "$url" | sed 's|https://nomia-cms.bnq.pt||')
  printf '%s\\t%s\\t%s\\n' "$uri" "publish" "$id"
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
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 4000));
  const status = (await client.request("GET", `/scripts/run/${id}`)).data ?? {};
  if (status.status === "finished" || status.status === "failed") {
    console.log((status.output ?? "").trim());
    process.exit(0);
  }
}
console.log("still running; check Ploi later.");
