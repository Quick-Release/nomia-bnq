import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "../../ui/chart";
import { ChartContainer } from "../../ui/chart";

/** An Indicador's chart (src/lib/indicador-chart.ts), drawn as the Produtividade de Recursos bars are. */
export type IndicadorChartRow = { category: string; value: number };

const chartConfig = {
  value: { label: "Valor", color: "var(--main-teal-400)" },
} satisfies ChartConfig;

const tick = { fill: "var(--main-cinza-400)", fontSize: 14, fontFamily: "var(--font-secondary)" };

function formatValue(n: number) {
  return n.toLocaleString("pt-PT", { maximumFractionDigits: 2 });
}

function IndicadorTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  if (v == null || typeof v !== "number") return null;
  return (
    <div className="border-main-teal-400 bg-main-teal-400 text-notes font-secondary flex items-center justify-center rounded-lg border px-2 py-1 text-neutral-bw-white shadow-xl">
      <span className="font-normal tabular-nums">
        {formatValue(v)}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

export default function NomiaIndicadorChart({
  rows,
  orientation,
  unit = "",
}: {
  rows: IndicadorChartRow[];
  orientation: "vertical" | "horizontal";
  unit?: string;
}) {
  const horizontal = orientation === "horizontal";
  // A row per category: horizontal bars grow with their rows, columns keep the reference height.
  const height = horizontal ? Math.max(160, rows.length * 48 + 48) : 360;
  const valueAxis = {
    type: "number" as const,
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
    tick,
    tickFormatter: (n: unknown) => (typeof n === "number" ? formatValue(n) : String(n)),
  };
  const categoryAxis = {
    type: "category" as const,
    dataKey: "category",
    tickLine: false,
    axisLine: false,
    interval: 0 as const,
    tickMargin: 8,
    tick,
  };

  return (
    <ChartContainer
      config={chartConfig}
      initialDimension={{ width: 1200, height }}
      className="w-full max-w-[1488px] justify-center"
      style={{ height }}
    >
      <BarChart
        data={rows}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ left: 4, right: 24, top: 16, bottom: 8 }}
        barCategoryGap="28%"
      >
        <CartesianGrid
          vertical={horizontal}
          horizontal={!horizontal}
          className="stroke-main-cinza-100"
        />
        {horizontal ? (
          <>
            <XAxis {...valueAxis} />
            <YAxis {...categoryAxis} width={56} />
          </>
        ) : (
          <>
            <XAxis {...categoryAxis} />
            <YAxis {...valueAxis} width={56} />
          </>
        )}
        <Tooltip
          cursor={{ fill: "var(--main-cinza-100)", opacity: 0.35 }}
          content={<IndicadorTooltip unit={unit} />}
        />
        <Bar
          dataKey="value"
          name="value"
          fill="var(--main-teal-400)"
          maxBarSize={16}
          radius={[32, 32, 32, 32]}
          isAnimationActive={false}
          activeBar={{ fill: "var(--main-cinza-400)" }}
        />
      </BarChart>
    </ChartContainer>
  );
}
