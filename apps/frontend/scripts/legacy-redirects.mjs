// Writes src/config/legacy-entry-redirects.json: every published entry's URL
// on the retired Nomia frontend (nomia.getquick.io, apa-nomia's nomia-fe)
// mapped to its URI now, where the two differ. The old frontend served each
// type from a fixed folder (its src/config/cpt-archives.ts and the
// noticias/, noticias-eventos/ and eventos/ routes); this Site serves the
// CMS's own URIs. src/lib/legacy-redirects.ts answers with the map.
//
// The map is a snapshot: entries published from now on never had an old URL.
// Re-run it only if old entries' slugs or URIs change in the CMS:
//   node apps/frontend/scripts/legacy-redirects.mjs
import { readFileSync, writeFileSync } from "node:fs";

const ops = JSON.parse(readFileSync(new URL("../../../gq.ops.json", import.meta.url), "utf8"));
const endpoint = `https://${ops.domains.admin}/wp/graphql`;
const output = new URL("../src/config/legacy-entry-redirects.json", import.meta.url);

/** The folders the old frontend served each type's entries from, by GraphQL type. */
const OLD_FOLDERS = {
  Post: ["noticias", "noticias-eventos"],
  Evento: ["eventos", "noticias-eventos"],
  Biblioteca: ["biblioteca"],
  Oportunidade: ["oportunidades"],
  Galeria: ["galeria"],
  Infografia: ["infografias"],
  Video: ["videos"],
  Podcast: ["podcasts"],
  Plataforma: ["plataformas"],
  BaseDeDados: ["bases-de-dados"],
  RecursoEducativo: ["recursos-educativos"],
  Glossario: ["glossario"],
  Indicador: ["indicadores"],
};

const QUERY = `query ($after: String) {
  contentNodes(first: 100, after: $after, where: { status: PUBLISH }) {
    pageInfo { hasNextPage endCursor }
    nodes { __typename uri slug }
  }
}`;

async function entries() {
  const nodes = [];
  let after = null;
  do {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { after } }),
    });
    const { data, errors } = await response.json();
    if (errors) throw new Error(JSON.stringify(errors));
    nodes.push(...data.contentNodes.nodes);
    after = data.contentNodes.pageInfo.hasNextPage ? data.contentNodes.pageInfo.endCursor : null;
  } while (after);
  return nodes;
}

const redirects = {};
for (const { __typename, uri, slug } of await entries()) {
  for (const folder of OLD_FOLDERS[__typename] ?? []) {
    const old = `/${folder}/${slug}/`;
    if (old !== uri) redirects[old] = uri;
  }
}
const sorted = Object.fromEntries(Object.entries(redirects).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(output, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`${Object.keys(sorted).length} redirects written to ${output.pathname}`);
