#!/usr/bin/env node
/**
 * Applies the nomia-502 hotfix to production:
 *
 *   1. Installs web/app/mu-plugins/gq-silence-low-severity.php (via a one-off
 *      Ploi script), lints it, then smoke-tests /wp/graphql with the exact full
 *      EntryByUri recon query: 4 sequential + 4 concurrent requests.
 *   2. As root, counts nginx "too big header" / "PHP message" stderr entries in
 *      the site error log before/after 3 fresh requests.
 *
 * Run with: pnpm exec gq sigillo run staging -- node scripts/ops/nomia-502-hotfix/apply.mjs
 */
import { readFileSync } from "node:fs";
import { createPloiServerClient } from "../../../node_modules/@getquick/site/src/ploi/server-client.mjs";

/** The exact full EntryByUri query the frontend/recon uses (monolingual: no language fields). */
const testQuery = /* GraphQL */ `
  query EntryByUri($uri: String!, $withBlocks: Boolean = true) {
    designTokens {
      colors {
        slug
        color
      }
      spacingSizes {
        slug
        size
      }
    }
    postBy(uri: $uri) {
      id
      title
      excerpt
      content
      blocks(attributes: true, htmlContent: true, dynamicContent: true, postTemplate: false)
        @include(if: $withBlocks)
      uri
      date
      status
      isRestricted
      modifiedGmt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
    pageBy(uri: $uri) {
      id
      title
      content
      blocks(attributes: true, htmlContent: true, dynamicContent: true, postTemplate: false)
        @include(if: $withBlocks)
      uri
      status
      isRestricted
      modifiedGmt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
`;

const pluginB64 = readFileSync(new URL("./gq-silence-low-severity.php", import.meta.url)).toString(
  "base64",
);
const queryB64 = Buffer.from(
  JSON.stringify({ query: testQuery, variables: { uri: "/2017/03/09/jindo-burel/" } }),
).toString("base64");

const installScript = `#!/bin/bash
set -uo pipefail
cd /home/nomiabnq/nomia-cms.bnq.pt/apps/cms || exit 1
echo "== install mu-plugin =="
printf '%s' '${pluginB64}' | base64 -d > web/app/mu-plugins/gq-silence-low-severity.php
chmod 644 web/app/mu-plugins/gq-silence-low-severity.php
sha256sum web/app/mu-plugins/gq-silence-low-severity.php
( php8.4 -l web/app/mu-plugins/gq-silence-low-severity.php 2>&1 || php -l web/app/mu-plugins/gq-silence-low-severity.php 2>&1 ) | tail -2
printf '%s' '${queryB64}' | base64 -d > /tmp/nomia-recon-test.json
ls -la web/app/mu-plugins/
echo "== smoke: 4 sequential (full EntryByUri) =="
for i in 1 2 3 4; do
  curl -sk -o /dev/null -w "seq$i=%{http_code} time=%{time_total}s\\n" \\
    "https://nomia-cms.bnq.pt/wp/graphql" \\
    -H 'Content-Type: application/json' -H 'User-Agent: Mozilla/5.0' \\
    --data-binary @/tmp/nomia-recon-test.json
done
echo "== smoke: 4 concurrent (full EntryByUri) =="
for i in 1 2 3 4; do
  curl -sk -o /dev/null -w "conc$i=%{http_code} time=%{time_total}s\\n" \\
    "https://nomia-cms.bnq.pt/wp/graphql" \\
    -H 'Content-Type: application/json' -H 'User-Agent: Mozilla/5.0' \\
    --data-binary @/tmp/nomia-recon-test.json &
done
wait
echo "== install+smoke done =="
exit 0
`;

const verifyScript = `#!/bin/bash
set -uo pipefail
LOG=/var/log/nginx/nomia-cms.bnq.pt-error.log
B=$(grep -c -F 'too big header' "$LOG" || true)
Bm=$(grep -c -F 'PHP message' "$LOG" || true)
echo "== verify: 3 fresh full queries (root) =="
for i in 1 2 3; do
  curl -sk -o /dev/null -w "v$i=%{http_code} time=%{time_total}s\\n" \\
    "https://nomia-cms.bnq.pt/wp/graphql" \\
    -H 'Content-Type: application/json' -H 'User-Agent: Mozilla/5.0' \\
    --data-binary @/tmp/nomia-recon-test.json
done
A=$(grep -c -F 'too big header' "$LOG" || true)
Am=$(grep -c -F 'PHP message' "$LOG" || true)
echo "too_big_header: before=$B after=$A delta=$((A-B))"
echo "php_messages:   before=$Bm after=$Am delta=$((Am-Bm))"
echo "== last 3 log lines =="
tail -n 3 "$LOG"
echo "== verify done =="
exit 0
`;

const client = createPloiServerClient({
  token: process.env.PLOI_API_TOKEN,
  serverId: "102329",
  fetch,
});

async function runScript({ label, content, user }) {
  const response = await client.request("POST", "/scripts/run", { content, user });
  const id = response.data?.id ?? response.id;
  const unwrap = (status) => status.data ?? status;
  console.log(`[${label}] started: ${id}`);
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    const status = unwrap(await client.request("GET", `/scripts/run/${id}`));
    const state = status.status ?? "unknown";
    console.log(`[${label}] poll ${i + 1}: ${state}`);
    if (state === "finished" || state === "failed") {
      const out = status.output ?? "";
      console.log(`[${label}] --- output ---`);
      console.log(out);
      if (state === "failed" || out.includes("timed out")) {
        console.log(
          `[${label}] note: Ploi job timeout is NOT a script failure; verify server state before re-running.`,
        );
      }
      return state === "finished" && !out.includes("timed out");
    }
  }
  console.log(`[${label}] still running; check Ploi later.`);
  return false;
}

const ok = await runScript({ label: "install+smoke", content: installScript, user: "nomiabnq" });
if (!ok) {
  console.error("Install/smoke did not finish cleanly; not running the root verification.");
  process.exit(1);
}
await runScript({ label: "verify(root)", content: verifyScript, user: "root" });
