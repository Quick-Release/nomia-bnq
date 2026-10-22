// The Site's content runtime: @getquick/content, configured for this Site from
// its gq.ops.json, its build environment and its Worker's bindings. The
// runtime (WPGraphQL reads, the publication store, events and refresh) is the
// package's; this file only says which Site it serves. The pages and the
// /gq/events and /gq/refresh routes (managed by gq sync) use it. Consent and
// legal pages (CONSENT-1, LEGAL-1; docs/adr/0001) are configured here too.
import type { ConsentBindings } from "@getquick/content/consent/server";
import { createContentRuntime, type ContentBindings } from "@getquick/content/server";
import ops from "../../../../gq.ops.json";
import { nomiaExtension, type NomiaContent } from "./nomia-content";

const manifest = ops as {
  project: string;
  domains?: { admin: string };
  media?: { domain?: string };
  wordpress?: { locale?: string; languages?: Array<{ locale: string; slug: string }> };
};

/** The CMS's GraphQL endpoint: the deploy sets it; local development reads DDEV's. */
const graphqlEndpoint =
  import.meta.env.PUBLIC_WORDPRESS_GRAPHQL_URL?.trim() ||
  "https://nomia-bnq-admin.ddev.site/wp/graphql";

// Imported once, so concurrent requests share one import of the module.
let workers: Promise<{ env: Record<string, unknown> } | null> | undefined;

/**
 * The catalog services Nomia loads (CONSENT-1, docs/adr/0001): YouTube (the
 * `core/embed` videos in WordPress HTML and the video hero's youtube-nocookie
 * background) and Google Maps (the contact map). GA4 isn't declared:
 * gq-config's toggle switches it on. The map-list explorer's tiles aren't a
 * service: the Site's Worker proxies them (src/pages/gq/map/[...path].ts).
 */
export const CONSENT_SERVICES = ["google_maps", "youtube"] as const;

/** The Site's own hosts besides the Frontend's and the CMS's: its media domain. */
export const MEDIA_HOSTS = manifest.media?.domain ? [manifest.media.domain] : [];

/**
 * The deployed Worker's bindings (infra/frontend.run.ts declares them).
 * `astro dev` and tests run outside workerd, where `cloudflare:workers`
 * doesn't exist: there are none.
 */
export async function bindings(): Promise<ContentBindings & ConsentBindings> {
  if (!import.meta.env.SSR) return {};
  workers ??= import("cloudflare:workers").catch(() => null);
  return ((await workers)?.env ?? {}) as ContentBindings & ConsentBindings;
}

/**
 * This Site's content runtime, made for each request. Only local development
 * reads the CMS live without a publication store; a built Frontend without
 * one is a 503.
 */
export function content() {
  return createContentRuntime<NomiaContent>({
    // The Site's identity: the CMS signs its events with the same one
    // (GQ_CONTENT_SITE_ID in apps/cms/config/application.php).
    site: manifest.project,
    graphqlEndpoint,
    cmsOrigin: manifest.domains
      ? `https://${manifest.domains.admin}`
      : new URL(graphqlEndpoint).origin,
    wordpress: manifest.wordpress,
    development: import.meta.env.DEV,
    isServer: () => import.meta.env.SSR,
    bindings,
    // Nomia's blocks, stored with each page and post (src/lib/nomia-content.ts).
    extension: nomiaExtension,
    // Published bodies' embeds become consent placeholders at delivery, and
    // gq-config's Legal Contract and GA4 toggle are read into each chrome.
    consent: { services: CONSENT_SERVICES, firstPartyHosts: MEDIA_HOSTS, cmsSettings: true },
  });
}

export type ContentRuntime = ReturnType<typeof content>;
