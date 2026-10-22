// CONSENT-1 / LEGAL-1 captures of a deployed Nomia Frontend, for its
// enablement gate (docs/plans/consent-enablement.md): gq-content's shared
// acceptance suite in Chromium against the live origin, with no interaction
// and after Reject all, plus the raw HTML scan and the legal links of every
// route. Unlike run.mjs, third-party requests are not answered locally: they
// are what this capture looks for. Visiting records nothing but a Reject all
// decision per route in the Site's consent database.
//
//   pnpm --filter @nomia-bnq/frontend consent:captures https://nomia.bnq.pt / /multimedia/ …
import { failures, runConsentAcceptance, scanConsentHtml } from "@getquick/content/consent/testing";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const [origin, ...routes] = process.argv.slice(2);
if (!origin || !/^https:\/\//.test(origin) || routes.length === 0) {
  console.error("Usage: consent:captures <https://origin> <route> [route…]");
  process.exit(2);
}
const site = {
  siteOrigin: new URL(origin).origin,
  firstPartyHosts: ["nomia-cms.bnq.pt", "nomia-media.bnq.pt"],
};
const proofs = fileURLToPath(new URL("../../.proofs/consent/", import.meta.url));
mkdirSync(proofs, { recursive: true });

const browser = await chromium.launch();
try {
  const checks = await runConsentAcceptance(
    { newContext: () => browser.newContext() },
    { ...site, routes },
  );
  const pages = [];
  for (const route of routes) {
    const html = await (await fetch(new URL(route, origin))).text();
    const scan = scanConsentHtml(html, site);
    const roles = [...html.matchAll(/data-gq-legal-role="([a-z_]+)"/g)].map((match) => match[1]);
    pages.push({
      route,
      ...scan,
      legalRoles: roles,
      cookieSettings: html.includes("data-gq-consent-open"),
    });
  }
  const failed = [
    ...failures(checks),
    ...pages
      .filter(
        (page) =>
          page.liveThirdParty.length ||
          page.blocked.length ||
          !page.legalRoles.includes("privacy_policy") ||
          !page.cookieSettings,
      )
      .map((page) => ({
        criterion: "CN-R3/LG-R5",
        route: page.route,
        passed: false,
        detail: JSON.stringify(page),
      })),
  ];
  const evidence = {
    origin,
    capturedAt: new Date().toISOString(),
    chromium: browser.version(),
    checks,
    pages,
    failed,
  };
  const file = join(proofs, `captures-${new Date().toISOString().replaceAll(":", "-")}.json`);
  writeFileSync(file, `${JSON.stringify(evidence, null, 2)}\n`);
  for (const failure of failed)
    console.error(`FAIL ${failure.criterion} ${failure.route}: ${failure.detail}`);
  console.log(`${checks.length} suite checks, ${failed.length} failing; evidence: ${file}`);
  process.exitCode = failed.length ? 1 : 0;
} finally {
  await browser.close();
}
