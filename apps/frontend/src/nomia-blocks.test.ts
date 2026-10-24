/// <reference types="node" />
// Pages built with Nomia's blocks (the gq-bioeconomia plugin): a refresh stores
// their parsed blocks (WordPress's `wpBlocksJson`) with them, and visitors are
// served the Nomia block components' rendering from the store, through a CMS
// outage. A page without Nomia's blocks is served as WordPress rendered it.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { JSDOM } from "jsdom";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { nomiaContent, nomiaExtension } from "./lib/nomia-content";
import { openTestD1, type TestD1 } from "./test/sqlite-d1";
import { data, routes, stubWordPress, type Answer } from "./test/wordpress-stub";

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

/** A block as PHP's parse_blocks() gives it: attributes `[]` when it has none. */
function parsed(blockName: string | null, attrs: Record<string, unknown> | [], innerHTML = "") {
  return { blockName, attrs, innerBlocks: [], innerHTML, innerContent: [innerHTML] };
}

const titleWithLabel = parsed("getquick/title-with-label", {
  label: "Visão geral",
  titleLine1: "A Economia Circular promove um modelo económico reorganizado,",
});
const paragraph = parsed("core/paragraph", [], "<p>Texto corrido.</p>");
// What WordPress renders for a Nomia block: only the attributes, in a comment.
const renderedComment = "<!-- getquick/title-with-label rendered by Astro -->";

interface Entry {
  id: string;
  title: string;
  content: string;
  wpBlocksJson: string | null;
  gqBioeconomiaPageBackgroundColor?: string | null;
  gqBioeconomiaThematicColors?: Array<{ slug: string; color: string }>;
}

// GQ Design's palette, as WordPress gives it (designTokens).
const palette = { colors: [{ slug: "ciano-500", color: "#209e97" }], spacingSizes: [] };

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
          content: renderedComment,
          wpBlocksJson: JSON.stringify([titleWithLabel]),
          gqBioeconomiaPageBackgroundColor: null,
        },
        designTokens: palette,
      }),
    entry: entryAnswer,
    design: () => data({ designTokens: palette }),
    routes: () => routes("/", ...published.keys()),
  });
}

function cmsDown() {
  const unreachable = () => Promise.reject(new TypeError("fetch failed"));
  return stubWordPress({
    home: unreachable,
    entry: unreachable,
    chrome: unreachable,
    design: unreachable,
    routes: unreachable,
  });
}

beforeEach(() => {
  vi.stubEnv("DEV", false);
  published = new Map([
    [
      "/economia-circular/",
      {
        id: "page-10",
        title: "Economia circular",
        content: `${renderedComment}<p>Texto corrido.</p>`,
        wpBlocksJson: JSON.stringify([titleWithLabel, paragraph]),
        gqBioeconomiaPageBackgroundColor: "#0b3d3a",
      },
    ],
    [
      "/sobre/",
      {
        id: "page-11",
        title: "Sobre",
        content: "<p>Uma página sem blocos Nomia.</p>",
        wpBlocksJson: JSON.stringify([
          parsed("core/paragraph", [], "<p>Uma página sem blocos Nomia.</p>"),
        ]),
      },
    ],
  ]);
  directory = mkdtempSync(join(tmpdir(), "nomia-blocks-"));
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
    request: new Request("https://acme.example/gq/refresh", {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: "{}",
    }),
  });
  return { status: response.status, report: await response.json() };
}

async function visit(path: string) {
  const page =
    path === "/" ? await import("./pages/index.astro") : await import("./pages/[...slug].astro");
  const container = await AstroContainer.create();
  const response = await container.renderToResponse(page.default, {
    request: new Request(new URL(path, "https://acme.example")),
    params: { slug: path.replace(/^\/|\/$/g, "") },
    partial: false,
  });
  return { status: response.status, html: await response.text() };
}

test("only content with Nomia's own blocks is Nomia content; PHP's empty attributes read as an object", () => {
  expect(nomiaContent(JSON.stringify([paragraph]), null)).toBeUndefined();
  expect(
    nomiaContent(JSON.stringify([parsed("getquick-design/container", [])]), null),
  ).toBeUndefined();
  expect(nomiaContent(null, null)).toBeUndefined();
  expect(nomiaContent("not json", null)).toBeUndefined();

  const nested = { ...parsed("core/group", []), innerBlocks: [titleWithLabel] };
  const content = nomiaContent(JSON.stringify([nested]), "");
  expect(content?.pageBackgroundColor).toBeNull();
  expect(content?.blocks[0]!.attrs).toEqual({});
  expect(content?.blocks[0]!.innerBlocks[0]!.attrs).toMatchObject({ label: "Visão geral" });
});

