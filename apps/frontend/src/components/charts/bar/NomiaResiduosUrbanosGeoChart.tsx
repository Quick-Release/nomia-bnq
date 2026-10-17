import * as React from "react";

export const URBAN_WASTE_YEARS = [2021, 2022, 2023, 2024] as const;
export type UrbanWasteYear = (typeof URBAN_WASTE_YEARS)[number];

const YEAR_FILL: Record<UrbanWasteYear, string> = {
  2021: "var(--main-cinza-200)",
  2022: "var(--main-laranja-300)",
  2023: "var(--main-botnico-300)",
  2024: "var(--main-ciano-400)",
};

const YEAR_LEGEND_CLASS: Record<UrbanWasteYear, string> = {
  2021: "bg-main-cinza-200 text-main-cinza-700",
  2022: "bg-main-laranja-300 text-main-cinza-700",
  2023: "bg-main-botnico-300 text-main-cinza-700",
  2024: "bg-main-ciano-300 text-main-cinza-700",
};

/** Catalog-only data used when the chart is rendered without a WordPress block contract. */
const DEFAULT_REGION_ROWS: UrbanWasteRegion[] = [
  { id: "pt", label: "Portugal", values: { 2021: 349, 2022: 735, 2023: 876, 2024: 787 } },
  { id: "cont", label: "Continente", values: { 2021: 680, 2022: 956, 2023: 735, 2024: 720 } },
  { id: "norte", label: "Norte", values: { 2021: 735, 2022: 1000, 2023: 959, 2024: 915 } },
  { id: "centro", label: "Centro", values: { 2021: 948, 2022: 1000, 2023: 735, 2024: 844 } },
  {
    id: "oeste",
    label: "Oeste e Vale do Tejo",
    values: { 2021: 959, 2022: 917, 2023: 852, 2024: 735 },
  },
];

export type UrbanWasteRegion = {
  id: string;
  label: string;
  values: Record<UrbanWasteYear, number>;
};

const X_MAX = 1000;
const TICK_STEP = 100;

const DEFAULT_TITLE = "Resíduos Urbanos Recolhidos por Habitante por Localização Geográfica";
const DEFAULT_BADGE = "2021–2024";
const DEFAULT_INTRO =
  "Indicador ilustrativo da recolha de resíduos urbanos por habitante, comparando o território nacional com sub-regiões. Os valores são fictícios para demonstração do gráfico.";

const DEFAULT_SUMMARY =
  "A leitura espacial destaca diferenças entre costa e interior e entre regiões com maior densidade urbana e redes de recolha distintas. Use os anos para comparar tendências ao longo do tempo.";

const LABEL_COL = "w-52 shrink-0 sm:w-56";

