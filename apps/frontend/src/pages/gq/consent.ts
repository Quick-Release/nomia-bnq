// Visitors' consent decisions (CONSENT-1 CN-R7–CN-R9): gq-content's Runtime
// records them in the Site's own consent database (lib/consent.ts).
import type { APIRoute } from "astro";
import { handleConsent } from "../../lib/consent";

export const prerender = false;

export const ALL: APIRoute = ({ request }) => handleConsent(request);
