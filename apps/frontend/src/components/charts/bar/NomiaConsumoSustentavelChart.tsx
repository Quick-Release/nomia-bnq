import type { BarShapeProps } from "recharts";
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";

import type { VerticalBarDatum } from "../../../lib/gravity-forms/aggregate-first-checkbox-bars";
import type { ChartConfig } from "../../ui/chart";
import { ChartContainer } from "../../ui/chart";
import { cn } from "../../../lib/utils";

const DEFAULT_BARS: VerticalBarDatum[] = [
  { band: "18-25", label: "18-25 anos", pct: 20, fill: "var(--main-cinza-200)" },
  { band: "26-40", label: "26-40 anos", pct: 40, fill: "var(--main-cinza-300)" },
  { band: "41-60", label: "41-60 anos", pct: 27, fill: "var(--main-cinza-400)" },
  { band: "60plus", label: "+60 anos", pct: 13, fill: "var(--main-cinza-500)" },
];

const chartConfig = {
  pct: {
    label: "Participação",
    color: "var(--main-teal-400)",
  },
} satisfies ChartConfig;

const DEFAULT_SUMMARY_PT =
  "A faixa etária intermédia concentra maior adesão aos programas de reciclagem; grupos mais jovens e seniores apresentam padrões distintos de envolvimento. Valores ilustrativos para demonstração do gráfico.";

export type { VerticalBarDatum };

type Props = {
  bars?: readonly VerticalBarDatum[] | undefined;
  title?: string;
  subtitle?: string;
  summary?: string;
  /** Defaults to `sustentavel-heading` for the static /graphs demo. */
  headingId?: string;
  /** When set, the outer `<section>` receives this id (stable anchor, e.g. `sustainable-consumption-bars`). */
  sectionId?: string;
};

function SustentavelBarShape(props: BarShapeProps) {
  const { x, y, width, height, payload } = props;
  const fill = (payload as VerticalBarDatum | undefined)?.fill ?? "var(--main-cinza-300)";
  return <rect x={x} y={y} width={width} height={height} fill={fill} rx={32} ry={32} />;
}

function SustentavelTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value?: number; payload?: VerticalBarDatum }[];
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  if (v == null) return null;

  return (
    <div
      className="border-main-teal-400 bg-main-teal-400 text-notes font-secondary flex items-center justify-center rounded-lg border px-2 py-1 text-neutral-bw-white shadow-xl"
      data-node-id="40017188:10558"
    >
      <span className="font-normal tabular-nums">{v}%</span>
    </div>
  );
}

export default function NomiaConsumoSustentavelChart({
  bars: barsProp,
  title,
  subtitle,
  summary,
  headingId = "sustentavel-heading",
  sectionId,
}: Props) {
  const explicitEmpty = Array.isArray(barsProp) && barsProp.length === 0;
  const bars = barsProp?.length ? [...barsProp] : explicitEmpty ? [] : DEFAULT_BARS;
  const displayTitle = title ?? "Consumo Sustentável";
  const displaySubtitle =
    subtitle ?? "Comparação da faixa etária das pessoas que participam em programas de reciclagem.";
  const displaySummary = summary ?? DEFAULT_SUMMARY_PT;

  return (
    <section
      id={sectionId}
      className={cn(
        "bg-neutral-bw-white w-full overflow-x-hidden",
        sectionId && "scroll-mt-[calc(var(--nomia-header-clearance)+0.75rem)]",
      )}
      aria-labelledby={headingId}
      data-node-id="40017188:10543"
      data-nomia-header-surface="light"
    >
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-12 px-4 py-16 md:px-16 md:py-20">
        <header className="flex max-w-[960px] flex-col gap-4" data-node-id="40017188:10544">
          <h2
            id={headingId}
            className="text-h4 text-main-teal-400 font-primary font-medium leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10545"
          >
            {displayTitle}
          </h2>
          <p
            className="text-body-large text-main-cinza-700 font-primary font-normal leading-[var(--typography-line-height-h)] tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10546"
          >
            {displaySubtitle}
          </p>
        </header>

        <div
          className="flex w-full flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-8"
          data-node-id="40017188:10547"
        >
          <div
            className="flex w-full max-w-[880px] flex-col items-center justify-center px-0 md:px-6"
            data-node-id="40017188:10548"
          >
            {bars.length === 0 ? (
              <p
                className="text-main-cinza-500 text-body max-w-md text-center leading-relaxed"
                data-node-id="40017188:10549"
              >
                Sem dados para o gráfico. Consulte o resumo ao lado.
              </p>
            ) : (
              <ChartContainer
                config={chartConfig}
                initialDimension={{ width: 560, height: 320 }}
                className="aspect-[560/320] mx-auto h-[min(52vw,320px)] w-full max-w-[560px] justify-center"
                data-node-id="40017188:10549"
              >
                <BarChart
                  data={bars}
                  margin={{ left: 8, right: 8, top: 40, bottom: 8 }}
                  barCategoryGap="18%"
                >
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    tick={{
                      fill: "var(--main-cinza-400)",
                      fontSize: 14,
                      fontFamily: "var(--font-secondary)",
                    }}
                  />
                  <YAxis type="number" domain={[0, 100]} hide />
                  <Tooltip
                    cursor={{ fill: "var(--main-cinza-100)", opacity: 0.35 }}
                    content={<SustentavelTooltip />}
                  />
                  <Bar
                    dataKey="pct"
                    name="pct"
                    maxBarSize={64}
                    isAnimationActive={false}
                    shape={SustentavelBarShape}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </div>

          <div
            className="text-main-cinza-700 flex min-w-0 flex-1 flex-col gap-4 tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10574"
          >
            <p
              className="text-body-large font-primary font-medium leading-[var(--typography-line-height-h)]"
              data-node-id="40017188:10575"
            >
              Resumo
            </p>
            <p
              className="text-body font-secondary font-normal leading-[var(--typography-line-height-i)]"
              data-node-id="40017188:10576"
            >
              {displaySummary}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
