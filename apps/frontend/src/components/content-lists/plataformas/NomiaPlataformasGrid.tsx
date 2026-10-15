/**
 * Plataformas archive grid + filters — Nomia Website 2 · node 40017272:12228
 * https://www.figma.com/design/gWqEtVBfoWbYMHQh1rW6s3/Nomia-%E2%80%94-Website--2-?node-id=40017272-12228
 */
import { useMemo, useState } from "react";
import type {
  NomiaPlataformaFilterTerm,
  NomiaPlataformaListItem,
  NomiaPlataformasListData,
} from "../../../types/nomia-plataformas-list";

type SortKey = "recent" | "title";

type Props = NomiaPlataformasListData & {
  heading?: string;
};

const ALL_VALUE = "";

function ChevronDownIcon() {
  return (
    <svg
      className="size-6 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="size-6 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function filterSelectClassName() {
  return [
    "font-primary text-body-large text-main-cinza-700",
    "border-main-cinza-700 w-full cursor-pointer appearance-none border-0 border-b bg-transparent pb-2",
    "leading-[var(--typography-line-height-h)] font-medium tracking-[var(--tracking-typography-0)]",
    "focus-visible:ring-main-teal-400 focus-visible:ring-2 focus-visible:outline-none",
  ].join(" ");
}

function matchesTerm(itemTerms: NomiaPlataformaFilterTerm[], selectedSlug: string): boolean {
  if (!selectedSlug) return true;
  return itemTerms.some((t) => t.slug === selectedSlug);
}

function sortItems(items: NomiaPlataformaListItem[], sort: SortKey): NomiaPlataformaListItem[] {
  const copy = [...items];
  if (sort === "title") {
    copy.sort((a, b) => a.title.localeCompare(b.title, "pt"));
    return copy;
  }
  copy.sort((a, b) => {
    const ta = a.date ? Date.parse(a.date) : 0;
    const tb = b.date ? Date.parse(b.date) : 0;
    return tb - ta;
  });
  return copy;
}

export default function NomiaPlataformasGrid({
  items,
  tematicas,
  setores,
  heading = "Plataformas",
}: Props) {
  const [search, setSearch] = useState("");
  const [tematicaSlug, setTematicaSlug] = useState(ALL_VALUE);
  const [setorSlug, setSetorSlug] = useState(ALL_VALUE);
  const [sort, setSort] = useState<SortKey>("recent");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = items.filter((item) => {
      if (!matchesTerm(item.tematicas, tematicaSlug)) return false;
      if (!matchesTerm(item.setores, setorSlug)) return false;
      if (!q) return true;
      const haystack = [item.title, item.subtitle, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    rows = sortItems(rows, sort);
    return rows;
  }, [items, search, tematicaSlug, setorSlug, sort]);

  return (
    <section
      className="bg-neutral-bw-white text-main-cinza-700 w-full"
      data-nomia-header-surface="light"
      data-node-id="40017272:12228"
      aria-labelledby="nomia-plataformas-grid-heading"
    >
      <div className="mx-auto w-full max-w-[1920px] px-4 py-12 md:px-16 md:py-16">
        <div
          className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-[7rem]"
          data-node-id="40017244:30015"
        >
          <h2
            id="nomia-plataformas-grid-heading"
            className="text-h4 md:text-h2 text-main-teal-400 font-primary shrink-0 font-medium leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)] md:leading-[var(--typography-line-height-d)]"
            data-node-id="40017244:30016"
          >
            {heading}
          </h2>

          <div
            className="flex w-full flex-col gap-6 sm:flex-row sm:flex-wrap lg:flex-1 lg:justify-end"
            data-node-id="40017244:30017"
          >
            <label className="relative min-w-[12rem] flex-1 sm:min-w-[14rem]">
              <span className="sr-only">Pesquisar plataformas</span>
              <span className="text-main-cinza-700 pointer-events-none absolute top-0 left-0 flex items-center gap-2">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisa"
                className="font-primary text-body-large text-main-cinza-700 placeholder:text-main-cinza-500 border-main-cinza-700 w-full border-0 border-b bg-transparent pt-0 pb-2 pl-8 leading-[var(--typography-line-height-h)] font-medium tracking-[var(--tracking-typography-0)] focus-visible:ring-main-teal-400 focus-visible:ring-2 focus-visible:outline-none"
                data-node-id="40017244:30021"
              />
            </label>

            <div className="relative min-w-[11rem] flex-1 sm:max-w-[14rem]">
              <label htmlFor="nomia-plataformas-tematica" className="sr-only">
                Temática
              </label>
              <select
                id="nomia-plataformas-tematica"
                value={tematicaSlug}
                onChange={(e) => setTematicaSlug(e.target.value)}
                className={filterSelectClassName()}
              >
                <option value={ALL_VALUE}>Temática: Todas</option>
                {tematicas.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
              <span className="text-main-cinza-700 pointer-events-none absolute top-0 right-0">
                <ChevronDownIcon />
              </span>
            </div>

            <div className="relative min-w-[11rem] flex-1 sm:max-w-[16rem]">
              <label htmlFor="nomia-plataformas-setor" className="sr-only">
                Sector de atividade
              </label>
              <select
                id="nomia-plataformas-setor"
                value={setorSlug}
                onChange={(e) => setSetorSlug(e.target.value)}
                className={filterSelectClassName()}
              >
                <option value={ALL_VALUE}>Sector: Todos</option>
                {setores.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span className="text-main-cinza-700 pointer-events-none absolute top-0 right-0">
                <ChevronDownIcon />
              </span>
            </div>

            <div className="relative min-w-[11rem] flex-1 sm:max-w-[15rem]">
              <label htmlFor="nomia-plataformas-sort" className="sr-only">
                Ordenar
              </label>
              <select
                id="nomia-plataformas-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={filterSelectClassName()}
              >
                <option value="recent">Ordenar por: Mais recente</option>
                <option value="title">Ordenar por: Título (A–Z)</option>
              </select>
              <span className="text-main-cinza-700 pointer-events-none absolute top-0 right-0">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-body text-main-cinza-500 mt-12 leading-relaxed">
            Nenhuma plataforma corresponde aos filtros selecionados.
          </p>
        ) : (
          <ul
            className="mt-10 grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2 xl:grid-cols-3"
            data-node-id="40017244:29961"
          >
            {filtered.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={`${item.accentClass} group relative flex aspect-square min-h-[280px] flex-col justify-end overflow-hidden p-8 no-underline transition-[filter] duration-200 hover:brightness-[1.03] focus-visible:ring-main-teal-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:p-12 lg:p-[4.5rem]`}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="absolute inset-0 size-full object-cover opacity-30"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-main-cinza-700/45" aria-hidden />
                  {item.featured ? (
                    <span className="bg-main-teal-200 text-main-cinza-700 font-additional text-body-large absolute top-4 left-0 rounded-r-[1.5rem] px-4 py-1 font-medium leading-[var(--typography-line-height-h)] tracking-[var(--tracking-typography-0)]">
                      Destaque
                    </span>
                  ) : null}
                  <div className="text-main-cinza-100 relative z-10 flex flex-col gap-2">
                    <p className="text-h4 font-secondary font-medium leading-[var(--typography-line-height-e)] tracking-[var(--tracking-typography-0)]">
                      {item.title}
                    </p>
                    {item.dateLabel ? (
                      <p className="text-body font-secondary leading-[var(--typography-line-height-i)] font-normal tracking-[var(--tracking-typography-0)]">
                        {item.dateLabel}
                      </p>
                    ) : null}
                    {item.description ? (
                      <p className="text-body font-secondary line-clamp-3 leading-[var(--typography-line-height-i)] font-normal tracking-[var(--tracking-typography-0)]">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
