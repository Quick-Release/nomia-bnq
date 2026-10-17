import * as React from "react";
import { Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../ui/chart";
import {
  PIE_CHART_DONUT_COMPONENT_ID,
  PIE_CHART_DONUT_COMPONENT_VERSION,
} from "./PieChartDonutMeta";

export type PieChartDonutSlice = {
  type: string;
  label: string;
  value: number;
  fill?: string;
};

const DEFAULT_CHART_DATA: PieChartDonutSlice[] = [
  { type: "vidro", label: "Vidro", value: 30, fill: "var(--main-cinza-200)" },
  { type: "metal", label: "Metal", value: 25, fill: "var(--main-cinza-300)" },
  { type: "papel", label: "Papel", value: 28, fill: "var(--main-cinza-400)" },
  { type: "plastico", label: "Plástico", value: 17, fill: "var(--main-cinza-500)" },
];

const DEFAULT_TITLE = "Reciclagem de Resíduos";
const DEFAULT_DESCRIPTION =
  "Comparação da percentagem de resíduos reciclados por tipo de material (plástico, papel, vidro, metal).";
const DEFAULT_SUMMARY =
  "O vidro e o metal mantêm taxas de reciclagem urbanas elevadas. O papel e o plástico concentram oportunidades de melhoria na recolha seletiva e na qualidade das frações enviadas para valorização. Dados ilustrativos para demonstração do gráfico interativo.";

const FALLBACK_FILLS = [
  "var(--main-cinza-200)",
  "var(--main-cinza-300)",
  "var(--main-cinza-400)",
  "var(--main-cinza-500)",
  "var(--main-teal-400)",
  "var(--main-ciano-400)",
];

function keyFor(value: string, index: number) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `slice-${index + 1}`;
}

export default function PieChartDonutChart({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  summary = DEFAULT_SUMMARY,
  slices,
}: {
  title?: string;
  description?: string;
  summary?: string;
  slices?: PieChartDonutSlice[];
}) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const rows = slices?.length ? slices : DEFAULT_CHART_DATA;
  const normalizedRows = React.useMemo(
    () =>
      rows.map((entry, index) => ({
        ...entry,
        type: keyFor(entry.type || entry.label, index),
        label: entry.label || entry.type || `Categoria ${index + 1}`,
        fill: entry.fill || FALLBACK_FILLS[index % FALLBACK_FILLS.length],
      })),
    [rows],
  );

  const chartConfig = React.useMemo(
    () =>
      Object.fromEntries(
        normalizedRows.map((entry) => [entry.type, { label: entry.label, color: entry.fill }]),
      ) as ChartConfig,
    [normalizedRows],
  );

  const pieData = React.useMemo(
    () =>
      normalizedRows.map((entry, index) => ({
        ...entry,
        fillOpacity: hovered === null || hovered === index ? 1 : 0.35,
      })),
    [hovered, normalizedRows],
  );

  return (
    <section
      className="bg-neutral-bw-white w-full overflow-x-hidden"
      aria-labelledby="pie-chart-donut-heading"
      data-node-id="40017188:10499"
      data-nomia-header-surface="light"
      data-nomia-component-id={PIE_CHART_DONUT_COMPONENT_ID}
      data-nomia-component-version={PIE_CHART_DONUT_COMPONENT_VERSION}
    >
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-12 px-4 py-16 md:px-16 md:py-20">
        <header className="flex max-w-[960px] flex-col gap-4" data-node-id="40017188:10500">
          <h2
            id="pie-chart-donut-heading"
            className="text-h4 text-main-teal-400 font-primary font-medium leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10501"
          >
            {title}
          </h2>
          <p
            className="text-body-large text-main-cinza-700 font-primary font-normal leading-[var(--typography-line-height-h)] tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10502"
          >
            {description}
          </p>
        </header>

        <div
          className="flex w-full flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-8"
          data-node-id="40017188:10503"
        >
          <div
            className="flex flex-col items-center justify-center gap-10 lg:flex-row lg:gap-[85px]"
            data-node-id="40017188:10504"
          >
            <ChartContainer
              config={chartConfig}
              initialDimension={{ width: 448, height: 448 }}
              className="aspect-square mx-auto h-[min(90vw,448px)] w-[min(90vw,448px)] max-w-[448px] justify-center"
              data-node-id="40017188:10505"
            >
              <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      nameKey="type"
                      hideIndicator={false}
                      formatter={(value) => (
                        <span className="text-main-cinza-700 font-medium tabular-nums">
                          {Number(value)}%
                        </span>
                      )}
                    />
                  }
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="type"
                  innerRadius="52%"
                  outerRadius="88%"
                  paddingAngle={2}
                  stroke="var(--neutral-bw-white)"
                  strokeWidth={3}
                  onMouseEnter={(_, i) => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              </PieChart>
            </ChartContainer>

            <div
              className="font-secondary flex w-full max-w-[200px] flex-col gap-4 lg:w-[92px] lg:max-w-none lg:shrink-0"
              data-node-id="40017188:10531"
            >
              {normalizedRows.map((row) => (
                <div
                  key={row.type}
                  className="text-body font-secondary flex w-full items-center justify-center rounded-[24px] px-4 py-1 font-normal leading-[var(--typography-line-height-i)] tracking-[var(--tracking-typography-0)]"
                  style={{
                    backgroundColor: row.fill,
                    color:
                      row.fill?.includes("cinza-2") || row.fill?.includes("cinza-3")
                        ? "var(--main-cinza-700)"
                        : "var(--neutral-bw-white)",
                  }}
                >
                  {row.label}
                </div>
              ))}
            </div>
          </div>

          <div
            className="text-main-cinza-700 font-primary flex min-w-0 flex-1 flex-col gap-4 tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10540"
          >
            <p
              className="text-body-large font-medium leading-[var(--typography-line-height-h)]"
              data-node-id="40017188:10541"
            >
              Resumo
            </p>
            <p
              className="text-body font-secondary font-normal leading-[var(--typography-line-height-i)]"
              data-node-id="40017188:10542"
            >
              {summary}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
