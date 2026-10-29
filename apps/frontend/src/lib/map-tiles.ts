// The map-list explorer's base map, OpenFreeMap's, proxied through the Site's
// own Worker (docs/adr/0001). A visitor's browser asks only the Site; the
// Worker asks OpenFreeMap without anything of the visitor's (no cookie,
// referrer, user agent or client address), so loading the map is no request
// to a third party (CONSENT-1 CN-R3, which prefers proxying map tiles to
// categorising them) and needs no consent.

import type { SourceSpecification, StyleSpecification } from "maplibre-gl";

/** Where the Site serves the proxied map. */
export const MAP_PROXY_PATH = "/gq/map/";
/** The base map's style, as the map-list explorer loads it. */
export const MAP_STYLE_PATH = `${MAP_PROXY_PATH}styles/positron`;

const OPENFREEMAP = "https://tiles.openfreemap.org";

// OpenFreeMap's map resources the style uses, and nothing else: its styles,
// the planet tileset and its tiles, the shaded relief, glyphs and sprites.
const RESOURCES = [
  /^styles\/[a-z0-9_-]+$/,
  /^planet$/,
  /^planet\/[A-Za-z0-9_]+\/\d+\/\d+\/\d+\.pbf$/,
  /^natural_earth\/ne2sr\/\d+\/\d+\/\d+\.png$/,
  /^fonts\/[A-Za-z0-9%_.,-]+\/\d+-\d+\.pbf$/,
  /^sprites\/[A-Za-z0-9_]+\/[A-Za-z0-9_]+(?:@2x)?\.(?:json|png)$/,
];

// The proxied JSON names the Site's resources by path alone, never by host:
// the Worker's own host (nomia.bnq.pt) is not always the one the visitor
// sees (bioeconomia.apambiente.pt, through the APA proxy), and a URL on the
// other would be cross-origin. The map resolves the paths against the page.
const SITE_MAP_PATH = MAP_PROXY_PATH.slice(0, -1);

/**
 * A URL of the map's, a root-relative path made absolute on the origin of the
 * page it is shown on; any other URL is left as it is. Prefixing, not URL
 * parsing, keeps the {z}, {fontstack} and other placeholders MapLibre fills in.
 */
export const resolveMapUrl = (url: string, page: string) =>
  url.startsWith("/") && !url.startsWith("//") ? `${new URL(page).origin}${url}` : url;

/**
 * The proxied style with its sprite, glyphs and sources made absolute, as
 * MapLibre needs them before it requests anything. Tile URLs inside the
 * TileJSON are resolved per request instead (resolveMapUrl).
 */
export function resolveMapStyle(style: StyleSpecification, page: string): StyleSpecification {
  const resolve = (url: string) => resolveMapUrl(url, page);
  const { sprite, glyphs, sources } = style;
  return {
    ...style,
    ...(sprite !== undefined && {
      sprite:
        typeof sprite === "string"
          ? resolve(sprite)
          : sprite.map((entry) => ({ ...entry, url: resolve(entry.url) })),
    }),
    ...(glyphs !== undefined && { glyphs: resolve(glyphs) }),
    sources: Object.fromEntries(
      Object.entries(sources).map(([id, source]) => [
        id,
        {
          ...source,
          ...("url" in source && source.url !== undefined && { url: resolve(source.url) }),
          ...("tiles" in source &&
            source.tiles !== undefined && { tiles: source.tiles.map(resolve) }),
        } as SourceSpecification,
      ]),
    ),
  };
}

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

const refuse = (status: number, headers: Record<string, string> = {}) =>
  new Response(null, { status, headers: { "Cache-Control": "no-store", ...headers } });

/**
 * Answers a request under MAP_PROXY_PATH from OpenFreeMap. JSON (the style
 * and the tileset) has OpenFreeMap's URLs made the Site's paths, so every
 * further request comes back here, on whichever host the page is on; tiles,
 * glyphs and sprites pass through as they are.
 */
export async function proxyMapTiles(
  request: Request,
  fetcher: Fetcher = (input, init) => fetch(input, init),
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return refuse(405, { Allow: "GET, HEAD" });
  }
  const url = new URL(request.url);
  const path = url.pathname.startsWith(MAP_PROXY_PATH)
    ? url.pathname.slice(MAP_PROXY_PATH.length)
    : "";
  if (url.search || !RESOURCES.some((resource) => resource.test(path))) return refuse(404);

  let upstream: Response;
  try {
    // A request of the Worker's own: nothing of the visitor's is passed on.
    upstream = await fetcher(`${OPENFREEMAP}/${path}`, { method: request.method });
  } catch {
    return refuse(502);
  }
  if (!upstream.ok) return refuse(upstream.status === 404 ? 404 : 502);

  const contentType = upstream.headers.get("Content-Type") ?? "application/octet-stream";
  const headers = {
    "Content-Type": contentType,
    "Cache-Control": upstream.headers.get("Cache-Control") ?? "public, max-age=86400",
  };
  if (!/\bjson\b/.test(contentType) || request.method === "HEAD") {
    return new Response(request.method === "HEAD" ? null : upstream.body, { headers });
  }
  const json = (await upstream.text()).replaceAll(OPENFREEMAP, SITE_MAP_PATH);
  return new Response(json, { headers });
}
