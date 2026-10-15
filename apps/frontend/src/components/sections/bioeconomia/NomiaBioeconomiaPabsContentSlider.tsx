import { useCallback, useId, useRef, useState } from "react";
import { cn } from "../../../lib/utils";

export type NomiaBioeconomiaPabsPaneTag = {
  label: string;
  href: string;
};

export type NomiaBioeconomiaPabsPane = {
  navLabel: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  tags: readonly NomiaBioeconomiaPabsPaneTag[];
};

export type NomiaBioeconomiaPabsContentSliderProps = {
  eyebrow: string;
  heading: string;
  intro: string;
  panes: readonly NomiaBioeconomiaPabsPane[];
};

function AsteriskIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex size-6 shrink-0 items-center justify-center", className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-6" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3v18M3 12h18M5.64 5.64l12.72 12.72M18.36 5.64L5.64 18.36"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function DownloadCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-6 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M12 8v6m0 0l-2.5-2.5M12 14l2.5-2.5M8 17h8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const nomiaBioeconomiaPabsContentSliderDefaults = {
  eyebrow: "PABS",
  heading: "Plano de Ação para a Bioeconomia Sustentável — Horizonte 2025",
  intro:
    "Aprovado pela Resolução do Conselho de Ministros n.º 183/2021, pretende acelerar a transição da economia portuguesa para um modelo de bioeconomia sustentável e circular.",
  panes: [
    {
      navLabel: "Sustentável",
      title: "Produção sustentável e utilização inteligente de recursos biológicos",
      subtitle:
        "Promover recursos biológicos de base regional, valorizando o potencial dos territórios e das cadeias produtivas locais.",
      imageSrc: "/images/bioeconomia-sustentavel/pabs-slider-sustentavel.jpg",
      imageAlt: "Cereais derramados de um saco de papel sobre uma superfície clara.",
      tags: [
        { label: "Agricultura e Agroindústria", href: "/biblioteca/" },
        { label: "Biotecnologia e Bioindústria", href: "/biblioteca/" },
        { label: "Cidades e Territórios", href: "/biblioteca/" },
      ],
    },
    {
      navLabel: "Soluções",
      title: "Soluções inovadoras e demonstração de valor",
      subtitle:
        "Apoiar projetos-piloto, plataformas de partilha de conhecimento e parcerias entre investigação, empresas e territórios.",
      imageSrc: "/images/bioeconomia-sustentavel/card-o-que-e.jpg",
      imageAlt: "Rega de plantas — recurso biológico em uso.",
      tags: [{ label: "Recursos e resíduos", href: "/biblioteca/" }],
    },
    {
      navLabel: "Bioindústria",
      title: "Valorização industrial da biomassa",
      subtitle:
        "Estimular fileiras de base biológica com maior valor acrescentado, segurança de abastecimento e perfil de emissões favorável.",
      imageSrc: "/images/bioeconomia-sustentavel/card-porque-importante.jpg",
      imageAlt: "Cesto com frutas e legumes frescos.",
      tags: [{ label: "Indústria e inovação", href: "/biblioteca/" }],
    },
    {
      navLabel: "Formação",
      title: "Capacitação, literacia e competências",
      subtitle:
        "Reforçar competências técnicas e transversais ao longo das cadeias de valor, da formação profissional ao ensino superior.",
      imageSrc: "/images/home/bioeconomia-intro/hero.jpg",
      imageAlt: "Mãos a plantar uma muda em solo.",
      tags: [{ label: "Educação e sensibilização", href: "/biblioteca/" }],
    },
    {
      navLabel: "Avaliação",
      title: "Monitorização e melhoria contínua",
      subtitle:
        "Acompanhar indicadores, reportar progressos e ajustar prioridades em função de evidência científica e de contexto económico.",
      imageSrc: "/images/bioeconomia-sustentavel/phases-band-background.jpg",
      imageAlt: "Criança a plantar uma muda em solo escuro.",
      tags: [{ label: "Indicadores", href: "/indicadores/" }],
    },
  ],
} as const satisfies NomiaBioeconomiaPabsContentSliderProps;

