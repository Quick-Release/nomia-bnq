// The CMS's reads of the Site's consent records (CONSENT-1 CN-R11), with its
// bearer token: by consent ID, a CSV export and counts (lib/consent.ts).
import type { APIRoute } from "astro";
import { handleConsent } from "../../../lib/consent";

export const prerender = false;

export const ALL: APIRoute = ({ request }) => handleConsent(request);
