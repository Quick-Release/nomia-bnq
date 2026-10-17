import type { APIRoute } from "astro";

import structuredBlockContracts from "../../../data/structured-block-contracts.json" with { type: "json" };

const headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
  "cache-control": "public, max-age=300",
  "content-type": "application/json; charset=utf-8",
};

export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers });

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(structuredBlockContracts, null, 2), { headers });
};
