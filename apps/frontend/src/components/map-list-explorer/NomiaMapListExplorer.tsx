/**
 * Map + filters + list — Nomia Website 2 · Figma node 40017244:29312
 * https://www.figma.com/design/gWqEtVBfoWbYMHQh1rW6s3/Nomia-%E2%80%94-Website--2-?node-id=40017244-29312
 */
import { useMemo, useState } from "react";

import { cn } from "../../lib/utils";
import type {
  NomiaMapAudienceId,
  NomiaMapListExplorerData,
  NomiaMapListItem,
  NomiaMapRegionId,
} from "../../types/nomia-map-list-explorer";
import PortugalRegionsMap from "./PortugalRegionsMap";

const ALL = "";

function ChevronDownIcon() {
  return (
    <svg className="size-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function ArrowRightIcon() {
  return (
    <svg className="size-8 shrink-0" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M8 16h14M18 11l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function filterSelectClassName() {
  return cn(
    "font-primary text-body-large text-main-cinza-700",
    "border-main-cinza-700 w-full cursor-pointer appearance-none border-0 border-b bg-transparent pb-2",
    "leading-[var(--typography-line-height-h)] font-medium tracking-[var(--tracking-typography-0)]",
    "focus-visible:ring-main-teal-400 focus-visible:ring-2 focus-visible:outline-none",
  );
}

type Props = NomiaMapListExplorerData;

function ListRow({
  item,
  isHighlighted,
  onHover,
  onLeave,
}: {
  item: NomiaMapListItem;
  isHighlighted: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <article
      className={cn(
        "border-monochrome-light-400 flex w-full items-stretch overflow-hidden border-b transition-colors",
        isHighlighted && "bg-main-teal-100/40",
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
    >
      <div className="relative h-auto w-[min(240px,36vw)] shrink-0 self-stretch">
        <img
          src={item.imageSrc}
          alt={item.imageAlt}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          decoding="async"
          width={240}
          height={180}
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-6 py-6 pl-6 pr-[min(4rem,8vw)]">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h3 className="text-h4 text-main-cinza-700 font-secondary font-medium leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)]">
            {item.title}
          </h3>
          <p className="text-body-large text-main-cinza-700 font-secondary line-clamp-3 font-normal leading-[var(--typography-line-height-h)] tracking-[var(--tracking-typography-0)]">
            {item.excerpt}
          </p>
          <span className="bg-main-teal-200 text-extra text-main-cinza-700 font-additional w-fit rounded-[24px] px-2 py-1 font-normal leading-[var(--typography-line-height-j)] tracking-[var(--tracking-typography-0)]">
            {item.dateLabel}
          </span>
        </div>
        <a
          href={item.href}
          className="border-main-cinza-700 text-main-cinza-700 hover:border-main-teal-400 hover:text-main-teal-400 focus-visible:ring-main-teal-400 flex size-14 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label={`Ver ${item.title}`}
        >
          <ArrowRightIcon />
        </a>
      </div>
    </article>
  );
}

export default function NomiaMapListExplorer({ regions, audiences, items }: Props) {
  const [regionId, setRegionId] = useState<NomiaMapRegionId | "">("alentejo");
  const [audienceId, setAudienceId] = useState<NomiaMapAudienceId | "">(ALL);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (regionId && item.regionId !== regionId) return false;
      if (audienceId && !item.audienceIds.includes(audienceId)) return false;
      return true;
    });
  }, [items, regionId, audienceId]);

  const regionLabel = regions.find((r) => r.id === regionId)?.label ?? "Todas as regiões";
  const audienceLabel = audiences.find((a) => a.id === audienceId)?.label ?? "Todos os públicos";

  return (
    <section
      className="bg-neutral-bw-white text-main-cinza-700 w-full"
      aria-label="Explorador de boas práticas por região"
      data-node-id="40017244:29312"
      data-nomia-header-surface="light"
    >
      <div className="mx-auto flex w-full min-w-0 max-w-[1920px] flex-col lg:min-h-[min(100vh,1072px)] lg:flex-row">
        {/* Map column */}
        <div
          className="border-monochrome-light-400 flex min-w-0 flex-1 items-center justify-center border-b px-4 py-12 md:px-16 lg:border-r lg:border-b-0 lg:py-16"
          data-node-id="40017244:29313"
        >
          <PortugalRegionsMap
            selectedRegionId={regionId}
            onSelectRegion={(id) => {
              setRegionId(id);
              setHoveredItemId(null);
            }}
          />
        </div>

        {/* Filters + list column */}
        <div
          className="flex min-w-0 w-full flex-col lg:w-1/2 xl:max-w-[960px]"
          data-node-id="40017244:29392"
        >
          <div
            className="border-monochrome-light-400 flex flex-col gap-6 border-b px-4 py-10 md:px-16 lg:pl-10"
            data-node-id="40017244:29393"
          >
            <h2
              className="text-subtitle text-main-cinza-700 font-primary font-semibold leading-[var(--typography-line-height-g)] tracking-[var(--tracking-typography-0)]"
              id="map-list-filters-heading"
            >
              Filtros
            </h2>
            <div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
              role="group"
              aria-labelledby="map-list-filters-heading"
            >
              <div className="relative min-w-0">
                <label htmlFor="nomia-map-region" className="sr-only">
                  Região
                </label>
                <select
                  id="nomia-map-region"
                  className={filterSelectClassName()}
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value as NomiaMapRegionId)}
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <span className="text-main-cinza-700 pointer-events-none absolute top-0 right-0">
                  <ChevronDownIcon />
                </span>
              </div>
              {audiences.map((a) => (
                <div key={a.id} className="relative min-w-0">
                  <label htmlFor={`nomia-map-audience-${a.id}`} className="sr-only">
                    {a.label}
                  </label>
                  <select
                    id={`nomia-map-audience-${a.id}`}
                    className={filterSelectClassName()}
                    value={audienceId === a.id ? a.id : ALL}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAudienceId(v === ALL ? ALL : (v as NomiaMapAudienceId));
                    }}
                  >
                    <option value={ALL}>{a.label}</option>
                    <option value={a.id}>Filtrar por {a.label.toLowerCase()}</option>
                  </select>
                  <span className="text-main-cinza-700 pointer-events-none absolute top-0 right-0">
                    <ChevronDownIcon />
                  </span>
                </div>
              ))}
            </div>
            <p className="text-notes text-main-cinza-500 font-secondary leading-[var(--typography-line-height-j)]">
              A mostrar resultados para{" "}
              <strong className="text-main-cinza-700">{regionLabel}</strong>
              {audienceId ? (
                <>
                  {" "}
                  · <strong className="text-main-cinza-700">{audienceLabel}</strong>
                </>
              ) : null}
            </p>
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 md:px-16 md:py-10 lg:pl-10"
            data-node-id="40017244:29408"
          >
            {filtered.length === 0 ? (
              <p className="text-body text-main-cinza-500 font-secondary py-12 leading-relaxed">
                Nenhum resultado para os filtros seleccionados. Experimente outra região ou
                público-alvo.
              </p>
            ) : (
              filtered.map((item) => (
                <ListRow
                  key={item.id}
                  item={item}
                  isHighlighted={hoveredItemId === item.id}
                  onHover={() => setHoveredItemId(item.id)}
                  onLeave={() => setHoveredItemId(null)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