function AxisTicks() {
  const ticks = Array.from({ length: X_MAX / TICK_STEP + 1 }, (_, i) => i * TICK_STEP);
  return (
    <div className="mb-2 flex w-full gap-4 sm:gap-8">
      <div className={`${LABEL_COL} hidden sm:block`} aria-hidden />
      <div
        className="text-body text-main-cinza-400 font-secondary grid min-w-0 flex-1 grid-cols-11 font-normal tabular-nums tracking-[var(--tracking-typography-0)] max-sm:text-extra max-sm:leading-[var(--typography-line-height-j)]"
        data-node-id="40017188:10736"
      >
        {ticks.map((n) => (
          <span key={n} className="text-center">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

function RegionBlock({
  label,
  values,
  visible,
  nested,
  onHover,
}: {
  label: string;
  values: Record<UrbanWasteYear, number>;
  visible: Record<UrbanWasteYear, boolean>;
  nested?: boolean;
  onHover: (t: { year: UrbanWasteYear; value: number } | null) => void;
}) {
  return (
    <div
      className={`flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 ${nested ? "rounded-lg bg-main-cinza-100/50 p-6" : ""}`}
    >
      <p
        className={`text-body text-main-cinza-400 font-secondary ${LABEL_COL} font-normal leading-[var(--typography-line-height-i)] tracking-[var(--tracking-typography-0)]`}
      >
        {label}
      </p>
      <div className="relative min-h-[5.5rem] min-w-0 flex-1">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--main-cinza-100) 0 1px, transparent 1px 100%)",
            backgroundSize: "calc(100% / 10) 100%",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-2">
          {URBAN_WASTE_YEARS.map((year) => {
            const v = Math.min(values[year], X_MAX);
            const pct = (v / X_MAX) * 100;
            const dim = !visible[year];
            const soft = year !== 2024;
            return (
              <div key={year} className="relative flex h-4 w-full items-center">
                <button
                  type="button"
                  className="focus-visible:ring-main-teal-400 h-4 max-w-full rounded-full transition-[opacity,transform] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: YEAR_FILL[year],
                    opacity: dim ? 0.12 : soft ? 0.32 : 1,
                  }}
                  aria-label={`${label}, ${year}: ${v} kg por habitante`}
                  onMouseEnter={() => onHover({ year, value: values[year] })}
                  onMouseLeave={() => onHover(null)}
                  onFocus={() => onHover({ year, value: values[year] })}
                  onBlur={() => onHover(null)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function NomiaResiduosUrbanosGeoChart({
  title = DEFAULT_TITLE,
  badge = DEFAULT_BADGE,
  intro = DEFAULT_INTRO,
  summary = DEFAULT_SUMMARY,
  comparisonLabel = "Localização vs Resíduos Urbanos",
  metricLabel = "kg/habitante",
  periodLabel = "Anual",
  scopeLabel = "Portugal",
  regions: regionsProp,
}: {
  title?: string;
  badge?: string;
  intro?: string;
  summary?: string;
  comparisonLabel?: string;
  metricLabel?: string;
  periodLabel?: string;
  scopeLabel?: string;
  regions?: readonly UrbanWasteRegion[];
}) {
  const [visible, setVisible] = React.useState<Record<UrbanWasteYear, boolean>>({
    2021: true,
    2022: true,
    2023: true,
    2024: true,
  });

  const [hover, setHover] = React.useState<{ year: UrbanWasteYear; value: number } | null>(null);

  const toggleYear = (y: UrbanWasteYear) => {
    setVisible((s) => ({ ...s, [y]: !s[y] }));
  };

  const regionRows = regionsProp && regionsProp.length >= 2 ? regionsProp : DEFAULT_REGION_ROWS;
  const [portugal, ...rest] = regionRows;
  const [continente, ...subregions] = rest;

  return (
    <section
      className="bg-neutral-bw-white w-full overflow-x-hidden"
      aria-labelledby="residuos-geo-heading"
      data-node-id="40017232:8764"
      data-nomia-header-surface="light"
    >
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-10 px-4 py-16 md:px-16 md:py-20">
        <header className="flex max-w-[1488px] flex-col gap-4" data-node-id="40017188:10711">
          <div
            className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            data-node-id="40017188:10712"
          >
            <h2
              id="residuos-geo-heading"
              className="text-h4 text-main-teal-400 font-primary font-medium leading-[var(--typography-line-height-f)] tracking-[var(--tracking-typography-0)]"
              data-node-id="40017188:10713"
            >
              {title}
            </h2>
            <span
              className="text-body-large text-main-cinza-700 font-additional w-fit rounded-[24px] bg-main-teal-200 px-4 py-1 font-medium leading-[var(--typography-line-height-h)] tracking-[var(--tracking-typography-0)]"
              data-node-id="40017188:10714"
            >
              {badge}
            </span>
          </div>
          <p
            className="text-body text-main-cinza-400 font-secondary max-w-[1488px] font-normal leading-[var(--typography-line-height-i)] tracking-[var(--tracking-typography-0)]"
            data-node-id="40017188:10716"
          >
            {intro}
          </p>
        </header>

        <div
          className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:gap-8"
          data-node-id="40017188:10717"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="text-body text-main-cinza-400 font-secondary flex flex-wrap items-center gap-2 font-normal tracking-[var(--tracking-typography-0)]">
                <span data-node-id="40017188:10719">{comparisonLabel}</span>
                <span
                  className="text-extra text-main-cinza-700 font-additional rounded-[24px] bg-main-cinza-200 px-4 py-1 font-normal leading-[var(--typography-line-height-j)]"
                  data-node-id="40017188:10720"
                >
                  {metricLabel}
                </span>
                <span
                  className="text-extra text-main-cinza-700 font-additional rounded-[24px] bg-main-cinza-200 px-4 py-1 font-normal leading-[var(--typography-line-height-j)]"
                  data-node-id="40017188:10722"
                >
                  {periodLabel}
                </span>
                <span
                  className="text-extra text-main-cinza-700 font-additional rounded-[24px] bg-main-cinza-200 px-4 py-1 font-normal leading-[var(--typography-line-height-j)]"
                  data-node-id="40017188:10724"
                >
                  {scopeLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2" data-node-id="40017188:10726">
                {URBAN_WASTE_YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => toggleYear(y)}
                    aria-pressed={visible[y]}
                    className={`text-extra font-additional rounded-[24px] px-4 py-1 font-normal leading-[var(--typography-line-height-j)] tracking-[var(--tracking-typography-0)] transition-opacity ${YEAR_LEGEND_CLASS[y]} ${!visible[y] ? "opacity-40" : ""}`}
                    data-node-id={
                      y === 2021
                        ? "40017188:10727"
                        : y === 2022
                          ? "40017188:10729"
                          : y === 2023
                            ? "40017188:10731"
                            : "40017188:10733"
                    }
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="border-main-cinza-100 w-full max-w-[1488px] rounded-[24px] border-2 bg-neutral-bw-white p-6"
              data-node-id="40017188:10748"
              data-nomia-header-surface="light"
            >
              <AxisTicks />
              <div className="flex flex-col gap-4" data-node-id="40017188:10749">
                <RegionBlock
                  label={portugal.label}
                  values={portugal.values}
                  visible={visible}
                  onHover={setHover}
                />
              </div>

              <div
                className="border-main-cinza-100 mt-4 flex flex-col gap-4 rounded-2xl border-2 p-6"
                data-node-id="40017188:10756"
              >
                <RegionBlock
                  label={continente.label}
                  values={continente.values}
                  visible={visible}
                  onHover={setHover}
                />
                {subregions.map((row) => (
                  <RegionBlock
                    key={row.id}
                    label={row.label}
                    values={row.values}
                    visible={visible}
                    nested
                    onHover={setHover}
                  />
                ))}
              </div>

              {hover ? (
                <div
                  className="border-main-teal-400 bg-main-teal-400 text-notes font-secondary pointer-events-none mt-4 inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-neutral-bw-white shadow-xl"
                  data-node-id="40017188:10764"
                  role="status"
                >
                  <span className="font-semibold">{hover.year}</span>
                  <span className="font-normal tabular-nums">{hover.value} kg/hab.</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="text-main-cinza-700 flex w-full shrink-0 flex-col gap-4 tracking-[var(--tracking-typography-0)] lg:max-w-sm">
            <p className="text-body-large font-primary font-medium leading-[var(--typography-line-height-h)]">
              Resumo
            </p>
            <p className="text-body font-secondary font-normal leading-[var(--typography-line-height-i)]">
              {summary}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
