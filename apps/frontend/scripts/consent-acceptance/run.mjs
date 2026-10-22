// CONSENT-1 / LEGAL-1 acceptance on Nomia's built Frontend (docs/adr/0001):
// the real app, built for Node (the Alchemy Node adapter in place of the
// Cloudflare one) with its Worker bindings on SQLite (workers-env.ts), served
// over HTTP, refreshed from a stub CMS (cms-stub.mjs), then visited in
// Chromium. Runs gq-content's shared acceptance suite
// (@getquick/content/consent/testing) on every route, then Nomia's own
// scenarios. Every third-party request the browser makes is captured and
// answered locally; only the map proxy, server-side, asks OpenFreeMap.
// Evidence: .proofs/consent/acceptance.json. Nothing reaches Cloudflare or a
// real CMS.
//
//   pnpm --filter @nomia-bnq/frontend consent:acceptance
import { distilledNode } from "@alchemy.run/frontend-frameworks/astro/node";
import { readConsentCookie } from "@getquick/content/consent";
import { consentMigrationsDirectory } from "@getquick/content/consent/migrations";
import { migrationsDirectory } from "@getquick/content/migrations";
import { failures, runConsentAcceptance, scanConsentHtml } from "@getquick/content/consent/testing";
import { build } from "astro";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { ENTRIES, startCms } from "./cms-stub.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const proofs = join(root, ".proofs/consent");
mkdirSync(proofs, { recursive: true });
const work = mkdtempSync(join(tmpdir(), "nomia-consent-acceptance-"));
const outDir = join(work, "dist");
const data = join(work, "data");
mkdirSync(data);

// The Site's own hosts besides the Frontend's (gq.ops.json): its CMS and media.
const firstPartyHosts = ["nomia-cms.bnq.pt", "nomia-media.bnq.pt"];
const ROUTES = ["/", ...Object.keys(ENTRIES)];

const evidence = { startedAt: new Date().toISOString(), versions: {}, checks: [], scenarios: [] };
const pass = (criteria, detail) => {
  evidence.scenarios.push({ criteria, detail, passed: true });
  console.log(`PASS ${criteria.join(", ")}: ${detail}`);
};

// The Frontend's port first: the CMS's Legal Contract names its URLs.
const server = createServer();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const cms = await startCms(origin);

process.env.PUBLIC_WORDPRESS_GRAPHQL_URL = cms.endpoint;
process.env.CONSENT_ACCEPTANCE_DATA = data;
// The bundled server can't find the package's migrations from its own
// location: their directories are passed in.
process.env.PUBLICATION_MIGRATIONS = migrationsDirectory;
process.env.CONSENT_MIGRATIONS = consentMigrationsDirectory;
process.env.CONSENT_ACCEPTANCE_REFRESH_TOKEN = randomBytes(24).toString("hex");
process.env.CONSENT_ACCEPTANCE_READ_TOKEN = randomBytes(24).toString("hex");

