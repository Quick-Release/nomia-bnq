/**
 * Default “Barómetro” highlight cards (Figma 40017128:4198). Replace via CMS or props when wired.
 * `href` targets the Indicadores archive or a specific indicator URI.
 */
export const INDICADORES_ARCHIVE_PATH = "/indicadores/" as const;

export type BarometroResultCard = {
  year: string;
  value: string;
  unit: string;
  description: string;
  href: string;
  nodeId: string;
};

export const DEFAULT_BAROMETRO_RESULTS: readonly BarometroResultCard[] = [
  {
    year: "2024",
    value: "87,13",
    unit: "%",
    description: "Contribuição das energias renováveis para o consumo final de eletricidade (%)",
    href: INDICADORES_ARCHIVE_PATH,
    nodeId: "40017128:4207",
  },
  {
    year: "2024",
    value: "516",
    unit: "kg/ hab.",
    description: "Resíduos urbanos recolhidos por habitante (kg/ hab.)",
    href: INDICADORES_ARCHIVE_PATH,
    nodeId: "40017128:4215",
  },
  {
    year: "2025",
    value: "404",
    unit: "N.º",
    description: "Praias com bandeira azul (N.º)",
    href: INDICADORES_ARCHIVE_PATH,
    nodeId: "40017128:4223",
  },
] as const;
