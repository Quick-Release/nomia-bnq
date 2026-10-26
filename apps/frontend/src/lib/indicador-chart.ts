import { z } from "astro/zod";

/*
 * An Indicador's chart (gq-bioeconomia's `indicadores` type and its
 * "Metadados do gráfico" panel), stored with each item in the publication
 * store as its extension, and drawn by the Indicador chart block.
 */

/** The GraphQL fields read with every Indicador (src/lib/nomia-content.ts). */
export const INDICADOR_FIELDS = [
  "databaseId",
  "gqBioeconomiaGraphicGraphicRepresentation",
  "gqBioeconomiaGraphicGeographicArea",
  "gqBioeconomiaGraphicSourceName",
  "gqBioeconomiaGraphicSourceUrl",
  "gqBioeconomiaGraphicXAxisLabel",
  "gqBioeconomiaGraphicXAxisUnit",
  "gqBioeconomiaGraphicYAxisLabel",
  "gqBioeconomiaGraphicYAxisUnit",
  "gqBioeconomiaGraphicDataPoints { x y }",
].join(" ");

/** An Indicador's chart as the CMS holds it: its points stay text, as edited. */
export interface NomiaIndicador {
  kind: "indicador";
  /** The post's ID, which the block stores. */
  id: number;
  /** "Columns", "Horizontal Bars", "Traffic Lights" or "Speedometer". */
  representation: string;
  /** "NUTS 0" … "NUTS 3" or "Municipality". */
  geographicArea: string;
  sourceName: string;
  sourceUrl: string;
  xAxis: { label: string; unit: string };
  yAxis: { label: string; unit: string };
  points: Array<{ x: string; y: string }>;
}

export const storedNomiaIndicador = z.object({
  kind: z.literal("indicador"),
  id: z.number(),
  representation: z.string(),
  geographicArea: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string(),
  xAxis: z.object({ label: z.string(), unit: z.string() }),
  yAxis: z.object({ label: z.string(), unit: z.string() }),
  points: z.array(z.object({ x: z.string(), y: z.string() })),
});

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** The Indicador WordPress returned, or undefined without its ID. */
export function readIndicador(
  fields: Readonly<Record<string, unknown>>,
): NomiaIndicador | undefined {
  const id = fields.databaseId;
  if (typeof id !== "number" || !Number.isInteger(id) || id < 1) return undefined;
  const points = Array.isArray(fields.gqBioeconomiaGraphicDataPoints)
    ? fields.gqBioeconomiaGraphicDataPoints.flatMap((point: unknown) =>
        point && typeof point === "object"
          ? [{ x: text((point as { x?: unknown }).x), y: text((point as { y?: unknown }).y) }]
          : [],
      )
    : [];
  return {
    kind: "indicador",
    id,
    representation: text(fields.gqBioeconomiaGraphicGraphicRepresentation),
    geographicArea: text(fields.gqBioeconomiaGraphicGeographicArea),
    sourceName: text(fields.gqBioeconomiaGraphicSourceName),
    sourceUrl: text(fields.gqBioeconomiaGraphicSourceUrl),
    xAxis: {
      label: text(fields.gqBioeconomiaGraphicXAxisLabel),
      unit: text(fields.gqBioeconomiaGraphicXAxisUnit),
    },
    yAxis: {
      label: text(fields.gqBioeconomiaGraphicYAxisLabel),
      unit: text(fields.gqBioeconomiaGraphicYAxisUnit),
    },
    points,
  };
}

export type ChartOrientation = "vertical" | "horizontal";

export interface IndicadorSeries {
  /** Horizontal Bars are drawn horizontally; every other representation as columns. */
  orientation: ChartOrientation;
  /** The category axis's label (usually "Ano"). */
  categoryLabel: string;
  valueLabel: string;
  valueUnit: string;
  /** Rows with a value, in chronological order when every category is a number. */
  rows: Array<{ category: string; value: number }>;
  /** Whether the points were entered on the other axes than the representation expects. */
  swapped: boolean;
}

/** A decimal as editors type it: `1.59` or `1,59`. */
export function readDecimal(value: string): number {
  const normalized = /^-?\d+,\d+$/.test(value) ? value.replace(",", ".") : value;
  return normalized === "" ? Number.NaN : Number(normalized);
}

const isYear = (value: string) => /^\d{4}$/.test(value) && +value >= 1800 && +value <= 2100;
const TIME_LABEL = /^(ano|anos|year|years|período|periodo|data)$/i;

/**
 * The chart an Indicador draws. Horizontal Bars keep the category (the year)
 * on y and the value on x, as the legacy charts did; Columns keep it on x.
 * Points entered on the other axes (the years where the values belong) are
 * read the other way round, and so are labels: a time label ("Ano") always
 * names the categories.
 */
export function indicadorSeries(indicador: NomiaIndicador): IndicadorSeries {
  const orientation: ChartOrientation =
    indicador.representation === "Horizontal Bars" ? "horizontal" : "vertical";
  const expected = orientation === "horizontal" ? "y" : "x";
  const other = expected === "y" ? "x" : "y";
  const filled = (axis: "x" | "y") =>
    indicador.points.map((point) => point[axis]).filter((value) => value !== "");
  const allYears = (axis: "x" | "y") => {
    const values = filled(axis);
    return values.length > 0 && values.every(isYear);
  };
  const swapped = allYears(other) && !allYears(expected);
  const category = swapped ? other : expected;
  const value = category === "x" ? "y" : "x";

  const axes = { x: indicador.xAxis, y: indicador.yAxis };
  const labelCategory =
    TIME_LABEL.test(axes[value].label) && !TIME_LABEL.test(axes[category].label) ? value : category;
  const labelValue = labelCategory === "x" ? "y" : "x";

  const rows = indicador.points.flatMap((point) => {
    const amount = readDecimal(point[value]);
    return point[category] !== "" && Number.isFinite(amount)
      ? [{ category: point[category], value: amount }]
      : [];
  });
  if (rows.every((row) => Number.isFinite(Number(row.category)))) {
    rows.sort((a, b) => Number(a.category) - Number(b.category));
  }

  return {
    orientation,
    categoryLabel: axes[labelCategory].label,
    valueLabel: axes[labelValue].label,
    valueUnit: axes[labelValue].unit,
    rows,
    swapped,
  };
}

/** "2020–2024" for yearly rows, "2024" for one, nothing otherwise. */
export function periodLabel(rows: IndicadorSeries["rows"]): string {
  if (rows.length === 0 || !rows.every((row) => isYear(row.category))) return "";
  const first = rows[0]!.category;
  const last = rows[rows.length - 1]!.category;
  return first === last ? first : `${first}–${last}`;
}

const AREA_LABELS: Record<string, string> = { Municipality: "Município" };

/** The geographic area as visitors read it (the CMS stores English choices). */
export function areaLabel(area: string): string {
  return AREA_LABELS[area] ?? area;
}

/** The block's indicador: a positive integer ID, or null. */
export function readIndicadorId(value: unknown): number | null {
  const id = typeof value === "number" ? value : Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
