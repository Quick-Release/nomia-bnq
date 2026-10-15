import type { PageHeroSlide } from "./pageHeroShared";

/** Labels for the “next” control: entry `i` is shown while slide `i` is active. */
export const NEXT_STEP_LABELS = ["02 Barómetro", "01 Economia Circular"] as const;

export const PAGE_HERO_SLIDES: readonly PageHeroSlide[] = [
  {
    id: "economia-circular",
    title: "Economia Circular",
    subtitle:
      "Um modelo económico reorganizado focado na coordenação dos sistemas de produção e consumo em circuitos fechados.",
    cta: { label: "Portal ECO.NOMIA", href: "https://eco.nomia.pt" },
    bgImage: "/images/hero-carousel/economia-circular.jpg",
    spotlight: {
      imageSrc: "/images/hero-carousel/spotlight-bike.jpg",
      title: "Design, Eco-concepção",
      body: 'Design/redesign "circular" de produtos e processos: processos e produtos menos intensivos em recursos.',
      href: "/biblioteca/",
    },
  },
  {
    id: "barometro",
    title: "Barómetro",
    subtitle:
      "Indicadores e estatísticas ambientais para acompanhar a transição rumo a uma economia mais circular e regenerativa.",
    cta: { label: "Explorar indicadores", href: "/indicadores/" },
    bgImage: "/images/hero-carousel/barometro.jpg",
  },
];