let browser;
try {
  // 1. Build the real app for Node.
  await build({
    root,
    outDir,
    site: origin,
    logLevel: "warn",
    integrations: [distilledNode()],
    vite: {
      resolve: {
        alias: { "cloudflare:workers": fileURLToPath(new URL("workers-env.ts", import.meta.url)) },
      },
    },
  });
  const entry = join(outDir, "server/entry.mjs");
  assert.ok(existsSync(entry), `the Node build has its server entry (${entry})`);
  const { handler } = await import(pathToFileURL(entry).href);

  // 2. Serve it: the client build's files, then the app.
  const client = join(outDir, "client");
  const types = {
    ".js": "text/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".woff2": "font/woff2",
  };
  server.on("request", async (incoming, outgoing) => {
    try {
      const url = new URL(incoming.url, origin);
      const file = join(client, decodeURIComponent(url.pathname));
      if (file.startsWith(client) && existsSync(file) && statSync(file).isFile()) {
        outgoing.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
        createReadStream(file).pipe(outgoing);
        return;
      }
      const body = ["GET", "HEAD"].includes(incoming.method) ? undefined : Readable.toWeb(incoming);
      const response = await handler(
        new Request(url, {
          method: incoming.method,
          headers: incoming.headers,
          body,
          duplex: "half",
        }),
      );
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      if (response.headers.has("set-cookie"))
        outgoing.setHeader("Set-Cookie", response.headers.getSetCookie());
      outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      console.error(error);
      outgoing.writeHead(500).end();
    }
  });

  // 3. Refresh the publication store from the CMS, as `gq frontend refresh` does.
  const refresh = await fetch(`${origin}/gq/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.CONSENT_ACCEPTANCE_REFRESH_TOKEN}` },
    body: "{}",
  });
  assert.equal(refresh.status, 200, await refresh.clone().text());

  const site = { siteOrigin: origin, firstPartyHosts };
  const thirdParty = (url) => {
    const { protocol, host, origin: from } = new URL(url);
    if (!/^https?:$/.test(protocol) || from === origin) return false;
    return !firstPartyHosts.includes(host);
  };
  const leavesSite = (url) => /^https?:/.test(url) && new URL(url).origin !== origin;
  const records = () =>
    new DatabaseSync(join(data, "consent.sqlite"), { readOnly: true })
      .prepare("SELECT * FROM consent_records ORDER BY id")
      .all();

  browser = await chromium.launch();
  evidence.versions.chromium = browser.version();
  // Every request off the Site's origin is captured, then answered locally.
  async function context() {
    const ctx = await browser.newContext();
    await ctx.route(
      (url) => leavesSite(url.href),
      (route) =>
        route.request().resourceType() === "image"
          ? route.fulfill({
              contentType: "image/svg+xml",
              body: "<svg xmlns='http://www.w3.org/2000/svg'/>",
            })
          : route.fulfill({ contentType: "text/html", body: "<!doctype html><title>stub</title>" }),
    );
    const requests = [];
    ctx.on("request", (request) => requests.push(request.url()));
    return { ctx, requests, external: () => requests.filter(thirdParty) };
  }
  const cookieState = async (ctx) => {
    const cookie = (await ctx.cookies()).find((each) => each.name === "gq_consent");
    return cookie ? readConsentCookie(`gq_consent=${cookie.value}`) : null;
  };

  // 4. The shared suite: raw HTML, no interaction, Reject all, presentation.
  const suite = await runConsentAcceptance(
    { newContext: async () => (await context()).ctx },
    { ...site, routes: ROUTES },
  );
  evidence.checks = suite;
  assert.deepEqual(failures(suite), [], JSON.stringify(failures(suite), null, 2));
  pass(
    ["CN-R1", "CN-R4", "CN-R6", "CN-R13"],
    `shared suite: ${suite.length} checks passed on ${ROUTES.join(" ")}`,
  );

  // 5. Raw HTML: what each surface became, and the legal links (LEGAL-1).
  const raw = {};
  for (const route of ROUTES) raw[route] = await (await fetch(`${origin}${route}`)).text();
  const scans = Object.fromEntries(
    ROUTES.map((route) => [route, scanConsentHtml(raw[route], site)]),
  );
  assert.deepEqual(scans["/multimedia/"].placeholders, ["youtube"]);
  assert.deepEqual(scans["/"].placeholders, ["youtube"]);
  assert.deepEqual(scans["/contactos/"].placeholders, ["google_maps"]);
  assert.deepEqual(scans["/bioeconomia/"].placeholders, ["youtube"]);
  assert.ok(raw["/bioeconomia/"].includes("data-gq-decorative"));
  for (const route of ROUTES) {
    assert.deepEqual(scans[route].liveThirdParty, [], route);
    assert.deepEqual(scans[route].blocked, [], route);
    assert.ok(
      raw[route].includes(
        `<a href="${origin}/politica-de-privacidade/" data-gq-legal-role="privacy_policy">`,
      ),
      route,
    );
    assert.ok(raw[route].includes(`data-gq-legal-role="cookie_policy"`), route);
    assert.ok(
      raw[route].includes("data-gq-consent-open") && raw[route].includes("Definições de cookies"),
      route,
    );
    assert.match(raw[route], /<section id="gq-consent-banner"(?![^>]*hidden)[^>]*>/, route);
  }
  pass(
    ["CN-R13", "LG-R5"],
    "core/embed YouTube and the contact map are placeholders, the video hero a decorative one; every route links the privacy and cookie policies and Cookie settings, banner open",
  );

  // 6. The map-list explorer's map: drawn from the Site's own proxy, no third party.
  {
    const { ctx, requests, external } = await context();
    const page = await ctx.newPage();
    await page.goto(`${origin}/mapa/`, { waitUntil: "networkidle" });
    await page.waitForSelector(".maplibregl-canvas", { timeout: 15_000 });
    await page.waitForTimeout(1500);
    const map = requests.filter((url) => url.startsWith(`${origin}/gq/map/`));
    assert.ok(
      map.some((url) => url.endsWith("/gq/map/styles/positron")),
      map.join(),
    );
    assert.ok(
      map.some((url) => /\/gq\/map\/planet\/[^/]+\/\d+\/\d+\/\d+\.pbf$/.test(url)),
      map.join(),
    );
    assert.deepEqual(external(), []);
    assert.ok(!requests.some((url) => url.includes("openfreemap")));
    evidence.mapRequests = map.length;
    pass(
      ["CN-R1", "CN-R3"],
      `the map drew from ${map.length} requests to /gq/map/ (style, tileset, tiles, glyphs, sprites) and none to OpenFreeMap or any third party`,
    );
    await ctx.close();
  }

  // 7. Accept all: YouTube loads, the video hero plays, the decision is recorded.
  {
    const start = records().length;
    const { ctx, external } = await context();
    const page = await ctx.newPage();
    await page.goto(`${origin}/multimedia/`, { waitUntil: "networkidle" });
    assert.deepEqual(external(), []);
    await page.click("#gq-consent-banner [data-gq-consent-accept-all]");
    await page.waitForSelector("[data-gq-consent-embed='youtube'] iframe");
    await page.waitForTimeout(500);
    assert.ok(
      external().some((url) => url.startsWith("https://www.youtube.com/embed/QvtfswLaWlg")),
    );
    await page.goto(`${origin}/bioeconomia/`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-gq-consent-embed='youtube'][data-gq-decorative] iframe");
    assert.ok(
      external().some((url) =>
        url.startsWith("https://www.youtube-nocookie.com/embed/QvtfswLaWlg"),
      ),
    );
    await page.waitForTimeout(500);
    const rows = records().slice(start);
    assert.deepEqual(
      rows.map((row) => [row.action, row.site_id, row.external_media, row.language]),
      [["accept_all", "nomia-bnq", 1, "pt-PT"]],
    );
    assert.deepEqual(JSON.parse(rows[0].legal_revisions), {
      privacy_policy: "2026-05-14T09:14:55Z",
      cookie_policy: "2026-05-14T09:14:55Z",
    });
    assert.ok(!Object.keys(rows[0]).some((column) => /ip|agent|user/i.test(column)));
    assert.equal(rows[0].ui_version, "gq-content@0.2.0");
    pass(
      ["CN-R7", "CN-R8", "CN-R13"],
      "Accept all loads the YouTube embed and the video hero, and appends one accept_all record for nomia-bnq with the legal revisions, no IP or user agent",
    );

    // Withdrawal from the footer's Cookie settings, in no more steps than granting.
    await page.click("footer [data-gq-consent-open]");
    await page.uncheck("#gq-consent-category-external_media");
    await page.click("#gq-consent-preferences [data-gq-consent-save]");
    await page.waitForTimeout(500);
    const state = await cookieState(ctx);
    assert.equal(state.decisions.external_media, false);
    const before = external().length;
    await page.goto(`${origin}/multimedia/`, { waitUntil: "networkidle" });
    assert.equal(external().length, before, "nothing more loads after withdrawal");
    assert.deepEqual(
      records()
        .slice(start)
        .map((row) => row.action),
      ["accept_all", "withdraw"],
    );
    pass(
      ["CN-R6"],
      "withdrawing external media from Cookie settings stops further loading and is recorded as withdraw",
    );
    await ctx.close();
  }

  // 8. The contact map: Load once loads one map and grants nothing.
  {
    const start = records().length;
    const { ctx, external } = await context();
    const page = await ctx.newPage();
    await page.goto(`${origin}/contactos/`, { waitUntil: "networkidle" });
    assert.deepEqual(external(), []);
    await page.click("[data-gq-consent-embed='google_maps'] [data-gq-consent-load-once]");
    await page.waitForSelector("[data-gq-consent-embed='google_maps'] iframe");
    await page.waitForTimeout(300);
    assert.ok(
      external().some((url) => url.startsWith("https://www.google.com/maps?q=Nomia%2C%20Amadora")),
      external().join(),
    );
    assert.equal(await cookieState(ctx), null);
    assert.equal(records().length, start);
    pass(
      ["CN-R13"],
      "the contact map's Load once loads that map only, with no grant and no record",
    );

    // Always allow grants external media, is recorded, and holds on the next visit.
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.isVisible("[data-gq-consent-embed='google_maps'] iframe"), false);
    await page.click("[data-gq-consent-embed='google_maps'] [data-gq-consent-allow]");
    await page.waitForSelector("[data-gq-consent-embed='google_maps'] iframe");
    await page.waitForTimeout(500);
    const state = await cookieState(ctx);
    assert.equal(state.decisions.external_media, true);
    assert.equal(state.decisions.analytics, false);
    assert.deepEqual(
      records()
        .slice(start)
        .map((row) => [row.action, row.external_media]),
      [["custom", 1]],
    );
    await page.goto(`${origin}/multimedia/`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-gq-consent-embed='youtube'] iframe");
    pass(
      ["CN-R13", "CN-R7"],
      "the contact map's Always allow grants external_media only, appends one custom record, and YouTube then loads on other pages",
    );
    await ctx.close();
  }

  // 9. Reject all: nothing loads, the rejection is recorded; the legal page reads with the banner open.
  {
    const start = records().length;
    const { ctx, external } = await context();
    const page = await ctx.newPage();
    await page.goto(`${origin}/`, { waitUntil: "networkidle" });
    await page.click("footer a[data-gq-legal-role='privacy_policy']");
    await page.waitForURL(`${origin}/politica-de-privacidade/`);
    assert.equal(await page.isVisible("#gq-consent-banner"), true);
    assert.ok((await page.textContent("main")).includes("Texto legal da Política de Privacidade."));
    await page.click("#gq-consent-banner [data-gq-consent-reject-all]");
    await page.waitForTimeout(500);
    for (const route of ["/multimedia/", "/contactos/", "/bioeconomia/"]) {
      await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    }
    assert.deepEqual(external(), []);
    assert.deepEqual(
      records()
        .slice(start)
        .map((row) => [row.action, row.external_media]),
      [["reject_all", 0]],
    );
    pass(
      ["CN-R1", "CN-R4", "CN-R7", "LG-R5"],
      "the privacy policy is reachable and readable with the banner open; Reject all is recorded and nothing third-party loads afterwards",
    );
    await ctx.close();
  }

  // 10. The CMS's read path, with the read token (CN-R11).
  {
    const [row] = records();
    const read = await fetch(`${origin}/gq/consent/records/${row.consent_id}`, {
      headers: { Authorization: `Bearer ${process.env.CONSENT_ACCEPTANCE_READ_TOKEN}` },
    });
    assert.equal(read.status, 200);
    assert.equal((await fetch(`${origin}/gq/consent/records/${row.consent_id}`)).status, 401);
    pass(["CN-R11"], "records are read with the CMS's bearer token and refused without it");
  }

  evidence.passed = true;
  console.log(
    `\nConsent acceptance passed: ${evidence.scenarios.length} scenarios, ${evidence.checks.length} suite checks.`,
  );
} catch (error) {
  evidence.passed = false;
  evidence.error = String(error?.stack ?? error);
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await cms.close();
  server.close();
  evidence.finishedAt = new Date().toISOString();
  writeFileSync(join(proofs, "acceptance.json"), `${JSON.stringify(evidence, null, 2)}\n`);
  rmSync(work, { recursive: true, force: true });
}
