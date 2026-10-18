import * as React from "react";
import { Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../ui/chart";
import { GRAFICO_DONUT_COMPONENT_ID, GRAFICO_DONUT_COMPONENT_VERSION } from "./GraficoDonutMeta";
import type { PieChartDonutSlice } from "./PieChartDonutChart";

const DEFAULT_CHART_DATA: PieChartDonutSlice[] = [
  { type: "vidro", label: "Vidro", value: 30, fill: "var(--main-cinza-200)" },
  { type: "metal", label: "Metal", value: 25, fill: "var(--main-cinza-300)" },
  { type: "papel", label: "Papel", value: 28, fill: "var(--main-cinza-400)" },
  { type: "plastico", label: "Plástico", value: 17, fill: "var(--main-cinza-500)" },
];

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

export default function GraficoDonut({ slices }: { slices?: PieChartDonutSlice[] }) {
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
    <div
      className="flex w-full flex-col items-center justify-center gap-10 overflow-x-hidden py-8 lg:flex-row lg:gap-[85px]"
      data-nomia-component-id={GRAFICO_DONUT_COMPONENT_ID}
      data-nomia-component-version={GRAFICO_DONUT_COMPONENT_VERSION}
      role="img"
      aria-label="Gráfico circular"
    >
      <ChartContainer
        config={chartConfig}
        initialDimension={{ width: 448, height: 448 }}
        className="aspect-square mx-auto h-[min(90vw,448px)] w-[min(90vw,448px)] max-w-[448px] justify-center"
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

      <div className="font-secondary flex w-full max-w-[200px] flex-col gap-4 lg:w-[92px] lg:max-w-none lg:shrink-0">
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
  );
}
