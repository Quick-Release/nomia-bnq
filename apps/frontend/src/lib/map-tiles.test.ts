// The map-list explorer's OpenFreeMap tiles, proxied through the Site's own
// Worker (docs/adr/0001): the visitor's browser only ever asks the Site, and
// OpenFreeMap sees the Worker, never the visitor's IP address, cookies or
// referrer (CONSENT-1 CN-R3 prefers proxying map tiles to categorising them).
import { expect, test, vi } from "vite-plus/test";
import { MAP_STYLE_PATH, proxyMapTiles } from "./map-tiles";

const SITE = "https://nomia.bnq.pt";

function upstream(body: string, contentType: string, headers: Record<string, string> = {}) {
  return vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
          "Set-Cookie": "tracker=1",
          ...headers,
        },
      }),
  );
}

const visitor = (path: string, init: RequestInit = {}) =>
  new Request(`${SITE}/gq/map/${path}`, {
    ...init,
    headers: {
      Cookie: "gq_consent=abc",
      Referer: `${SITE}/mapa/`,
      "User-Agent": "Visitor/1.0",
      "CF-Connecting-IP": "203.0.113.7",
      ...init.headers,
    },
  });

test("the map style is served from the Site, with every OpenFreeMap URL in it made the Site's", async () => {
  const style = JSON.stringify({
    sources: { openmaptiles: { type: "vector", url: "https://tiles.openfreemap.org/planet" } },
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sprite: "https://tiles.openfreemap.org/sprites/ofm_f384/ofm",
  });
  const fetcher = upstream(style, "application/json");

  const response = await proxyMapTiles(visitor("styles/positron"), fetcher);

  expect(MAP_STYLE_PATH).toBe("/gq/map/styles/positron");
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    sources: { openmaptiles: { type: "vector", url: `${SITE}/gq/map/planet` } },
    glyphs: `${SITE}/gq/map/fonts/{fontstack}/{range}.pbf`,
    sprite: `${SITE}/gq/map/sprites/ofm_f384/ofm`,
  });
  expect(fetcher.mock.calls[0]![0]).toBe("https://tiles.openfreemap.org/styles/positron");
});

test("the tileset's tile URLs are rewritten too", async () => {
  const fetcher = upstream(
    JSON.stringify({
      tiles: ["https://tiles.openfreemap.org/planet/20261018_080001_pt/{z}/{x}/{y}.pbf"],
    }),
    "application/json; charset=utf-8",
  );

  const response = await proxyMapTiles(visitor("planet"), fetcher);

  expect(await response.json()).toEqual({
    tiles: [`${SITE}/gq/map/planet/20261018_080001_pt/{z}/{x}/{y}.pbf`],
  });
});

test("tiles, glyphs and sprites pass through byte for byte, with nothing of the visitor's sent on", async () => {
  for (const path of [
    "planet/20261018_080001_pt/6/30/24.pbf",
    "natural_earth/ne2sr/3/3/2.png",
    "fonts/Noto%20Sans%20Regular/0-255.pbf",
    "sprites/ofm_f384/ofm@2x.png",
    "sprites/ofm_f384/ofm.json",
  ]) {
    const fetcher = upstream("\u0001binary", "application/x-protobuf");

    const response = await proxyMapTiles(visitor(path), fetcher);

    expect(response.status, path).toBe(200);
    expect(await response.text(), path).toBe("\u0001binary");
    expect(response.headers.get("Content-Type")).toBe("application/x-protobuf");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=86400");
    expect(response.headers.get("Set-Cookie")).toBeNull();
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe(`https://tiles.openfreemap.org/${path}`);
    // Only what the request needs: no cookie, referrer, user agent or client IP.
    expect([...new Headers(init?.headers).keys()]).toEqual([]);
  }
});

test("anything but OpenFreeMap's map resources is refused without a request", async () => {
  const fetcher = upstream("{}", "application/json");
  for (const path of [
    "",
    "../secret",
    "styles/../../etc/passwd",
    "planet/../admin",
    "https:/evil.example/x",
    "%2e%2e/x",
    "planet/20261018_080001_pt/6/30/24.pbf?ip=203.0.113.7",
    "fonts/a/b/c.pbf",
    "other/thing",
  ]) {
    const response = await proxyMapTiles(visitor(path), fetcher);
    expect(response.status, path).toBe(404);
  }
  expect(fetcher).not.toHaveBeenCalled();
});

test("only GET and HEAD are proxied", async () => {
  const fetcher = upstream("{}", "application/json");
  const response = await proxyMapTiles(visitor("planet", { method: "POST" }), fetcher);
  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("GET, HEAD");
  expect(fetcher).not.toHaveBeenCalled();
});

test("an OpenFreeMap failure is a 502 the map can retry, never the visitor's page", async () => {
  const down = vi.fn(async () => {
    throw new TypeError("fetch failed");
  });
  expect((await proxyMapTiles(visitor("planet"), down)).status).toBe(502);

  const missing = vi.fn(async () => new Response("no", { status: 404 }));
  const response = await proxyMapTiles(visitor("planet/x/1/1/1.pbf"), missing);
  expect(response.status).toBe(404);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});
