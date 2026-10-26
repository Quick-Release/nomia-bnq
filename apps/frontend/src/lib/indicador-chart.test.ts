import { describe, expect, it } from "vite-plus/test";
import {
  areaLabel,
  indicadorSeries,
  periodLabel,
  readDecimal,
  readIndicador,
  readIndicadorId,
  type NomiaIndicador,
} from "./indicador-chart";
import { nomiaExtension, nomiaPage } from "./nomia-content";

/** An Indicador as the CMS holds it, Horizontal Bars by default (as the live ones). */
function indicador(overrides: Partial<NomiaIndicador> = {}): NomiaIndicador {
  return {
    kind: "indicador",
    id: 704,
    representation: "Horizontal Bars",
    geographicArea: "NUTS 0",
    sourceName: "INE",
    sourceUrl: "",
    xAxis: { label: "Toneladas", unit: "" },
    yAxis: { label: "Ano", unit: "" },
    points: [],
    ...overrides,
  };
}

describe("an Indicador's series", () => {
  it("reads Horizontal Bars with the years on y, oldest first", () => {
    const series = indicadorSeries(
      indicador({
        points: [
          { x: "14.36", y: "2024" },
          { x: "15.29", y: "2023" },
          { x: "", y: "2022" },
        ],
      }),
    );
    expect(series).toEqual({
      orientation: "horizontal",
      categoryLabel: "Ano",
      valueLabel: "Toneladas",
      valueUnit: "",
      rows: [
        { category: "2023", value: 15.29 },
        { category: "2024", value: 14.36 },
      ],
      swapped: false,
    });
  });

  it("reads points entered on the other axes the other way round (IG.1)", () => {
    const series = indicadorSeries(
      indicador({
        xAxis: { label: "Euro", unit: "" },
        yAxis: { label: "Ano", unit: "" },
        points: [
          { x: "2024", y: "1.59" },
          { x: "2023", y: "1.48" },
        ],
      }),
    );
    expect(series.swapped).toBe(true);
    expect(series.rows).toEqual([
      { category: "2023", value: 1.48 },
      { category: "2024", value: 1.59 },
    ]);
    expect(series.categoryLabel).toBe("Ano");
    expect(series.valueLabel).toBe("Euro");
  });

  it("keeps labels with the points when both were entered on the other axes (IG.7)", () => {
    const series = indicadorSeries(
      indicador({
        xAxis: { label: "Ano", unit: "" },
        yAxis: { label: "Toneladas", unit: "t" },
        points: [{ x: "2025", y: "3,7" }],
      }),
    );
    expect(series.rows).toEqual([{ category: "2025", value: 3.7 }]);
    expect(series.categoryLabel).toBe("Ano");
    expect(series.valueLabel).toBe("Toneladas");
    expect(series.valueUnit).toBe("t");
  });

  it("draws Columns, and representations not drawn yet, with the categories on x", () => {
    for (const representation of ["Columns", "Speedometer", "Traffic Lights", ""]) {
      const series = indicadorSeries(
        indicador({
          representation,
          xAxis: { label: "Ano", unit: "" },
          yAxis: { label: "%", unit: "" },
          points: [{ x: "2024", y: "3" }],
        }),
      );
      expect(series.orientation).toBe("vertical");
      expect(series.swapped).toBe(false);
      expect(series.rows).toEqual([{ category: "2024", value: 3 }]);
    }
  });

  it("keeps text categories in the order entered", () => {
    const series = indicadorSeries(
      indicador({
        representation: "Columns",
        points: [
          { x: "Norte", y: "2" },
          { x: "Centro", y: "1" },
        ],
      }),
    );
    expect(series.rows.map((row) => row.category)).toEqual(["Norte", "Centro"]);
  });
});

describe("an Indicador's labels and settings", () => {
  it("names the period, the area and the block's Indicador", () => {
    expect(
      periodLabel([
        { category: "2020", value: 1 },
        { category: "2024", value: 2 },
      ]),
    ).toBe("2020–2024");
    expect(periodLabel([{ category: "2024", value: 1 }])).toBe("2024");
    expect(periodLabel([{ category: "Norte", value: 1 }])).toBe("");
    expect(periodLabel([])).toBe("");
    expect(areaLabel("Municipality")).toBe("Município");
    expect(areaLabel("NUTS 0")).toBe("NUTS 0");
    expect(readDecimal("1,59")).toBe(1.59);
    expect(readDecimal("")).toBeNaN();
    expect(readIndicadorId(702)).toBe(702);
    expect(readIndicadorId("702")).toBe(702);
    expect(readIndicadorId(0)).toBeNull();
    expect(readIndicadorId(undefined)).toBeNull();
  });
});

describe("the Indicador extension", () => {
  const fields = {
    databaseId: 702,
    gqBioeconomiaGraphicGraphicRepresentation: "Horizontal Bars",
    gqBioeconomiaGraphicGeographicArea: "NUTS 0",
    gqBioeconomiaGraphicSourceName: "INE",
    gqBioeconomiaGraphicSourceUrl: "https://www.ine.pt/",
    gqBioeconomiaGraphicXAxisLabel: "Euro",
    gqBioeconomiaGraphicXAxisUnit: null,
    gqBioeconomiaGraphicYAxisLabel: "Ano",
    gqBioeconomiaGraphicYAxisUnit: null,
    gqBioeconomiaGraphicDataPoints: [{ x: "2024", y: "1.59" }, null],
  };

  it("reads an Indicador's chart, and nothing for collections without an extension", () => {
    const read = nomiaExtension.read({ kind: "item", collection: "indicadores", fields });
    expect(read).toEqual(readIndicador(fields));
    expect(read).toMatchObject({
      kind: "indicador",
      id: 702,
      xAxis: { label: "Euro", unit: "" },
      points: [{ x: "2024", y: "1.59" }],
    });
    expect(
      nomiaExtension.read({ kind: "item", collection: "indicadores", fields: {} }),
    ).toBeUndefined();
    expect(nomiaExtension.read({ kind: "item", collection: "eventos", fields })).toBeUndefined();
  });

  it("parses what it stored, and an Indicador is never a page's blocks", () => {
    const stored: unknown = JSON.parse(JSON.stringify(readIndicador(fields)));
    expect(nomiaExtension.parse(stored)).toBe(stored);
    expect(nomiaExtension.parse({ kind: "indicador", id: "702" })).toBeUndefined();
    expect(nomiaPage(readIndicador(fields))).toBeUndefined();
    expect(nomiaPage(undefined)).toBeUndefined();
  });
});
