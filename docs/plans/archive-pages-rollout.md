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

- **gq-content has released collections:** the GETQUICK → Archives setting,
  CPT items stored as collections, and `content.list` / `content.terms`. Until
  the Site is on that release, both blocks render their empty state ("A lista
  não está disponível de momento.").
- **@getquick/site pins that release.** Both pins are blueprint-managed keys
  (`gq.lock.json`): `getquick/gq-content` in `apps/cms/composer.json` and
  `@getquick/content` in `apps/frontend/package.json`. They move through a
  gq-site release and `gq sync`, never by hand.
- **[#54](https://github.com/Quick-Release/nomia-bnq/pull/54) is released.**
  The category Pages (`/biblioteca/legislacao/`, `/oportunidades/avisos/`, …)
  collide with the CPTs' single-post rule (`biblioteca/<slug>/`), not only with
  their archives. The Archives setting gives the archive URI to its Page, but
  only #54 moves the single posts to `biblioteca/documento/<slug>/`,
  `oportunidades/oportunidade/<slug>/` and `ferramentas/ferramenta/<slug>/`.
- **CPT items carry no third-party images.** Serving the items makes their
  bodies public on the Frontend, which CONSENT-1 checks. The
  [consent enablement plan](./consent-enablement.md#3-content-production-cms-by-an-editor)
  lists the `recursos_educativos` entries with images on
  `mlgczzplk1pi.i.optimole.com`: re-host them first.

## 1. Bump the content pair

On a branch:

```sh
pnpm add -D -w @getquick/site@<release pinning the new pair>
pnpm exec gq sync          # rewrites the two pins and gq.lock.json
pnpm install
pnpm cms:composer:update   # composer.lock picks up getquick/gq-content
```

Then, in `apps/frontend`:

- in `src/lib/content.ts`, drop the cast around `collections`
  (`...({ collections: RUNTIME_COLLECTIONS } as object)`) and pass it as a
  plain setting;
- in `src/lib/content-listing.ts`, replace the provisional types with the
  package's own, and remove the feature detection if `list` and `terms` are
  always present.

Check the final API against the provisional one this code was written to:
the `collections` setting's shape, `list`'s query and answer, and `terms`'s
answer. Run `pnpm check`, `pnpm test`, `pnpm cms:test` and `pnpm cms:lint`, open
the PR, merge it, and release (`pnpm push minor`).

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
