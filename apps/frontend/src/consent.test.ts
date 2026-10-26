/// <reference types="node" />
// Nomia's adoption of CONSENT-1 and LEGAL-1 (docs/adr/0001), through the
// rendered Frontend: pages refreshed from a stubbed WordPress into the
// publication store are served with no live third-party embed. The YouTube
// embed WordPress renders (`core/embed`), the video hero's youtube-nocookie
// iframe and the contact map's Google Maps iframe become consent
// placeholders; an iframe from a host outside the catalog is blocked. Every
// page carries the banner; footer content belongs to the CMS-selected pattern.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { scanConsentHtml } from "@getquick/content/consent/testing";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { openTestD1, type TestD1 } from "./test/sqlite-d1";
import { chrome, data, routes, stubWordPress, type Answer } from "./test/wordpress-stub";

// The monolingual Site, as entries.test.ts has it.
vi.mock("../../../gq.ops.json", async (importOriginal) => {
  const { default: ops } = await importOriginal<{
    default: { wordpress: { languages?: unknown } };
  }>();
  const { languages: _languages, ...wordpress } = ops.wordpress;
  return { default: { ...ops, wordpress } };
});

const runtime = vi.hoisted(() => ({ env: {} as Record<string, unknown> }));
vi.mock("cloudflare:workers", () => ({
  get env() {
    return runtime.env;
  },
}));

const TOKEN = "acme-refresh-token-0123456789abcdef0123456789";
const SITE = "https://nomia.bnq.pt";
// The Site's own media and CMS hosts (gq.ops.json): first party.
const MEDIA = "https://nomia-media.bnq.pt/app/uploads/2026/10/foto.jpg";

/** A block as PHP's parse_blocks() gives it. */
function parsed(blockName: string | null, attrs: Record<string, unknown> | [], innerHTML = "") {
  return { blockName, attrs, innerBlocks: [], innerHTML, innerContent: [innerHTML] };
}

// What WordPress renders for a YouTube URL in a core/embed block (oEmbed).
const youtubeEmbed =
  '<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube"><div class="wp-block-embed__wrapper">' +
  '<iframe title="Nomia em 2 minutos" width="500" height="281" src="https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed" frameborder="0" allow="accelerometer; autoplay; encrypted-media" allowfullscreen></iframe>' +
  "</div></figure>";
const unknownEmbed = '<iframe src="https://tracker.example/widget" title="Widget"></iframe>';

const contactMap = parsed("getquick/nomia-contact-map", {
  title: "Nomia, Lisboa",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Lisboa%2C%20Portugal",
});

interface Entry {
  id: string;
  title: string;
  content: string;
  wpBlocksJson?: string | null;
  blocks?: unknown;
}

const palette = { colors: [], spacingSizes: [] };
const legal = {
  schemaVersion: 1,
  controller: { name: "BNQ", privacyEmail: "privacidade@bnq.pt", dpoContact: null },
  roles: ["privacy_policy", "cookie_policy"].map((role) => ({
    role,
    url: "/politica-de-privacidade/",
    title: "Política de Privacidade",
    revision: "2026-10-01T09:00:00",
    isFallback: false,
  })),
  missingRequired: [],
};

let published: Map<string, Entry>;
let directory: string;
let db: TestD1;

function entryAnswer({ uri }: Record<string, unknown>): Answer {
  const entry = published.get(decodeURI(String(uri)));
  return data({
    postBy: null,
    pageBy: entry && {
      ...entry,
      uri: String(uri),
      status: "publish",
      isRestricted: false,
      featuredImage: null,
    },
    designTokens: palette,
  });
}

function wordpress() {
  return stubWordPress({
    home: () =>
      data({
        generalSettings: { title: "Nomia", description: "" },
        nodeByUri: {
          __typename: "Page",
          isFrontPage: true,
          title: "Início",
          content: `<p>Bem-vindo.</p>${youtubeEmbed}`,
        },
        designTokens: palette,
      }),
    entry: entryAnswer,
    design: () => data({ designTokens: palette }),
    routes: () => routes("/", ...published.keys()),
    // The logo, as Nomia's, on its media domain.
    chrome: () =>
      data({
        ...chrome,
        generalSettings: {
          siteIcon: null,
          siteLogo: { node: { sourceUrl: MEDIA, altText: "Nomia" } },
        },
      }),
    consentSettings: () => data({ getquickLegal: legal, googleAnalytics: null }),
  });
}

