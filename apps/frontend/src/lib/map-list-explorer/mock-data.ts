import type { NomiaMapListExplorerData } from "../../types/nomia-map-list-explorer";

export const MOCK_MAP_LIST_EXPLORER: NomiaMapListExplorerData = {
  regions: [
    { id: "norte", label: "Norte" },
    { id: "centro", label: "Centro" },
    { id: "lisboa", label: "Lisboa" },
    { id: "alentejo", label: "Alentejo" },
    { id: "algarve", label: "Algarve" },
    { id: "acores", label: "Açores" },
    { id: "madeira", label: "Madeira" },
  ],
  audiences: [
    { id: "empresas", label: "Empresas" },
    { id: "cidadaos", label: "Cidadãos" },
    { id: "investigacao", label: "Investigação" },
  ],
  items: [
    {
      id: "bp-1",
      title: "Boa Prática 1",
      excerpt:
        "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.",
      dateLabel: "28 Out, 2025",
      imageSrc: "/images/biblioteca/boas-praticas.jpg",
      imageAlt: "Colinas verdes ao amanhecer com árvores em destaque",
      href: "#boa-pratica-1",
      regionId: "alentejo",
      audienceIds: ["empresas", "cidadaos"],
    },
    {
      id: "bp-2",
      title: "Boa Prática 2",
      excerpt:
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.",
      dateLabel: "28 Out, 2025",
      imageSrc: "/images/home/bioeconomia-intro/hero.jpg",
      imageAlt: "Muda com terra nas mãos sobre fundo de floresta",
      href: "#boa-pratica-2",
      regionId: "alentejo",
      audienceIds: ["investigacao"],
    },
    {
      id: "bp-3",
      title: "Boa Prática 3",
      excerpt:
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.",
      dateLabel: "15 Set, 2025",
      imageSrc: "/images/economia-circular/overview-slider/concecao.jpg",
      imageAlt: "Materiais e conceção de produto sustentável",
      href: "#boa-pratica-3",
      regionId: "centro",
      audienceIds: ["empresas", "investigacao"],
    },
    {
      id: "bp-4",
      title: "Boa Prática 4",
      excerpt:
        "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem.",
      dateLabel: "3 Ago, 2025",
      imageSrc: "/images/hero-carousel/economia-circular.jpg",
      imageAlt: "Paisagem de montanhas e vale",
      href: "#boa-pratica-4",
      regionId: "norte",
      audienceIds: ["cidadaos"],
    },
    {
      id: "bp-5",
      title: "Boa Prática 5",
      excerpt:
        "Iniciativa de economia circular no litoral algarvio com envolvimento de municípios e empresas locais.",
      dateLabel: "21 Jul, 2025",
      imageSrc: "/images/biblioteca/publicacoes.jpg",
      imageAlt: "Publicações sobre sustentabilidade",
      href: "#boa-pratica-5",
      regionId: "algarve",
      audienceIds: ["empresas", "cidadaos"],
    },
    {
      id: "bp-6",
      title: "Boa Prática 6",
      excerpt:
        "Programa piloto de recolha seletiva e valorização de biorresíduos na região de Lisboa.",
      dateLabel: "10 Jun, 2025",
      imageSrc: "/images/home/indicators/taxa-circular.jpg",
      imageAlt: "Indicadores de taxa de circularidade",
      href: "#boa-pratica-6",
      regionId: "lisboa",
      audienceIds: ["investigacao", "empresas"],
    },
  ],
};
