// Nomia's adoption of CONSENT-1 and LEGAL-1 (docs/adr/0001), beyond what the
// content runtime does with its `consent` configuration (src/lib/content.ts):
// the runtime gates published bodies, reads the Legal Contract into the
// chrome and gives each page its consent configuration; this file gates what
// the runtime doesn't see (Nomia blocks' saved HTML, the contact map, block
// media). The Runtime owns the categories, the catalog, the banner and its
// copy, the placeholders and the endpoints (the blueprint's pages/gq/consent.ts
// serves them); this file only chooses from them.
import { consentConfiguration, embedPlaceholder, rewriteEmbeds } from "@getquick/content/consent";
import ops from "../../../../gq.ops.json";
import { CONSENT_SERVICES, MEDIA_HOSTS } from "./content";
import type { NomiaContent } from "./nomia-content";
import type { WpParsedBlock } from "./wp-blocks";

/** The Site's own hosts besides the Frontend's: its CMS and its media domain. */
const firstPartyHosts = [ops.domains?.admin, ...MEDIA_HOSTS].filter((host): host is string =>
  Boolean(host),
);

// Embeds depend only on the declared services, as the runtime's own gating:
// GA4 and the controller never change what an embed becomes.
const embedConfiguration = consentConfiguration({ services: CONSENT_SERVICES });

/**
 * A media URL a block may load before consent: relative, or on the Site's
 * own media or CMS host. Anything else is left out (undefined), so the block
 * falls back as it does without one: no catalog service covers a video file
 * hosted elsewhere (CN-R3), and editors upload to the media library.
 */
export function firstPartyMedia(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const { protocol, host } = new URL(url);
    return protocol === "https:" && firstPartyHosts.includes(host) ? url : undefined;
  } catch {
    return undefined;
  }
}

/** Saved HTML with the runtime's embed rules (CN-R13): placeholders, or blocked. */
function gateEmbeds(html: string, language: string): string {
  if (!html) return html;
  return rewriteEmbeds(html, { configuration: embedConfiguration, language, firstPartyHosts }).html;
}

function gateBlocks(blocks: WpParsedBlock[], language: string): WpParsedBlock[] {
  return blocks.map((block) => ({
    ...block,
    innerHTML: gateEmbeds(block.innerHTML ?? "", language),
    innerContent: (block.innerContent ?? []).map((piece) =>
      typeof piece === "string" ? gateEmbeds(piece, language) : piece,
    ),
    innerBlocks: gateBlocks(block.innerBlocks ?? [], language),
  }));
}

/**
 * A Nomia-block page as a visitor may first receive it. The runtime gates a
 * published body, not a Site's `extension`, so every piece of the blocks'
 * saved HTML (a core/html iframe, an embed) is gated here, on each render;
 * the store keeps what was published.
 */
export function gatedNomiaContent(nomia: NomiaContent, language: string): NomiaContent {
  return { ...nomia, blocks: gateBlocks(nomia.blocks, language) };
}

/** The contact map's Google Maps embed, as a consent placeholder. */
export function contactMapPlaceholder({
  src,
  title,
  language,
}: {
  src: string;
  title: string;
  language: string;
}): string {
  return embedPlaceholder({
    service: "google_maps",
    src,
    title,
    language,
    attributes: {
      loading: "lazy",
      referrerpolicy: "no-referrer-when-downgrade",
      allowfullscreen: "",
    },
  });
}
