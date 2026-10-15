import * as React from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "../../ui/chart";
import { ChartContainer } from "../../ui/chart";
import { cn } from "../../../lib/utils";

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Maio",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

/** Fake kWh / month — Abr includes ~245 kWh solar (Figma tooltip). */
const ENERGY_DATA = MONTHS.map((month, i) => {
  const solar =
    month === "Abr" ? 245 : 110 + Math.round(35 * Math.sin((i + 1) / 2.2)) + Math.min(i, 8) * 6;
  const eletrica = 185 - i * 2 + (i % 3) * 14;
  const gas = 78 + (i % 6) * 11 + Math.round(8 * Math.cos(i / 2));
  return { month, solar, eletrica, gas };
});

const chartConfig = {
  solar: {
    label: "Solar",
    color: "var(--main-cinza-500)",
  },
  eletrica: {
    label: "Elétrica",
    color: "var(--main-cinza-400)",
  },
  gas: {
    label: "Gás Natural",
    color: "var(--main-cinza-700)",
  },
} satisfies ChartConfig;

type SeriesKey = keyof typeof chartConfig;
export type EnergyConsumptionDatum = {
  month: string;
  solar: number;
  eletrica: number;
  gas: number;
};

const DEFAULT_TITLE = "Consumo de Energia por Tipo de Casa";
const DEFAULT_DESCRIPTION =
  "Comparação de casas com diferentes fontes de energia (solar, elétrica, gás) ou consumo médio por residência.";
const DEFAULT_SUMMARY =
  "Perfil ilustrativo: produção solar segue a estação e a orientação da instalação; a eletricidade reflete hábitos de ocupação; o gás natural permanece como energia de apoio. Estes valores são fictícios para demonstração do gráfico interactivo.";

type EnergyTooltipRow = {
  dataKey?: string | number;
  value?: number | string;
  name?: string | number;
};

