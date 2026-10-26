// The retired Nomia frontend's URLs (nomia.getquick.io, apa-nomia's nomia-fe),
// answered with where their content lives now. The old hosts redirect here
// keeping the path (a Cloudflare rule on getquick.io), so every old link
// arrives at this Site and is sent on from here.
import entries from "../config/legacy-entry-redirects.json";

/**
 * The old frontend's hand-made routes whose page moved: its archives and
 * landings, by path. Entries (news, documents, opportunities, …) are in
 * legacy-entry-redirects.json, generated from the CMS by
 * scripts/legacy-redirects.mjs.
 */
const SECTIONS: Record<string, string> = {
  "/boas-praticas/": "/biblioteca/boas-praticas/",
  "/glossario/": "/biblioteca/glossario/",
  "/legislacao/": "/biblioteca/legislacao/",
  "/newsletters/": "/biblioteca/newsletters/",
  "/publicacoes/": "/biblioteca/publicacoes/",
  "/infografias/": "/multimedia/infografias/",
  "/galeria/": "/multimedia/galeria/",
  "/podcasts/": "/multimedia/podcasts/",
  "/videos/": "/multimedia/videos/",
  "/plataformas/": "/ferramentas/plataformas/",
  "/bases-de-dados/": "/ferramentas/bases-de-dados/",
  "/oportunidades/concursos/": "/oportunidades/concursos-e-premios/",
  "/oportunidades/premios/": "/oportunidades/concursos-e-premios/",
  "/noticias-e-eventos/": "/noticias/",
  "/noticias-eventos/": "/noticias/",
  "/indicadores/": "/economia-circular/indicadores-economia-circular/",
  "/economia-circular/indicadores/": "/economia-circular/indicadores-economia-circular/",
  "/bioeconomia-sustentavel/indicadores/": "/bioeconomia-sustentavel/indicadores-bioeconomia/",
};

const ENTRIES: Record<string, string> = entries;

/**
 * Where an old frontend URL's content is now, or null when the path isn't
 * one of the old frontend's moved URLs. The old frontend also answered under
 * /pt/ (its default language, unprefixed here) and /en/ (a home with no
 * English content behind it).
 */
export function legacyRedirect(pathname: string): string | null {
  const slashed = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (slashed.startsWith("/en/")) return "/";
  const prefixed = slashed.startsWith("/pt/");
  const path = prefixed ? slashed.slice("/pt".length) : slashed;
  // A /pt/ path whose rest didn't move is served at the rest.
  return SECTIONS[path] ?? ENTRIES[path] ?? (prefixed ? path : null);
}
