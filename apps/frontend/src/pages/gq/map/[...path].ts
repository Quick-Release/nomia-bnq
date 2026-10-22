// The map-list explorer's base map, proxied from OpenFreeMap (lib/map-tiles.ts,
// docs/adr/0001): the visitor's browser never contacts OpenFreeMap.
import type { APIRoute } from "astro";
import { proxyMapTiles } from "../../../lib/map-tiles";

export const prerender = false;

export const ALL: APIRoute = ({ request }) => proxyMapTiles(request);
