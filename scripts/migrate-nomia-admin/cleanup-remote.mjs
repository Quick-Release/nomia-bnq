// Finishes the tail of the pages-import one-off whose Ploi wrapper timed out:
// removes wordpress-importer, flushes caches, then prints the same marker
// line the import script would have ended with plus a remap audit. Every
// step is idempotent; safe while nothing else is running.
//
//   pnpm exec gq sigillo run staging -- node scripts/migrate-nomia-admin/cleanup-remote.mjs
const script = `#!/bin/bash
set -uo pipefail
cd /home/nomiabnq/nomia-cms.bnq.pt/apps/cms || exit 1
echo "== cleanup tail =="
wp plugin deactivate wordpress-importer >/dev/null 2>&1 && echo "deactivated" || echo "deactivate: failed/absent"
wp plugin delete wordpress-importer >/dev/null 2>&1 && echo "deleted" || echo "delete: failed/absent"
wp cache flush >/dev/null 2>&1 && echo "cache flushed" || echo "cache flush failed"
wp rewrite flush >/dev/null 2>&1 && echo "rewrite flushed" || echo "rewrite flush failed"
posts=$(wp post list --post_type=post --post_status=publish --format=count)
pages=$(wp post list --post_type=page --post_status=any --format=count)
pages_pub=$(wp post list --post_type=page --post_status=publish --format=count)
att=$(wp post list --post_type=attachment --post_status=inherit --format=count)
prefix=$(wp db prefix)
thumbs=$(wp db query --skip-column-names "SELECT COUNT(*) FROM \${prefix}postmeta WHERE meta_key = '_thumbnail_id'")
tags=$(wp term list post_tag --format=count)
residual=$(wp db query --skip-column-names "SELECT (SELECT COUNT(*) FROM \${prefix}posts WHERE CONCAT(post_content, post_excerpt, guid) LIKE '%getquick.io%') + (SELECT COUNT(*) FROM \${prefix}postmeta WHERE meta_value LIKE '%getquick.io%')")
echo "NOMIA_IMPORT=success POSTS=$posts PAGES_ANY=$pages PAGES_PUB=$pages_pub ATTACHMENTS=$att THUMBNAILS=$thumbs TAGS=$tags RESIDUAL=$residual"
mk="$(wp option get nomia_cpt_migration_attachment_remap 2>/dev/null || echo unset)"
echo "REMAP_MARKER=$mk"
gl=$(wp post list --post_type=nomia_gallery --format=count)
fl=$(wp option get nomia_cpt_footer_logo_ids --format=json 2>/dev/null || echo "(option missing)")
echo "NOMIA_CPT galleries=$gl footer_logo_ids=$fl"
echo "== pre-existing/imported pages =="
wp post list --post_type=page --post_status=any --posts_per_page=200 --fields=ID,post_status,post_name,post_title --format=csv 2>/dev/null | head -50
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
console.log(`cleanup probe: ${id}`);
for (let i = 0; i < 25; i++) {
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