function EnergyTooltipContent({
  active,
  payload,
  label,
  visible,
}: {
  active?: boolean;
  payload?: readonly EnergyTooltipRow[];
  label?: string;
  visible: Record<SeriesKey, boolean>;
}) {
  if (!active || !payload?.length) return null;

  const rows = payload.filter((p) => {
    const k = String(p.dataKey ?? "") as SeriesKey;
    return k in chartConfig && visible[k];
  });
  if (!rows.length) return null;

  return (
    <div
      className="border-main-teal-400 bg-main-teal-400 text-notes font-secondary grid min-w-[8rem] gap-1 rounded-lg border px-2.5 py-1.5 text-neutral-bw-white shadow-xl"
      data-node-id="40017188:10491"
    >
      {label ? <p className="text-extra text-neutral-bw-white/90 font-medium">{label}</p> : null}
      {rows.map((item) => {
        const key = String(item.dataKey ?? "") as SeriesKey;
        const cfg = chartConfig[key];
        const v = item.value;
        return (
          <div key={key} className="flex flex-wrap items-center gap-2 leading-none">
            <span className="font-semibold">{cfg?.label ?? key}</span>
            <span className="font-normal tabular-nums">
              {typeof v === "number" ? `${v} kWh` : v}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function NomiaConsumoEnergiaChart({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  summary = DEFAULT_SUMMARY,
  data,
  yMax = 300,
}: {
  title?: string;
  description?: string;
  summary?: string;
  data?: EnergyConsumptionDatum[];
  yMax?: number;
}) {
  const rows = data?.length ? data : ENERGY_DATA;
  const [visible, setVisible] = React.useState<Record<SeriesKey, boolean>>({
    solar: true,
    eletrica: true,
    gas: true,
  });

  const toggleSeries = (key: SeriesKey) => {
    setVisible((v) => ({ ...v, [key]: !v[key] }));
  };

  return (
    <section
      className="bg-neutral-bw-white w-full overflow-x-hidden"
      aria-labelledby="energia-heading"
      data-node-id="40017188:10453"
      data-nomia-header-surface="light"
    >
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-12 px-4 py-16 md:px-16 md:py-20">
        <header className="flex max-w-[960px] flex-col gap-4" data-node-id="40017188:10454">
          <h2
            id="energia-heading"
            className="text-h4 text-main-teal-400 font-primary font-medium leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10455"
          >
            {title}
          </h2>
          <p
            className="text-body-large text-main-cinza-700 font-primary font-normal leading-[var(--typography-line-height-h)] tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10456"
          >
            {description}
          </p>
        </header>

        <div
          className="flex w-full flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-8"
          data-node-id="40017188:10457"
        >
          <div
            className="flex w-full max-w-[880px] flex-col items-center justify-center gap-6 px-0 md:px-6"
            data-node-id="40017188:10458"
          >
            <div
              className="flex w-full flex-wrap items-center justify-end gap-2"
              data-node-id="40017188:10480"
            >
              {(Object.keys(chartConfig) as SeriesKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSeries(key)}
                  className={cn(
                    "text-body font-secondary rounded-[24px] px-4 py-1 font-normal leading-[var(--typography-line-height-i)] tracking-[var(--tracking-typography-0)] transition-opacity",
                    key === "solar" && "bg-main-cinza-200 text-main-cinza-700",
                    key === "eletrica" && "bg-main-cinza-300 text-main-cinza-700",
                    key === "gas" && "bg-main-cinza-400 text-neutral-bw-white",
                    !visible[key] && "opacity-35",
                  )}
                  aria-pressed={visible[key]}
                  data-node-id={
                    key === "solar"
                      ? "40017188:10481"
                      : key === "eletrica"
                        ? "40017188:10483"
                        : "40017188:10485"
                  }
                >
                  {chartConfig[key].label}
                </button>
              ))}
            </div>

            <ChartContainer
              config={chartConfig}
              initialDimension={{ width: 711, height: 280 }}
              className="aspect-[711/280] h-[min(52vw,320px)] w-full max-w-[711px] justify-center [--color-solar:var(--main-cinza-500)] [--color-eletrica:var(--main-cinza-400)] [--color-gas:var(--main-cinza-700)]"
              data-node-id="40017188:10459"
            >
              <LineChart data={rows} margin={{ left: 4, right: 12, top: 12, bottom: 4 }}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  className="stroke-main-cinza-200"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{
                    fill: "var(--main-cinza-400)",
                    fontSize: 14,
                    fontFamily: "var(--font-secondary)",
                  }}
                />
                <YAxis
                  domain={[0, yMax]}
                  ticks={Array.from({ length: 6 }, (_, index) =>
                    Math.round((yMax / 6) * (index + 1)),
                  )}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickMargin={8}
                  tick={{
                    fill: "var(--main-cinza-400)",
                    fontSize: 14,
                    fontFamily: "var(--font-secondary)",
                  }}
                />
                <Tooltip
                  cursor={{ stroke: "var(--main-cinza-300)", strokeWidth: 1 }}
                  content={(props) => (
                    <EnergyTooltipContent
                      active={props.active}
                      label={typeof props.label === "string" ? props.label : undefined}
                      payload={props.payload as readonly EnergyTooltipRow[] | undefined}
                      visible={visible}
                    />
                  )}
                />
                {visible.solar ? (
                  <Line
                    type="monotone"
                    dataKey="solar"
                    name="solar"
                    stroke="var(--color-solar)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "var(--color-solar)",
                      stroke: "var(--neutral-bw-white)",
                      strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                  />
                ) : null}
                {visible.eletrica ? (
                  <Line
                    type="monotone"
                    dataKey="eletrica"
                    name="eletrica"
                    stroke="var(--color-eletrica)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "var(--color-eletrica)",
                      stroke: "var(--neutral-bw-white)",
                      strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                  />
                ) : null}
                {visible.gas ? (
                  <Line
                    type="monotone"
                    dataKey="gas"
                    name="gas"
                    stroke="var(--color-gas)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "var(--color-gas)",
                      stroke: "var(--neutral-bw-white)",
                      strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                  />
                ) : null}
              </LineChart>
            </ChartContainer>
          </div>

          <div
            className="text-main-cinza-700 flex min-w-0 flex-1 flex-col gap-4 tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10496"
          >
            <p
              className="text-body-large font-primary font-medium leading-[var(--typography-line-height-h)]"
              data-node-id="40017188:10497"
            >
              Resumo
            </p>
            <p
              className="text-body font-additional font-normal leading-[var(--typography-line-height-i)]"
              data-node-id="40017188:10498"
            >
              {summary}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