beforeEach(() => {
  vi.stubEnv("DEV", false);
  published = new Map<string, Entry>([
    [
      "/multimedia/",
      {
        id: "page-20",
        title: "Multimédia",
        content: `<p>Vídeos.</p>${youtubeEmbed}${unknownEmbed}<img src="${MEDIA}" alt="">`,
      },
    ],
    [
      "/bioeconomia/",
      {
        id: "page-21",
        title: "Bioeconomia",
        content: "",
        blocks: [
          {
            name: "getquick-design/video-hero",
            attributes: { videoType: "youtube", videoUrl: "https://youtu.be/dQw4w9WgXcQ" },
            htmlContent: '<section class="wp-block-getquick-design-video-hero"></section>',
            innerBlocks: [],
          },
        ],
      },
    ],
    [
      "/contactos/",
      {
        id: "page-22",
        title: "Contactos",
        content: "<!-- getquick/nomia-contact-map rendered by Astro -->",
        wpBlocksJson: JSON.stringify([
          parsed("getquick/title-with-label", { label: "Contactos", titleLine1: "Fale connosco" }),
          contactMap,
          parsed("core/html", [], unknownEmbed),
        ]),
      },
    ],
  ]);
  directory = mkdtempSync(join(tmpdir(), "nomia-consent-"));
  db = openTestD1(join(directory, "publications.sqlite"));
  runtime.env = { PUBLICATION_DB: db, FRONTEND_REFRESH_TOKEN: TOKEN };
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  db.close();
  rmSync(directory, { recursive: true, force: true });
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

async function refresh() {
  const endpoint = await import("./pages/gq/refresh");
  const container = await AstroContainer.create();
  const response = await container.renderToResponse(endpoint as never, {
    routeType: "endpoint",
    request: new Request(`${SITE}/gq/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: "{}",
    }),
  });
  expect(response.status).toBe(200);
}

async function visit(path: string, cookie?: string) {
  const page =
    path === "/" ? await import("./pages/index.astro") : await import("./pages/[...slug].astro");
  const container = await AstroContainer.create();
  const response = await container.renderToResponse(page.default, {
    request: new Request(new URL(path, SITE), cookie ? { headers: { cookie } } : undefined),
    params: { slug: path.replace(/^\/|\/$/g, "") },
    partial: false,
  });
  return { status: response.status, html: await response.text() };
}

const scan = (html: string) =>
  scanConsentHtml(html, { siteOrigin: SITE, firstPartyHosts: ["nomia-media.bnq.pt"] });
const PAGES = ["/", "/multimedia/", "/bioeconomia/", "/contactos/"];

test("no page's HTML loads anything from a third party before consent", async () => {
  wordpress();
  await refresh();

  for (const path of PAGES) {
    const { status, html } = await visit(path);
    expect(status, path).toBe(200);
    expect(scan(html).liveThirdParty, path).toEqual([]);
    expect(html, path).not.toMatch(/<iframe[^>]+src=/);
  }
});

test("WordPress's YouTube embed is a placeholder naming YouTube, and an unknown host is blocked", async () => {
  wordpress();
  await refresh();

  const { html } = await visit("/multimedia/");

  expect(scan(html)).toMatchObject({
    placeholders: ["youtube"],
    blocked: [{ host: "tracker.example", tag: "iframe" }],
  });
  expect(html).toContain("data-gq-consent-load-once");
  expect(html).toContain('data-gq-consent-allow="external_media"');
  // The Site's own media host is first party: its image stays as published.
  expect(html).toContain(`<img src="${MEDIA}"`);
});

test("the front page's embed is gated like an entry's", async () => {
  wordpress();
  await refresh();

  expect(scan((await visit("/")).html).placeholders).toEqual(["youtube"]);
});

test("the video hero's youtube-nocookie video is a decorative placeholder, loaded only on a grant", async () => {
  wordpress();
  await refresh();

  const { html } = await visit("/bioeconomia/");

  expect(scan(html).placeholders).toEqual(["youtube"]);
  expect(html).toContain("data-gq-decorative");
  expect(html).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
  expect(html).not.toContain("data-gq-consent-load-once");
});

test("the contact map is a Google Maps placeholder; Nomia-block pages block unknown hosts too", async () => {
  wordpress();
  await refresh();

  const { html } = await visit("/contactos/");

  expect(scan(html)).toMatchObject({
    placeholders: ["google_maps"],
    blocked: [{ host: "tracker.example", tag: "iframe" }],
  });
  expect(html).toContain('class="nomia-contact-map');
  expect(html).toContain("https://www.google.com/maps?q=Lisboa%2C%20Portugal&amp;output=embed");
  expect(html).toMatch(/aria-label="Google Maps: Nomia, Lisboa"/);
});

test("every page has the banner without an automatically appended legal footer", async () => {
  wordpress();
  await refresh();

  for (const path of PAGES) {
    const { html } = await visit(path);
    expect(html, path).toContain('id="gq-consent-config"');
    expect(html, path).toMatch(/<section id="gq-consent-banner"(?![^>]*hidden)[^>]*>/);
    expect(html, path).not.toContain('class="gq-legal"');
  }
});

test("the declared services are YouTube and Google Maps; GA4 follows gq-config's toggle", async () => {
  wordpress();
  await refresh();

  const config = (html: string) =>
    JSON.parse(
      /<script type="application\/json" id="gq-consent-config">(.*?)<\/script>/.exec(html)![1]!,
    ).configuration;

  expect(config((await visit("/")).html)).toMatchObject({
    services: ["consent", "google_maps", "youtube"],
    categories: ["external_media"],
    measurementId: null,
  });
});
