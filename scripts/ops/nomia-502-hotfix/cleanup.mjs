#!/usr/bin/env node
/**
 * Removes the temporary 502 diagnostic mu-plugin from production. The hotfix
 * mu-plugin is kept until the durable fix ships.
 *
 * Run with: pnpm exec gq sigillo run staging -- node scripts/ops/nomia-502-hotfix/cleanup.mjs
 */
const script = `#!/bin/bash
set -uo pipefail
cd /home/nomiabnq/nomia-cms.bnq.pt/apps/cms || exit 1
rm -f web/app/mu-plugins/nomia-debug-peak.php
rm -rf web/app/nomia-debug
echo "== mu-plugins after cleanup =="
ls -la web/app/mu-plugins/
test -f web/app/mu-plugins/gq-silence-low-severity.php && echo "hotfix mu-plugin: present" || echo "hotfix mu-plugin: MISSING"
exit 0
`;
import { createPloiServerClient } from "../../../node_modules/@getquick/site/src/ploi/server-client.mjs";
const client = createPloiServerClient({
  token: process.env.PLOI_API_TOKEN,
  serverId: "102329",
  fetch,
});
const response = await client.request("POST", "/scripts/run", {
  content: script,
  user: "nomiabnq",
});
const id = response.data?.id ?? response.id;
console.log(`cleanup started: ${id}`);
for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 4000));
  const status = (await client.request("GET", `/scripts/run/${id}`)).data ?? {};
  const state = status.status ?? "unknown";
  if (state === "finished" || state === "failed") {
    console.log(`--- output ---`);
    console.log(status.output ?? "");
    process.exit(0);
  }
  console.log(`poll ${i + 1}: ${state}`);
}
console.log("still running; check Ploi later.");