export default function NomiaBioeconomiaPabsContentSlider({
  eyebrow,
  heading,
  intro,
  panes,
}: NomiaBioeconomiaPabsContentSliderProps) {
  const baseId = useId().replace(/:/g, "");
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pane = panes[selected]!;

  const goToTab = useCallback(
    (index: number) => {
      const n = panes.length;
      const next = ((index % n) + n) % n;
      setSelected(next);
      requestAnimationFrame(() => {
        tabRefs.current[next]?.focus();
      });
    },
    [panes.length],
  );

  const onTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goToTab(index + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goToTab(index - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goToTab(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToTab(panes.length - 1);
      }
    },
    [goToTab, panes.length],
  );

  return (
    <div
      className="font-primary bg-monochrome-light-100 text-main-cinza-700 w-full px-4 py-16 md:px-16 md:py-28"
      data-nomia-header-surface="light"
      data-node-id="40017244:13264"
    >
      <div
        className="mx-auto flex w-full max-w-[1792px] flex-col gap-10 md:gap-14"
        data-node-id="40017244:13265"
      >
        <header className="flex w-full flex-col gap-4" data-node-id="40017244:13266">
          <div
            className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8"
            data-node-id="40017244:13267"
          >
            <div className="text-main-botnico-400 flex shrink-0 items-center gap-1 text-body font-medium leading-[var(--typography-line-height-i)] tracking-[var(--tracking-typography-0)]">
              <AsteriskIcon />
              <span className="whitespace-nowrap uppercase">{eyebrow}</span>
            </div>
            <h2
              id="nomia-pabs-content-slider-heading"
              className="text-h4 font-semibold leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)]"
              data-node-id="40017244:13270"
            >
              {heading}
            </h2>
          </div>
          <p
            className="text-subtitle font-normal leading-[var(--typography-line-height-g)] tracking-[var(--tracking-typography-0)]"
            data-node-id="40017244:13271"
          >
            {intro}
          </p>
        </header>

        <div
          className="border-monochrome-light-300 flex w-full flex-col overflow-hidden rounded-none border-t border-b lg:flex-row"
          data-node-id="40017244:13272"
        >
          <div
            className="border-monochrome-light-300 flex shrink-0 flex-row overflow-x-auto lg:w-[min(100%,26.5rem)] lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0"
            role="tablist"
            aria-label="Eixos do PABS"
            data-node-id="40017244:13273"
          >
            {panes.map((p, index) => {
              const isSelected = index === selected;
              const tabId = `${baseId}-tab-${index}`;
              return (
                <button
                  key={p.navLabel}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={isSelected ? 0 : -1}
                  className={cn(
                    "border-monochrome-light-300 min-w-[12rem] shrink-0 border-b px-8 py-10 text-left text-h4 font-semibold leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)] transition-colors last:border-b-0 lg:min-w-0 lg:w-full lg:border-r-0 lg:border-b lg:last:border-b-0",
                    "hover:bg-main-botnico-400 hover:text-main-cinza-700",
                    isSelected
                      ? "bg-main-botnico-400 text-main-cinza-700"
                      : "bg-transparent text-main-cinza-400",
                  )}
                  data-node-id={
                    index === 0
                      ? "40017244:13274"
                      : index === 1
                        ? "40017244:13276"
                        : index === 2
                          ? "40017244:13278"
                          : index === 3
                            ? "40017244:13280"
                            : "40017244:13282"
                  }
                  onClick={() => setSelected(index)}
                  onKeyDown={(e) => onTabKeyDown(e, index)}
                >
                  <span
                    data-node-id={
                      index === 0
                        ? "40017244:13275"
                        : index === 1
                          ? "40017244:13277"
                          : index === 2
                            ? "40017244:13279"
                            : index === 3
                              ? "40017244:13281"
                              : "40017244:13283"
                    }
                  >
                    {p.navLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="flex min-h-0 min-w-0 flex-1 flex-col gap-8 px-6 py-10 md:gap-8 md:px-12 md:py-16 lg:px-20 xl:px-28 2xl:px-40"
            role="tabpanel"
            id={`${baseId}-panel`}
            aria-labelledby={`${baseId}-tab-${selected}`}
            data-node-id="40017244:13284"
          >
            <div
              className="flex flex-col gap-4 text-main-cinza-700"
              data-node-id="40017244:13285"
              key={pane.navLabel}
            >
              <p
                className="text-h4 font-semibold leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)]"
                data-node-id="40017244:13286"
              >
                {pane.title}
              </p>
              <p
                className="text-subtitle font-normal leading-[var(--typography-line-height-g)] tracking-[var(--tracking-typography-0)]"
                data-node-id="40017244:13287"
              >
                {pane.subtitle}
              </p>
            </div>

            <div
              className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl"
              data-node-id="40017244:13288"
            >
              <img
                src={pane.imageSrc}
                alt={pane.imageAlt}
                className="absolute inset-0 size-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            {pane.tags.length > 0 ? (
              <div className="flex flex-wrap gap-4" data-node-id="40017244:13289">
                {pane.tags.map((tag, ti) => (
                  <a
                    key={`${pane.navLabel}-${tag.label}`}
                    href={tag.href}
                    className="text-notes text-main-cinza-700 border-main-cinza-700 hover:bg-main-cinza-700 focus-visible:ring-main-teal-400 inline-flex items-center gap-2 rounded-[40px] border border-solid px-4 py-2 font-medium leading-[var(--typography-line-height-i)] tracking-[var(--tracking-typography-0)] transition-colors hover:text-neutral-bw-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-monochrome-light-100 focus-visible:outline-none"
                    data-node-id={
                      ti === 0 ? "40017244:13290" : ti === 1 ? "40017244:13294" : "40017244:13298"
                    }
                  >
                    <span
                      data-node-id={
                        ti === 0 ? "40017244:13291" : ti === 1 ? "40017244:13295" : "40017244:13299"
                      }
                    >
                      {tag.label}
                    </span>
                    <DownloadCircleIcon />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