test("the extension reads Nomia's fields from a page or post, and parses only what it stored", () => {
  const blocks = JSON.stringify([titleWithLabel]);
  const page = nomiaExtension.read({
    kind: "page",
    fields: { wpBlocksJson: blocks, gqBioeconomiaPageBackgroundColor: "#f4efe6" },
  });
  expect(page?.pageBackgroundColor).toBe("#f4efe6");
  expect(page?.blocks[0]!.blockName).toBe(titleWithLabel.blockName);
  const post = nomiaExtension.read({ kind: "post", fields: { wpBlocksJson: blocks } });
  expect(post?.pageBackgroundColor).toBeNull();
  expect(nomiaExtension.read({ kind: "page", fields: {} })).toBeUndefined();
  expect(
    nomiaExtension.read({ kind: "page", fields: { wpBlocksJson: JSON.stringify([paragraph]) } }),
  ).toBeUndefined();

  // Stored as JSON and read back as it was, so reconciliation compares it as it is.
  const stored: unknown = JSON.parse(JSON.stringify(page));
  expect(nomiaExtension.parse(stored)).toBe(stored);
  expect(nomiaExtension.parse(undefined)).toBeUndefined();
  expect(nomiaExtension.parse({ blocks: "not blocks", pageBackgroundColor: null })).toBeUndefined();
  expect(nomiaExtension.parse({ blocks: [] })).toBeUndefined();
});

test("a page with Nomia's blocks is served from the store by their components, through a CMS outage", async () => {
  wordpress();
  const { status, report } = await refresh();
  expect(status).toBe(200);
  expect(report.ready).toBe(true);
  const fetchMock = cmsDown();

  const page = await visit("/economia-circular/");

  expect(page.status).toBe(200);
  expect(page.html).toContain("Visão geral");
  expect(page.html).toContain("A Economia Circular promove um modelo económico reorganizado,");
  expect(page.html).toContain("Texto corrido.");
  expect(page.html).not.toContain(renderedComment);
  // GQ Design's palette, which Nomia's design tokens read, and its preset classes.
  expect(page.html).toContain(":root{--wp--preset--color--ciano-500:#209e97}");
  expect(page.html).toContain(
    ".nomia-blocks .has-ciano-500-color{color:var(--wp--preset--color--ciano-500)}",
  );
  // The page's own surface colour, with text that contrasts with it, on the
  // blocks' own <main>: the site's Layout stays as the blueprint ships it.
  expect(page.html).toContain(
    '<main class="nomia-blocks text-neutral-bw-white" style="background-color: #0b3d3a">',
  );
  expect(new JSDOM(page.html).window.document.body.classList.contains("gqd-content")).toBe(true);
  expect(fetchMock).not.toHaveBeenCalled();
});

test("the front page with Nomia's blocks is served by their components", async () => {
  wordpress();
  await refresh();
  cmsDown();

  const home = await visit("/");

  expect(home.status).toBe(200);
  expect(home.html).toContain('<main class="nomia-blocks">');
  expect(home.html).toContain("Visão geral");
  expect(home.html).not.toContain(renderedComment);
});

test("a page without Nomia's blocks is served as WordPress rendered it", async () => {
  wordpress();
  await refresh();
  cmsDown();

  const page = await visit("/sobre/");

  expect(page.status).toBe(200);
  expect(page.html).not.toContain('class="nomia-blocks"');
  expect(page.html).toContain('<div class="prose-wp"');
  expect(page.html).toContain("Uma página sem blocos Nomia.");
});

test("a changed Temáticas color is stored with the page and survives a CMS outage", async () => {
  const entry = published.get("/economia-circular/")!;
  entry.gqBioeconomiaThematicColors = [{ slug: "economia-circular", color: "#123456" }];
  wordpress();
  await refresh();
  cmsDown();
  const before = await visit("/economia-circular/");
  expect(before.html).toContain("--nomia-tematica-economia-circular-background: #123456");
  expect(before.html).toContain("--nomia-tematica-economia-circular-foreground: #ffffff");

  entry.gqBioeconomiaThematicColors = [{ slug: "economia-circular", color: "#ffeeaa" }];
  wordpress();
  await refresh();
  const fetchMock = cmsDown();
  const after = await visit("/economia-circular/");
  expect(after.html).toContain("--nomia-tematica-economia-circular-background: #ffeeaa");
  expect(after.html).toContain("--nomia-tematica-economia-circular-foreground: #000000");
  expect(after.html).not.toContain("background: #123456");
  expect(fetchMock).not.toHaveBeenCalled();
});

test("untrusted or missing term colors cannot inject a stylesheet", async () => {
  const entry = published.get("/economia-circular/")!;
  entry.gqBioeconomiaThematicColors = [
    { slug: "economia-circular", color: "#123456; } body { display:none }" },
    { slug: "bad}</style><script>alert(1)</script>", color: "#123456" },
    { slug: "sem-cor", color: "" },
  ];
  wordpress();
  await refresh();
  cmsDown();
  const page = await visit("/economia-circular/");
  expect(page.html).not.toContain("alert(1)");
  expect(page.html).not.toContain("body { display:none }");
  // A term without a color publishes nothing; each block keeps its own fallback.
  expect(page.html).not.toContain("--nomia-tematica-sem-cor-");
});
