# NUTS map

## Purpose

Shows the Biblioteca's **Boas práticas** on a map of Portugal by NUTS 2024
region (design: Nomia — Website 2, node 40017522:49984). Visitors switch the
map between three levels, each drawn in its own colour:

| Level  | Units                                                              | Colour       |
| ------ | ------------------------------------------------------------------ | ------------ |
| NUTS 0 | Portugal                                                           | Botânico 200 |
| NUTS 1 | Continente, Região Autónoma dos Açores, Região Autónoma da Madeira | Teal 200     |
| NUTS 2 | the 9 regions (Norte, Centro, Oeste e Vale do Tejo, …)             | Ciano 200    |

Clicking (or pressing Enter on) a region, or picking it in the **Região**
filter, lists only the entries tagged with that region or any region inside
it: Continente lists Norte's and Douro's entries; Alentejo lists Alentejo
Central's. Clicking the selected region again lists every entry. Each card links to
its entry.

Entries tagged **Internacional** are not on the map. They follow it under
their own heading (**Boas Práticas internacionais** by default), listed as the
Listing block lists them (its `list` display). The section only shows when
there is at least one.

## Editing

Add a **Mapa de boas práticas (NUTS)** block. Its settings are the level the
map shows first (**level**: `0`, `1` or `2`; `2` by default) and the heading
of the international entries (**internationalTitle**). It is on
`/biblioteca/boas-praticas/` (page 1195), after the hero, in place of the
Filters and Listing blocks.

The entries are not chosen on the block. It lists every published Biblioteca
entry in the **Boas práticas** category, newest first, with its title and
excerpt (no image). On each entry, editors tick:

- **Regiões NUTS** (`regiao_nuts`): the regions it applies to, at any level,
  NUTS 3 included, or **Internacional** for an entry outside Portugal. An entry tagged with Douro (NUTS 3) is listed under Norte
  (NUTS 2), Continente (NUTS 1) and Portugal (NUTS 0). An entry tagged only
  with Portugal is listed when no region is selected, and under Portugal.

The Regiões NUTS terms are Portugal's NUTS 2024 units (in force since
1 January 2024; the Extra-Regio codes are left out) and Internacional
(`internacional`), seeded by gq-bioeconomia
(`Content\Nuts`) when the plugin is upgraded. Each term's slug is its code in
lower case (`pt1c`), its parent is its parent unit, and its code, level and
English label are term meta. Only administrators can change them. The
Frontend keeps the same table in `src/lib/nuts.ts`; `nuts.test.ts` compares
the two.

After tagging entries, refresh the Biblioteca (`pnpm frontend:refresh`) so
the stored items carry the new terms. Items stored before this block existed
have none until they are refreshed.

## Frontend behavior

`NutsMapBlock.astro` reads the Boas práticas from the publication store on
each visit (`src/lib/boas-praticas.ts`) and renders `NutsMap.astro`: the map,
the filters and every card are in the page, and a small script switches the
level, selects regions and hides the cards that don't match. Without the
script the map is static and every entry is listed. When the store can't be
read, the block renders nothing.

Each card carries the codes of its regions and of every region above them
(`data-regions`), so selecting a region is a lookup. NUTS codes nest by
prefix (PT → PT1 → PT1C → PT1C2).

The cards show no date, as no entry does on this Site.

## The map

The shapes are Eurostat GISCO's NUTS 2024 boundaries at 1:3 million, not the
design's drawing, so the regions are the real ones. Administrative
boundaries: © EuroGeographics; the map's caption credits them, as GISCO's
terms ask. The mainland is drawn on the right and the Açores and Madeira in
inset boxes on its left, each north-up. The mainland and Madeira are true to
scale at their own latitude. The Açores are not: each group of nearby islands
is drawn 1.9 times larger about its own centre, so the islands can be seen;
above that, Terceira meets São Miguel. The Selvagens are left out of
Madeira's box. Clicking an inset box selects its islands.

`src/components/nuts-map/nuts-map-geometry.json` is generated:

```sh
mkdir -p /data/agents/scratch/nuts-map/gisco4326
cd /data/agents/scratch/nuts-map/gisco4326
for l in 0 1 2; do
  curl -fLo L$l.geojson "https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2024_4326_LEVL_$l.geojson"
done
cd -  # apps/frontend
python3 -I scripts/nuts-map/build-nuts-map.py /data/agents/scratch/nuts-map/gisco4326 src/components/nuts-map/nuts-map-geometry.json
```

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `nuts-map`
- WordPress block name: `getquick/nuts-map`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/NutsMapBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/assets/editor.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `level`
- `internationalTitle`
<!-- END GENERATED: structured-block-contract -->
