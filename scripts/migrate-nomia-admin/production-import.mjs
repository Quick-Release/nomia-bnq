// Imports a prepared WXR into the CMS the Ploi site serves, over a one-off
// Ploi script (the same transport `gq db sync` uses for exports, in reverse).
//
//   node scripts/migrate-nomia-admin/production-import.mjs <prepared.wxr>
//   … --yes
//
// Without --yes the runner only prints the plan and the server script. With
// --yes it uploads the WXR to the releases bucket, hands a short-lived
// presigned GET URL to a one-off script that runs on the server, and waits
// for the import to finish.
//
// Run it through Sigillo so the runner has the release-bucket and Ploi
// credentials:
//
//   pnpm exec gq sigillo run staging -- \
//     node scripts/migrate-nomia-admin/production-import.mjs <prepared.wxr> --yes
//
// What the server script does, in order: fetch and checksum the WXR, decode
// the embedded remap.php, install and activate the WordPress importer, run
// `wp import --authors=create`, remap nomia-cpt attachment IDs, rewrite the
// old domains (media host, admin, frontend), remove the importer, flush the
// caches, then report counts on one marker line. The script is additive: it
// only adds posts/attachments/terms and rewrites old-domain strings.

import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { basename, join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const here = new URL(".", import.meta.url);
const root = new URL("../..", import.meta.url);
const ops = JSON.parse(await readFile(new URL("gq.ops.json", root), "utf8"));
const { createR2Client } = await import(new URL("node_modules/@getquick/site/src/r2.mjs", root));
const { createPloiServerClient } = await import(
  new URL("node_modules/@getquick/site/src/ploi/server-client.mjs", root)
);

// Hosts the export came from. Order matters only in that the media-host
// rewrite runs first; none of the three is a substring of another.
const oldMediaHost = "nomia-media.getquick.io";
const oldAdminHost = "nomia-admin.getquick.io";
const oldFrontHost = "nomia.getquick.io";

// What the posts export is known to contain; the runner warns, not fails,
// when the server's numbers drift from these (they are re-verified from the
// outside afterwards anyway).
const expected = {
  POSTS: 188,
  ATTACHMENTS: 187,
  CATEGORY: 1,
  TAGS: 442,
  THUMBNAILS: 187,
  RESIDUAL: 0,
  MEDIA_FAILS: 0,
};

// ── Arguments and environment ────────────────────────────────────────────────
const args = process.argv.slice(2);
const yes = args.includes("--yes");
const timeoutArg = args.find((arg) => arg.startsWith("--timeout-ms="));
const timeoutMs = timeoutArg ? Number(timeoutArg.slice("--timeout-ms=".length)) : 1_800_000;
const wxrPath = args.find((arg) => !arg.startsWith("--"));
if (!wxrPath) {
  console.error("usage: production-import.mjs <prepared.wxr> [--yes] [--timeout-ms=…]");
  process.exit(2);
}
const wxrFile = join(process.cwd(), wxrPath);

// Credentials only matter once we would write something: the plan (no --yes)
// must run without any.
if (yes) {
  const missing = ["PLOI_API_TOKEN", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"].filter(
    (key) => !process.env[key],
  );
  if (missing.length > 0) {
    console.error(
      `${missing.join(", ")} missing; run through Sigillo, e.g.
  pnpm exec gq sigillo run staging -- \\
    node scripts/migrate-nomia-admin/production-import.mjs ${wxrPath} --yes`,
    );
    process.exit(2);
  }
}

// ── Inputs ───────────────────────────────────────────────────────────────────
const wxr = await readFile(wxrFile);
if (!wxr.toString().trimEnd().endsWith("</rss>")) {
  throw new Error(`${wxrPath} does not look like a prepared WXR (no </rss> at the end).`);
}
const sha256 = createHash("sha256").update(wxr).digest("hex");
const { size } = await stat(wxrFile);
const remap = await readFile(new URL("remap.php", here));
const remapSha = createHash("sha256").update(remap).digest("hex");

const cmsDir = `/home/${ops.ploi.systemUser}/${ops.domains.admin}/apps/cms`;
const key = `${ops.releases?.prefix ?? "admin/"}migration/${basename(wxrFile)}`;
const marker = "NOMIA_IMPORT=success";
const remapKey = `${key.replace(/\.wxr$/, "")}.remap.php`;

// ── The one-off script that runs on the server ───────────────────────────────
// `wxrUrl` and `remapUrl` are presigned GETs; Ploi caps one-off scripts at
// 7,500 characters, so the files travel through R2 rather than being embedded.
// The whole script is additive (import, rewrites) except the importer plugin
// being installed and removed again.
function serverScript(wxrUrl, remapUrl) {
  return `set -euo pipefail
umask 077
cd ${cmsDir}
wxr="$(mktemp /tmp/nomia-import.XXXXXX.wxr)"
remap="$(mktemp /tmp/nomia-remap.XXXXXX.php)"
trap 'rm -f "$wxr" "$remap"' EXIT
curl -fsS --retry 3 --connect-timeout 20 -o "$wxr" '${wxrUrl}'
printf '%s  %s\\n' '${sha256}' "$wxr" | sha256sum -c - >/dev/null
curl -fsS --retry 3 --connect-timeout 20 -o "$remap" '${remapUrl}'
printf '%s  %s\\n' '${remapSha}' "$remap" | sha256sum -c - >/dev/null

wp plugin get wordpress-importer >/dev/null 2>&1 || wp plugin install wordpress-importer --quiet
wp plugin activate wordpress-importer --quiet

import_out="$(wp import "$wxr" --authors=create 2>&1)"
media_fails="$(printf '%s\\n' "$import_out" | grep -ci 'failed' || true)"
printf '%s\\n' "$import_out" | grep -i 'failed' || true

wp eval-file "$remap" wxr="$wxr"

count() { printf '%s' "$1" | grep -oE '[0-9]+ replacement' | head -1 | grep -oE '^[0-9]+' || echo 0; }
r1="$(wp search-replace 'https://${oldMediaHost}/uploads/' 'https://${ops.media.domain}/' --all-tables-with-prefix --precise --report-changed-only)"
r2="$(wp search-replace 'https://${oldAdminHost}' 'https://${ops.domains.admin}' --all-tables-with-prefix --precise --report-changed-only)"
r3="$(wp search-replace 'https://${oldFrontHost}' 'https://${ops.domains.frontend}' --all-tables-with-prefix --precise --report-changed-only)"
echo "rewritten: media=$(count "$r1") admin=$(count "$r2") frontend=$(count "$r3")"

wp plugin deactivate wordpress-importer --quiet
wp plugin delete wordpress-importer --quiet
wp cache flush --quiet
wp rewrite flush --quiet

prefix="$(wp db prefix)"
posts="$(wp post list --post_type=post --post_status=publish --format=count)"
attachments="$(wp post list --post_type=attachment --post_status=inherit --format=count)"
categories="$(wp term list category --format=count)"
tags="$(wp term list post_tag --format=count)"
thumbnails="$(wp db query --skip-column-names "SELECT COUNT(*) FROM \${prefix}postmeta WHERE meta_key = '_thumbnail_id'")"
residual="$(wp db query --skip-column-names "SELECT (SELECT COUNT(*) FROM \${prefix}posts WHERE CONCAT(post_content, post_excerpt, guid) LIKE '%getquick.io%') + (SELECT COUNT(*) FROM \${prefix}postmeta WHERE meta_value LIKE '%getquick.io%')")"
echo "${marker} POSTS=$posts ATTACHMENTS=$attachments CATEGORY=$categories TAGS=$tags THUMBNAILS=$thumbnails RESIDUAL=$residual MEDIA_FAILS=$media_fails"
`;
}

function parseMarker(output) {
  const match = new RegExp(
    `${marker} POSTS=(\\d+) ATTACHMENTS=(\\d+) CATEGORY=(\\d+) TAGS=(\\d+) THUMBNAILS=(\\d+) RESIDUAL=(\\d+) MEDIA_FAILS=(\\d+)`,
    "u",
  ).exec(output ?? "");
  if (!match) return null;
  const [POSTS, ATTACHMENTS, CATEGORY, TAGS, THUMBNAILS, RESIDUAL, MEDIA_FAILS] = match
    .slice(1)
    .map(Number);
  return { POSTS, ATTACHMENTS, CATEGORY, TAGS, THUMBNAILS, RESIDUAL, MEDIA_FAILS };
}

// ── Plan ─────────────────────────────────────────────────────────────────────
const planScript = serverScript("PRESIGNED_WXR_URL", "PRESIGNED_REMAP_URL");
console.log(`WXR      ${wxrPath} (${(size / 1024 / 1024).toFixed(1)} MB, sha256 ${sha256.slice(0, 16)}…)
R2 keys  r2://${ops.releases.bucket}/${key}
         r2://${ops.releases.bucket}/${remapKey}
Server   ${cmsDir} (Ploi site ${ops.ploi.siteId})
Import   wordpress-importer, --authors=create, then remap.php and the three
         rewrites (${oldMediaHost}, ${oldAdminHost}, ${oldFrontHost} → bnq.pt),
         importer removed again; additive only.

--- server script -------------------------------------------------------------
${planScript}--- ---------------------------------------------------------------------------`);

if (!yes) {
  console.log("\nPlan only. Pass --yes (through gq sigillo run staging) to upload and run.");
  process.exit(0);
}

// ── Upload and run ───────────────────────────────────────────────────────────
console.log(`Uploading ${size} bytes to ${key}…`);
const r2 = createR2Client({
  accountId: ops.cloudflare.accountId,
  bucket: ops.releases.bucket,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  fetch,
});
const client = createPloiServerClient({
  token: process.env.PLOI_API_TOKEN,
  serverId: ops.ploi.serverId,
  fetch,
});
const uploaded = await r2.upload(key, [wxr], "application/xml");
if (uploaded.sha256 !== sha256 || uploaded.size !== size) {
  throw new Error("The uploaded WXR does not match the local checksum.");
}
const uploadedRemap = await r2.upload(remapKey, [remap], "application/x-php");
if (uploadedRemap.sha256 !== remapSha) {
  throw new Error("The uploaded remap.php does not match the local checksum.");
}
const wxrUrl = await r2.presignGet(key, 3600);
const remapUrl = await r2.presignGet(remapKey, 3600);
console.log("Uploaded; handing the presigned URLs to the one-off script.");

const started = await client.request("POST", "/scripts/run", {
  content: serverScript(wxrUrl, remapUrl),
  user: ops.ploi.systemUser,
});
const id = started.data?.id ?? started.id;
if (!id) throw new Error("Ploi did not return a script execution id.");
console.log(`One-off script ${id} is running…`);

const deadline = Date.now() + timeoutMs;
let execution = null;
for (;;) {
  if (Date.now() >= deadline) {
    console.error(
      `Timed out after ${Math.round(timeoutMs / 60_000)} min waiting for script ${id}. ` +
        "The script keeps running on the server; poll GET /scripts/run/<id> and DO NOT rerun " +
        "the import until it has finished (a rerun would duplicate the posts).",
    );
    process.exit(1);
  }
  const result = (await client.request("GET", `/scripts/run/${id}`)).data ?? {};
  if (result.status === "finished") {
    execution = result;
    break;
  }
  if (result.status === "failed") {
    const note = String(result.output ?? "");
    if (note.includes("timed out")) {
      console.error(
        [
          `Ploi's wrapper job for script ${id} timed out, but the script itself`,
          "may still be running on the server (wp import keeps going). The import",
          "is additive: do NOT rerun it until the server has finished. Watch",
          "the live site (e.g. posts/mediaItems counts via GraphQL, or a fresh",
          "read-only one-off script) and only then clean up the importer",
          "plugin and verify counts.",
        ].join("\n"),
      );
    } else {
      console.error(`Ploi could not run the script ${id}. Output:`);
      console.error(note);
    }
    process.exit(1);
  }
  await sleep(5_000);
}

const tail = (execution.output ?? "").trim().split("\n").slice(-6).join("\n");
const result = parseMarker(execution.output);
if (execution.exit_code !== 0 || !result) {
  console.error(`The import script failed (exit ${execution.exit_code}):\n${tail}`);
  process.exit(1);
}

console.log(`\n${tail}`);
const drift = Object.entries(expected).filter(([field, value]) => result[field] !== value);
if (drift.length > 0) {
  console.warn(
    `\nCounts differ from expected: ${drift
      .map(([field, value]) => `${field} got ${result[field]}, expected ${value}`)
      .join("; ")}. Verify before going further.`,
  );
} else {
  console.log("\nAll counts match the posts rehearsal. Verify GraphQL and the frontend next.");
}
console.log(
  `\nThe WXR stays in R2 at r2://${ops.releases.bucket}/${key} for audit or a rerun.\n` +
    `Follow-up: pnpm run db:sync (mirror live → local), pnpm run site:check.`,
);
