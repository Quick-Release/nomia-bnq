import { cn } from "../../../lib/utils";
import { Carousel, CarouselContent, CarouselItem } from "../../ui/carousel";

export type HorizontalScrollWithContentPill = { label: string; href?: string };

export type HorizontalScrollWithContentSlide = {
  id: string;
  imageSrc: string;
  imageAlt: string;
  caption: string;
  href: string;
};

export type HorizontalScrollWithContentProps = {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  pills: readonly HorizontalScrollWithContentPill[];
  verTodosHref?: string;
  verTodosLabel?: string;
  slides: readonly HorizontalScrollWithContentSlide[];
};

function AsteriskMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "text-main-ciano-400 inline-flex size-6 shrink-0 items-center justify-center",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-6" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 4v16M4.93 7.76l14.14 8.48M4.93 16.24l14.14-8.48"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function HorizontalScrollWithContent({
  eyebrow,
  headingLine1,
  headingLine2,
  pills,
  verTodosHref,
  verTodosLabel = "Ver Todos",
  slides,
}: HorizontalScrollWithContentProps) {
  return (
    <div className="font-primary w-full px-4 py-12 md:px-16 md:py-14" data-node-id="40017244:13019">
      <div className="mx-auto flex w-full max-w-[1792px] flex-col gap-16 md:gap-28">
        <header className="flex flex-col gap-4">
          <div className="text-main-ciano-400 flex items-center gap-1 text-body font-medium leading-[var(--typography-line-height-i)] tracking-[var(--tracking-typography-0)]">
            <AsteriskMark />
            <span className="whitespace-nowrap uppercase">{eyebrow}</span>
          </div>
          <div className="flex flex-col gap-0">
            <p className="text-h4 text-main-cinza-700 font-semibold leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)]">
              {headingLine1}
            </p>
            <p className="text-h4 text-main-cinza-700 font-semibold leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)]">
              {headingLine2}
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              {pills.map((pill) => {
                const pillClass =
                  "bg-monochrome-light-100 text-extra text-main-ciano-500 font-primary inline-flex items-center rounded-[32px] px-2 py-1 font-medium leading-[var(--typography-line-height-j)] tracking-[var(--tracking-typography-0)]";
                return pill.href ? (
                  <a
                    key={pill.label}
                    href={pill.href}
                    className={cn(
                      pillClass,
                      "hover:opacity-90 focus-visible:ring-main-teal-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    )}
                  >
                    {pill.label}
                  </a>
                ) : (
                  <span key={pill.label} className={pillClass}>
                    {pill.label}
                  </span>
                );
              })}
            </div>
            {verTodosHref ? (
              <a
                href={verTodosHref}
                className="text-notes text-main-cinza-700 font-primary border-main-cinza-700 hover:bg-main-cinza-700 focus-visible:ring-main-teal-400 inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-[40px] border border-solid px-4 py-2 font-medium tracking-[var(--tracking-typography-0)] transition-colors hover:text-neutral-bw-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-bw-white focus-visible:outline-none sm:self-auto"
              >
                {verTodosLabel}
              </a>
            ) : null}
          </div>

          <Carousel
            opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }}
            className="w-full"
            aria-label="Destaques da visão geral"
          >
            <CarouselContent className="-ml-4 cursor-grab active:cursor-grabbing">
              {slides.map((slide, index) => (
                <CarouselItem
                  key={slide.id}
                  aria-label={`Diapositivo ${index + 1} de ${slides.length}: ${slide.caption}`}
                  className="max-w-[424px] shrink-0 grow-0 pl-4 basis-[min(424px,calc(100vw-3rem))] sm:basis-[424px]"
                >
                  <a
                    href={slide.href}
                    aria-label={`${slide.caption}: saber mais`}
                    className="group flex h-full min-h-0 cursor-pointer flex-col gap-2 no-underline outline-none focus-visible:ring-2 focus-visible:ring-main-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-bw-white"
                  >
                    <div className="relative aspect-[424/624] w-full overflow-hidden rounded-lg">
                      <img
                        src={slide.imageSrc}
                        alt={slide.imageAlt}
                        className="absolute inset-0 size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div
                        className="bg-main-cinza-700/40 pointer-events-none absolute inset-0 rounded-lg"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-notes text-main-cinza-700 font-medium leading-[var(--typography-line-height-i)] tracking-[var(--tracking-typography-0)]">
                      {slide.caption}
                    </p>
                  </a>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
