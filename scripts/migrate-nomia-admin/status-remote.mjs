// Read-only production status probe for the nomia pages import. Makes no
// changes; safe to run while the importer is still working.
//
//   pnpm exec gq sigillo run staging -- node scripts/migrate-nomia-admin/status-remote.mjs
const script = `#!/bin/bash
set -uo pipefail
cd /home/nomiabnq/nomia-cms.bnq.pt/apps/cms || exit 1
echo "== read-only status =="
if wp plugin get wordpress-importer >/dev/null 2>&1; then echo "importer-plugin: present"; else echo "importer-plugin: absent"; fi
( ps aux | grep -F 'wp import' | grep -v grep | head -3 ) || true
posts=$(wp post list --post_type=post --post_status=publish --format=count)
pages=$(wp post list --post_type=page --post_status=any --format=count)
pages_pub=$(wp post list --post_type=page --post_status=publish --format=count)
att=$(wp post list --post_type=attachment --post_status=inherit --format=count)
prefix=$(wp db prefix)
thumbs=$(wp db query --skip-column-names "SELECT COUNT(*) FROM \${prefix}postmeta WHERE meta_key = '_thumbnail_id'")
residual=$(wp db query --skip-column-names "SELECT (SELECT COUNT(*) FROM \${prefix}posts WHERE CONCAT(post_content, post_excerpt, guid) LIKE '%getquick.io%') + (SELECT COUNT(*) FROM \${prefix}postmeta WHERE meta_value LIKE '%getquick.io%')")
echo "POSTS=$posts PAGES_ANY=$pages PAGES_PUB=$pages_pub ATT=$att THUMBS=$thumbs RESIDUAL=$residual"
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
console.log(`status probe: ${id}`);
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
