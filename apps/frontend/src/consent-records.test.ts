/// <reference types="node" />
// Nomia's consent record endpoints (CONSENT-1 CN-R7–CN-R9, CN-R11), as its
// Worker routes them to gq-content's Runtime: same-origin writes into the
// Site's own consent database (the Runtime's migrations on SQLite), never the
// publication store, and bearer-authenticated reads for the CMS.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { consentMigrationsDirectory } from "@getquick/content/consent/migrations";
import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { openTestD1, type TestD1 } from "./test/sqlite-d1";

const runtime = vi.hoisted(() => ({ env: {} as Record<string, unknown> }));
vi.mock("cloudflare:workers", () => ({
  get env() {
    return runtime.env;
  },
}));

const SITE = "https://nomia.bnq.pt";
const READ_TOKEN = "nomia-consent-read-token-0123456789abcdef";

let consent: TestD1;
let publications: TestD1;

beforeEach(() => {
  consent = openTestD1(":memory:", consentMigrationsDirectory);
  publications = openTestD1();
  runtime.env = {
    CONSENT_DB: consent,
    CONSENT_READ_TOKEN: READ_TOKEN,
    PUBLICATION_DB: publications,
  };
});

afterEach(() => {
  consent.close();
  publications.close();
  vi.resetModules();
});

async function call(path: string, init: RequestInit = {}) {
  const module = await import(
    path === "/gq/consent" ? "./pages/gq/consent" : "./pages/gq/consent/[...rest]"
  );
  const container = await AstroContainer.create();
  const response = await container.renderToResponse(module as never, {
    routeType: "endpoint",
    request: new Request(`${SITE}${path}`, init),
    params: { rest: path.replace(/^\/gq\/consent\/?/, "") || undefined },
  });
  return response;
}

const decision = (consentId: string) => ({
  consentId,
  decidedAt: new Date().toISOString(),
  configVersion: "ccc0e516a21e7d9b",
  legalRevisions: { privacy_policy: "2026-10-01T09:00:00" },
  decisions: { preferences: false, analytics: false, marketing: false, external_media: true },
  action: "custom",
  language: "pt-PT",
  uiVersion: "gq-content@0.1.0",
});

const record = (body: unknown, origin = SITE) =>
  call("/gq/consent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "Sec-Fetch-Site": "same-origin",
    },
    body: JSON.stringify(body),
  });

test("a decision is recorded in the consent database as Nomia's, with no IP or user agent", async () => {
  const consentId = randomUUID();

  const response = await record(decision(consentId));

  expect(response.status).toBe(201);
  const { results } = await consent
    .prepare("SELECT * FROM consent_records")
    .all<Record<string, unknown>>();
  expect(results).toHaveLength(1);
  expect(results[0]).toMatchObject({
    consent_id: consentId,
    site_id: "nomia-bnq",
    action: "custom",
  });
  expect(Object.keys(results[0]!).some((column) => /ip|agent|user/i.test(column))).toBe(false);
  // The publication store's "visitor requests never write" is unchanged.
  const { results: events } = await publications.prepare("SELECT * FROM publication_events").all();
  expect(events).toEqual([]);
});

test("a decision from another origin is refused", async () => {
  const response = await record(decision(randomUUID()), "https://evil.example");
  expect(response.status).toBe(403);
});

test("the CMS reads a visitor's records with the read token, and nobody reads them without it", async () => {
  const consentId = randomUUID();
  await record(decision(consentId));

  const refused = await call(`/gq/consent/records/${consentId}`);
  const read = await call(`/gq/consent/records/${consentId}`, {
    headers: { Authorization: `Bearer ${READ_TOKEN}` },
  });

  expect(refused.status).toBe(401);
  expect(read.status).toBe(200);
  expect(await read.json()).toMatchObject({ consentId, records: [{ siteId: "nomia-bnq" }] });
});

test("without a consent database the endpoint answers 503 and the visitor's choice stays theirs", async () => {
  runtime.env = {};
  const response = await record(decision(randomUUID()));
  expect(response.status).toBe(503);
});

test("other paths under /gq/consent/ are refused before anything is looked up", async () => {
  expect((await call("/gq/consent/nothing")).status).toBe(401);
  const authorized = await call("/gq/consent/nothing", {
    headers: { Authorization: `Bearer ${READ_TOKEN}` },
  });
  expect(authorized.status).toBeGreaterThanOrEqual(400);
  expect(authorized.status).toBeLessThan(500);
});
