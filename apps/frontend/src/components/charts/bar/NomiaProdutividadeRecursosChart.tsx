import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "../../ui/chart";
import { ChartContainer } from "../../ui/chart";

export type ResourceProductivityBarsPoint = { year: number; label?: string; value: number };
type YearPoint = { year: number; label: string; value: number };

/** 1995–2024, milhões €/t (ilustrativo). 2016 = 1,32 como no Figma. */
const PRODUCTIVITY_DATA: YearPoint[] = (() => {
  const rows: YearPoint[] = [];
  for (let i = 0; i <= 29; i++) {
    const year = 1995 + i;
    let value = 0.72 + 0.42 * Math.sin(i / 4.2) + i * 0.014 + (i % 7) * 0.015;
    if (year === 2016) value = 1.32;
    value = Math.min(1.95, Math.max(0.38, Math.round(value * 100) / 100));
    rows.push({ year, label: String(year), value });
  }
  return rows;
})();

const chartConfig = {
  value: {
    label: "Produtividade",
    color: "var(--main-teal-400)",
  },
} satisfies ChartConfig;

const DEFAULT_TITLE = "Produtividade de Recursos";
const DEFAULT_BADGE = "1995–2024";
const DEFAULT_INTRO =
  "Evolução ilustrativa da produtividade dos recursos (PIB em relação ao consumo de materiais), em milhões de euros por tonelada. Valores fictícios para demonstração do gráfico.";

function formatPtDecimal(n: number) {
  return n.toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function ProdutividadeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value?: number }[];
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  if (v == null || typeof v !== "number") return null;

  return (
    <div
      className="border-main-teal-400 bg-main-teal-400 text-notes font-secondary flex items-center justify-center rounded-lg border px-2 py-1 text-neutral-bw-white shadow-xl"
      data-node-id="40017188:10681"
    >
      <span className="font-normal tabular-nums" data-node-id="40017188:10682">
        {formatPtDecimal(v)}
      </span>
    </div>
  );
}

export default function NomiaProdutividadeRecursosChart({
  title = DEFAULT_TITLE,
  badge = DEFAULT_BADGE,
  intro = DEFAULT_INTRO,
  points,
  yMax = 2,
  metricLabel = "Milhões €/t",
  periodLabel = "Anual",
  scopeLabel = "Portugal",
}: {
  title?: string;
  badge?: string;
  intro?: string;
  points?: ResourceProductivityBarsPoint[];
  yMax?: number;
  metricLabel?: string;
  periodLabel?: string;
  scopeLabel?: string;
}) {
  const rows = points?.length
    ? points.map((point) => ({ ...point, label: point.label || String(point.year) }))
    : PRODUCTIVITY_DATA;
  return (
    <section
      className="bg-neutral-bw-white w-full overflow-x-hidden"
      aria-labelledby="produtividade-recursos-heading"
      data-node-id="40017233:8765"
      data-nomia-header-surface="light"
    >
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-10 px-4 py-16 md:px-16 md:py-20">
        <header className="flex max-w-[1488px] flex-col gap-4" data-node-id="40017188:10582">
          <div
            className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            data-node-id="40017188:10583"
          >
            <h2
              id="produtividade-recursos-heading"
              className="text-h4 text-main-teal-400 font-primary font-medium leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)]"
              data-node-id="40017188:10584"
            >
              {title}
            </h2>
            <span
              className="text-body-large text-main-cinza-700 font-additional w-fit rounded-[24px] bg-main-teal-200 px-4 py-1 font-medium leading-[var(--typography-line-height-h)] tracking-[var(--tracking-typography-0)]"
              data-node-id="40017188:10585"
            >
              {badge}
            </span>
          </div>
          <p
            className="text-body text-main-cinza-400 font-secondary max-w-[1488px] font-normal leading-[var(--typography-line-height-i)] tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10587"
          >
            {intro}
          </p>
        </header>

        <div className="flex max-w-[1488px] flex-col gap-6" data-node-id="40017188:10588">
          <div
            className="text-body text-main-cinza-400 font-secondary flex flex-wrap items-center gap-2 font-normal tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10589"
          >
            <span data-node-id="40017188:10590">Ano vs Produtividade de Recursos</span>
            <span
              className="text-extra text-main-cinza-700 font-additional rounded-[24px] bg-main-cinza-200 px-4 py-1 font-normal leading-[var(--typography-line-height-j)]"
              data-node-id="40017188:10591"
            >
              {metricLabel}
            </span>
            <span
              className="text-extra text-main-cinza-700 font-additional rounded-[24px] bg-main-cinza-200 px-4 py-1 font-normal leading-[var(--typography-line-height-j)]"
              data-node-id="40017188:10593"
            >
              {periodLabel}
            </span>
            <span
              className="text-extra text-main-cinza-700 font-additional rounded-[24px] bg-main-cinza-200 px-4 py-1 font-normal leading-[var(--typography-line-height-j)]"
              data-node-id="40017188:10595"
            >
              {scopeLabel}
            </span>
          </div>

          <div className="w-full min-w-0 overflow-x-auto" data-node-id="40017188:10597">
            <ChartContainer
              config={chartConfig}
              initialDimension={{ width: 1200, height: 360 }}
              className="h-[min(48vw,380px)] min-w-[min(100%,900px)] w-full max-w-[1488px] justify-center [--color-value:var(--main-cinza-200)]"
            >
              <BarChart
                data={rows}
                margin={{ left: 4, right: 12, top: 28, bottom: 52 }}
                barCategoryGap="28%"
              >
                <CartesianGrid vertical={false} className="stroke-main-cinza-100" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-75}
                  textAnchor="end"
                  height={72}
                  tickMargin={4}
                  tick={{
                    fill: "var(--main-cinza-400)",
                    fontSize: 12,
                    fontFamily: "var(--font-secondary)",
                  }}
                />
                <YAxis
                  type="number"
                  domain={[0, yMax]}
                  ticks={Array.from({ length: 5 }, (_, index) => (yMax / 4) * index)}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickMargin={8}
                  tickFormatter={(n) => {
                    if (typeof n !== "number") return String(n);
                    if (n === 0) return "0";
                    if (Number.isInteger(n))
                      return n.toLocaleString("pt-PT", { maximumFractionDigits: 0 });
                    return n.toLocaleString("pt-PT", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    });
                  }}
                  tick={{
                    fill: "var(--main-cinza-400)",
                    fontSize: 14,
                    fontFamily: "var(--font-secondary)",
                  }}
                />
                <Tooltip
                  cursor={{ fill: "var(--main-cinza-100)", opacity: 0.35 }}
                  content={<ProdutividadeTooltip />}
                />
                <Bar
                  dataKey="value"
                  name="value"
                  fill="var(--main-cinza-200)"
                  maxBarSize={16}
                  radius={[32, 32, 32, 32]}
                  isAnimationActive={false}
                  activeBar={{ fill: "var(--main-cinza-400)" }}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
