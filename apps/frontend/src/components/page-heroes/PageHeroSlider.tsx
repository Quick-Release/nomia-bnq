import * as React from "react";

import { cn } from "../../lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  useCarousel,
} from "../ui/carousel";
import { PAGE_HERO_SLIDES, NEXT_STEP_LABELS } from "./pageHeroSliderData";
import { externalLinkAttrs, pageHeroClasses } from "./pageHeroShared";
import type { PageHeroSlide, PageHeroSpotlight } from "./pageHeroShared";

function HeroNextNav() {
  const { api, scrollNext, canScrollNext, isHydrated } = useCarousel();
  const [snap, setSnap] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const sync = () => setSnap(api.selectedScrollSnap());
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  const label = NEXT_STEP_LABELS[snap] ?? NEXT_STEP_LABELS[0];
  const nextLabel = canScrollNext ? `Diapositivo seguinte: ${label}` : "Não há mais diapositivos";

  return (
    <button
      type="button"
      onClick={scrollNext}
      disabled={isHydrated ? !canScrollNext : false}
      aria-label={nextLabel}
      className={cn(
        "text-body font-primary absolute top-[56%] right-4 z-20 flex -translate-y-1/2 items-center gap-4 font-medium text-main-cinza-100 transition-opacity outline-none",
        "hover:opacity-90 focus-visible:ring-2 focus-visible:ring-main-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "disabled:pointer-events-none disabled:opacity-40 md:right-[max(4rem,calc((100%-1920px)/2+4rem))]",
      )}
      data-node-id="40017128:4168"
    >
      <span className="whitespace-nowrap" data-node-id="40017128:4169">
        {label}
      </span>
      <span className="relative size-10 shrink-0 overflow-hidden" data-node-id="40017128:4170">
        <svg
          className="size-10 text-main-cinza-100"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="sr-only">{nextLabel}</span>
    </button>
  );
}

function SpotlightCard({ spotlight }: { spotlight: PageHeroSpotlight }) {
  return (
    <div
      className="absolute right-4 bottom-8 z-20 flex max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg shadow-lg md:right-16 md:bottom-12"
      data-node-id="40017128:4171"
    >
      <div className="relative size-[216px] shrink-0" data-node-id="40017128:4172">
        <img
          src={spotlight.imageSrc}
          alt=""
          className="absolute inset-0 size-full object-cover"
          width={216}
          height={216}
        />
      </div>
      <div
        className="bg-main-teal-400 relative flex min-h-[216px] w-[min(360px,calc(100vw-216px-2rem))] flex-col gap-2 p-6"
        data-node-id="40017128:4173"
      >
        <p
          className="text-subtitle font-primary font-semibold leading-[var(--typography-line-height-g)] tracking-[var(--tracking-typography-0)] text-main-cinza-100"
          data-node-id="40017128:4174"
        >
          {spotlight.title}
        </p>
        <p
          className="text-notes font-primary font-medium leading-[var(--typography-line-height-i)] tracking-[var(--tracking-typography-0)] text-main-cinza-100"
          data-node-id="40017128:4175"
        >
          {spotlight.body}
        </p>
        <a
          href={spotlight.href}
          className="border-main-cinza-100 text-main-cinza-100 focus-visible:ring-main-teal-400 absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-[40px] border border-solid transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          data-node-id="40017128:4176"
          aria-label={`Saber mais: ${spotlight.title}`}
        >
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

type Props = {
  slides?: readonly PageHeroSlide[];
};

export default function PageHeroSlider({ slides = PAGE_HERO_SLIDES }: Props) {
  const heroSlides = slides.length > 0 ? slides : PAGE_HERO_SLIDES;

  return (
    <section className={pageHeroClasses.section} data-node-id="40017228:8763">
      <Carousel
        opts={{ loop: true, align: "start" }}
        className="w-full"
        aria-label="Destaques da página inicial"
      >
        <CarouselContent className="-ml-0">
          {heroSlides.map((slide, index) => (
            <CarouselItem
              key={slide.id}
              className="pl-0"
              aria-label={`Diapositivo ${index + 1} de ${heroSlides.length}: ${slide.title}`}
            >
              <div className={pageHeroClasses.viewport} data-node-id="40017128:4159">
                <div className={pageHeroClasses.mediaLayer} aria-hidden="true">
                  <img
                    src={slide.bgImage}
                    alt=""
                    className={pageHeroClasses.image}
                    loading={slide.id === "economia-circular" ? "eager" : "lazy"}
                  />
                  <div className={pageHeroClasses.overlay} />
                </div>

                <div
                  className={pageHeroClasses.content}
                  style={pageHeroClasses.contentStyle}
                  data-node-id="40017128:4160"
                >
                  <div className={pageHeroClasses.copyStack}>
                    <p className={`text-h2 ${pageHeroClasses.title}`} data-node-id="40017128:4161">
                      {slide.title}
                    </p>
                    <p
                      className={`text-subtitle ${pageHeroClasses.subtitle}`}
                      data-node-id="40017128:4162"
                    >
                      {slide.subtitle}
                    </p>
                    <a
                      href={slide.cta.href}
                      {...externalLinkAttrs(slide.cta.href)}
                      className={pageHeroClasses.cta}
                      data-node-id="40017128:4163"
                    >
                      {slide.cta.label}
                    </a>
                  </div>

                  {slide.spotlight ? <SpotlightCard spotlight={slide.spotlight} /> : null}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious
          className="top-[56%] left-4 z-20 -translate-y-1/2 md:left-[max(4rem,calc((100%-1920px)/2+4rem))]"
          data-node-id="40017128:4167"
        >
          <span className="sr-only">Diapositivo anterior</span>
          <svg
            className="size-10 text-main-cinza-100"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CarouselPrevious>

        <HeroNextNav />
      </Carousel>
    </section>
  );
}
