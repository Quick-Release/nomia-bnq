import type { CollectionItem } from "@getquick/content";
import { content } from "./content";
import type { NomiaIndicador } from "./indicador-chart";
import type { NomiaExtension } from "./nomia-content";

/*
 * The Indicador chart block's seam onto gq-content's `indicadores` collection:
 * published Indicadores and their charts, from the publication store alone,
 * so a visit never reads WordPress and a page shows an Indicador's current
 * data without being saved again.
 */

export interface PublishedIndicador {
  title: string;
  uri: string;
  chart: NomiaIndicador;
}

/** The store's largest page. */
const PER_PAGE = 100;

/** Every published Indicador with a chart, by ID; null when the store can't be read. */
async function readAll(): Promise<Map<number, PublishedIndicador> | null> {
  const byId = new Map<number, PublishedIndicador>();
  const add = (item: CollectionItem<NomiaExtension>) => {
    if (item.extension && "kind" in item.extension && item.extension.kind === "indicador") {
      byId.set(item.extension.id, {
        title: item.title.trim(),
        uri: item.uri,
        chart: item.extension,
      });
    }
  };
  try {
    for (let page = 1, pages = 1; page <= pages; page++) {
      const listing = await content().list({ collection: "indicadores", page, perPage: PER_PAGE });
      if (listing.kind !== "found") return null;
      listing.items.forEach(add);
      pages = listing.pages;
    }
    return byId;
  } catch (error) {
    console.error("[indicadores] list failed", error);
    return null;
  }
}

// Each Indicador chart block on a page asks for one; the page lists them once.
const perRequest = new WeakMap<Request, Promise<Map<number, PublishedIndicador> | null>>();

/**
 * A published Indicador and its chart, for one visit: `missing` when it isn't
 * published (or has no chart stored yet), `unavailable` when the store can't
 * be read.
 */
export async function publishedIndicador(
  id: number,
  request: Request,
): Promise<{ kind: "found"; indicador: PublishedIndicador } | { kind: "missing" | "unavailable" }> {
  let all = perRequest.get(request);
  if (!all) {
    all = readAll();
    perRequest.set(request, all);
  }
  const byId = await all;
  if (!byId) return { kind: "unavailable" };
  const indicador = byId.get(id);
  return indicador ? { kind: "found", indicador } : { kind: "missing" };
}
