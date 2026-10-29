// The map-list explorer's OpenFreeMap tiles, proxied through the Site's own
// Worker (docs/adr/0001): the visitor's browser only ever asks the Site, and
// OpenFreeMap sees the Worker, never the visitor's IP address, cookies or
// referrer (CONSENT-1 CN-R3 prefers proxying map tiles to categorising them).
import { expect, test, vi } from "vite-plus/test";
import { MAP_STYLE_PATH, proxyMapTiles, resolveMapStyle, resolveMapUrl } from "./map-tiles";

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

test("the map style is served from the Site, with every OpenFreeMap URL in it made the Site's path", async () => {
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
    sources: { openmaptiles: { type: "vector", url: "/gq/map/planet" } },
    glyphs: "/gq/map/fonts/{fontstack}/{range}.pbf",
    sprite: "/gq/map/sprites/ofm_f384/ofm",
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
    tiles: ["/gq/map/planet/20261018_080001_pt/{z}/{x}/{y}.pbf"],
  });
});

test("the proxied JSON names no host, so a page behind another hostname gets the same", async () => {
  // The APA proxy sends bioeconomia.apambiente.pt's visitors to the Worker as
  // nomia.bnq.pt: the JSON must not carry the host the Worker sees.
  const style = JSON.stringify({ sprite: "https://tiles.openfreemap.org/sprites/ofm_f384/ofm" });
  const direct = await proxyMapTiles(
    visitor("styles/positron"),
    upstream(style, "application/json"),
  );
  const proxied = await proxyMapTiles(
    new Request(`${SITE}/gq/map/styles/positron`, {
      headers: { "X-Forwarded-Host": "bioeconomia.apambiente.pt" },
    }),
    upstream(style, "application/json"),
  );

  const body = await direct.text();
  expect(body).toBe(await proxied.text());
  expect(body).not.toContain("nomia.bnq.pt");
  expect(body).not.toContain("openfreemap");
});

test("the map resolves the Site's paths against the page it is on", () => {
  for (const page of [
    "https://nomia.bnq.pt/mapa/",
    "https://bioeconomia.apambiente.pt/mapa/?regiao=norte",
  ]) {
    const origin = new URL(page).origin;

    expect(resolveMapUrl(MAP_STYLE_PATH, page)).toBe(`${origin}/gq/map/styles/positron`);
    expect(resolveMapUrl("/gq/map/planet/20261018_080001_pt/6/30/24.pbf", page)).toBe(
      `${origin}/gq/map/planet/20261018_080001_pt/6/30/24.pbf`,
    );
    expect(
      resolveMapStyle(
        {
          version: 8,
          sources: {
            openmaptiles: { type: "vector", url: "/gq/map/planet" },
            ne2_shaded: { type: "raster", tiles: ["/gq/map/natural_earth/ne2sr/{z}/{x}/{y}.png"] },
            regions: { type: "geojson", data: { type: "FeatureCollection", features: [] } },
          },
          glyphs: "/gq/map/fonts/{fontstack}/{range}.pbf",
          sprite: "/gq/map/sprites/ofm_f384/ofm",
          layers: [],
        },
        page,
      ),
    ).toEqual({
      version: 8,
      sources: {
        openmaptiles: { type: "vector", url: `${origin}/gq/map/planet` },
        ne2_shaded: {
          type: "raster",
          tiles: [`${origin}/gq/map/natural_earth/ne2sr/{z}/{x}/{y}.png`],
        },
        regions: { type: "geojson", data: { type: "FeatureCollection", features: [] } },
      },
      // {fontstack} and {range} stay MapLibre's to fill in.
      glyphs: `${origin}/gq/map/fonts/{fontstack}/{range}.pbf`,
      sprite: `${origin}/gq/map/sprites/ofm_f384/ofm`,
      layers: [],
    });
  }
  const sprites = { version: 8 as const, sources: {}, layers: [] };
  expect(
    resolveMapStyle(
      { ...sprites, sprite: [{ id: "ofm", url: "/gq/map/sprites/ofm_f384/ofm" }] },
      SITE,
    ),
  ).toEqual({ ...sprites, sprite: [{ id: "ofm", url: `${SITE}/gq/map/sprites/ofm_f384/ofm` }] });
  // Absolute URLs, as a style might still carry, are not the Site's to touch.
  expect(resolveMapUrl("https://example.org/x.png", SITE)).toBe("https://example.org/x.png");
  expect(resolveMapUrl("//example.org/x.png", SITE)).toBe("//example.org/x.png");
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
