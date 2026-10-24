# Archive Pages: rollout

How Nomia's archive Pages ([#55](https://github.com/Quick-Release/nomia-bnq/issues/55))
reach production. An archive Page is a WordPress Page that an editor lays out
with blocks: a hero, the **Pesquisa e filtros** block (`getquick/content-filters`),
other sections, and the **Listagem de conteúdos** block (`getquick/content-listing`).
Every visit is answered from gq-content's publication store, and nothing reads
WordPress.

Every step below changes production. A merge to `main` deploys nothing; the
release tag does.

## 0. Before you start

Done before this code was merged:

- **gq-content has released collections**
  ([gq-content#38](https://github.com/Quick-Release/gq-content/pull/38), in
  0.3.0): the GETQUICK → Archives setting, CPT items stored as collections,
  and `content.list` / `content.terms`. The Site has been on 0.3.2 since
  `@getquick/site` 0.23.2.
- **The category Pages own their URLs**
  ([#66](https://github.com/Quick-Release/nomia-bnq/pull/66), v0.10.8). The
  CPTs have no archives, and Biblioteca, Oportunidades and Ferramentas items
  live under `biblioteca/documento/<slug>/`,
  `oportunidades/oportunidade/<slug>/` and `ferramentas/ferramenta/<slug>/`.

Shipped with this code:

- **Every collection's taxonomy is in WPGraphQL.** The runtime checks it on
  each refresh and reconciliation, and fails them, naming the taxonomy, when
  one isn't. Production showed only `setor_atividade`; gq-bioeconomia now adds
  `categoria_biblioteca`, `tipo_evento`, `tematicas` and
  `categoria_oportunidade`. All 12 post types are already shown under the
  `graphqlType` names `src/lib/content-collections.ts` uses.

Still open:

- **CPT items carry no third-party images.** Items are public on the
  Frontend, which CONSENT-1 checks. The
  [consent enablement plan](./consent-enablement.md#3-content-production-cms-by-an-editor)
  lists the `recursos_educativos` entries with images on
  `mlgczzplk1pi.i.optimole.com`. On 2026-10-24 entries 926, 929 and 1382
  still load them, and their pages already serve them: re-host them.

## 1. Release

Run `pnpm check`, `pnpm test`, `pnpm cms:test` and `pnpm cms:lint`, merge,
and release (`pnpm push minor`). The release ships the blocks, the
`collections` setting and the taxonomies together, so the taxonomies are live
no later than the setting that needs them.

## 2. Assign the archive Pages (production CMS, GETQUICK → Archives)

| Type                | Archive Page                                         |
| ------------------- | ---------------------------------------------------- |
| Biblioteca          | Biblioteca (781, `/biblioteca/`)                     |
| Eventos             | Eventos (759, `/eventos/`)                           |
| Oportunidades       | Oportunidades (761, `/oportunidades/`)               |
| Recursos educativos | Para os Mais Novos (918, `/recursos-educativos/`)    |
| Glossário           | Glossário (1199, `/biblioteca/glossario/`)           |
| Infografias         | Infografias (740, `/multimedia/infografias/`)        |
| Vídeos              | Vídeos (747, `/multimedia/videos/`)                  |
| Podcasts            | Podcasts (749, `/multimedia/podcasts/`)              |
| Plataformas         | Plataformas (800, `/ferramentas/plataformas/`)       |
| Bases de dados      | Bases de dados (802, `/ferramentas/bases-de-dados/`) |

There is no Page for Indicadores or Ferramentas items (Ferramentas has no
published items; `/ferramentas/` is a landing Page). Galeria
(`nomia_gallery`) isn't public, so it isn't a collection, and
`/multimedia/galeria/` stays as it is.

## 3. Lay out the Pages (production CMS, by an editor)

Add the blocks below the Page's existing hero. On a category Page the Listing
fixes the category, so the Filters block turns that category off.

| Page                                                  | Listing: type · category · presentation       | Filters: hide |
| ----------------------------------------------------- | --------------------------------------------- | ------------- |
| `/biblioteca/`                                        | Biblioteca · all · list                       | none          |
| `/biblioteca/legislacao/`                             | Biblioteca · Categoria = Legislação · list    | Categoria     |
| `/biblioteca/publicacoes/`                            | Biblioteca · Categoria = Publicações · list   | Categoria     |
| `/biblioteca/boas-praticas/`                          | Biblioteca · Categoria = Boas práticas · list | Categoria     |
| `/biblioteca/newsletters/`                            | Biblioteca · Categoria = Newsletters · list   | Categoria     |
| `/biblioteca/glossario/`                              | Glossário · all · list                        | none          |
| `/oportunidades/`                                     | Oportunidades · all · list                    | none          |
| `/oportunidades/{avisos,concursos,formacao,premios}/` | Oportunidades · Categoria = that one · list   | Categoria     |
| `/eventos/`                                           | Eventos · all · list                          | none          |
| `/recursos-educativos/`                               | Recursos educativos · all · thumbnail grid    | none          |
| `/multimedia/infografias/`                            | Infografias · all · thumbnail grid            | none          |
| `/multimedia/videos/`                                 | Vídeos · all · titled thumbnail grid          | none          |
| `/multimedia/podcasts/`                               | Podcasts · all · list                         | none          |
| `/ferramentas/plataformas/`                           | Plataformas · all · thumbnail grid            | none          |
| `/ferramentas/bases-de-dados/`                        | Bases de dados · all · list                   | none          |

These are bioeconomia.pt's presentations (its `cpt-archives.ts`). With today's
counts (10 Biblioteca items at most), the default of 12 per page leaves every
listing on one page.

## 4. Refresh and check

First, in the CMS, **Tools → Site Health** has gq-content's "Pages reachable at
their addresses" check. It lists any Page whose URI another node takes. It
must list none: if a child Page such as `/biblioteca/legislacao/` is there,
#66 isn't live.

```sh
pnpm frontend:refresh        # the whole-Site refresh: stores the Pages and every collection's items
pnpm frontend:events:check   # ✓: reconciliation has caught up
pnpm site:check              # Ready
```

Then each address in step 3 returns 200, and so does a single item from each
listing (follow a link). A filtered view works without JavaScript:

```sh
curl -sI https://nomia.bnq.pt/biblioteca/ | head -1
curl -s 'https://nomia.bnq.pt/biblioteca/?q=plastico' | grep -c data-nomia-content-listing
curl -sI https://nomia.bnq.pt/biblioteca/legislacao/ | head -1
```

## Undo

- **Layout:** remove the blocks from the Pages and refresh. Nothing else
  depends on them.
- **Code:** release a revert of the code PR. Saved Listing and Filters blocks
  then render as unsupported blocks until they're removed from the Pages.
