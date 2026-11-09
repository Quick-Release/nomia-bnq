import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import geometry from "../components/nuts-map/nuts-map-geometry.json";
import { NUTS_MAP_LEVELS, NUTS_UNITS, nutsCodeOfSlug, nutsMemberships, nutsUnitsAt } from "./nuts";

describe("NUTS 2024 units", () => {
  it("match the table gq-bioeconomia seeds as regiao_nuts terms", () => {
    const php = readFileSync(
      new URL("../../../cms/web/app/plugins/gq-bioeconomia/src/Content/Nuts.php", import.meta.url),
      "utf8",
    );
    const rows = [
      ...php.matchAll(/\[ '([A-Z0-9]+)', (\d), (?:'([A-Z0-9]+)'|null), '([^']+)', '([^']+)' \]/g),
    ].map(([, code, level, parent, name, labelEn]) => ({
      code,
      level: Number(level),
      parent: parent ?? null,
      name,
      labelEn,
    }));
    expect(rows).toEqual(NUTS_UNITS);
  });

  it("are 1, 3, 9 and 26 units, each nested in its parent by code", () => {
    expect([0, 1, 2, 3].map((level) => nutsUnitsAt(level as 0 | 1 | 2 | 3).length)).toEqual([
      1, 3, 9, 26,
    ]);
    for (const unit of NUTS_UNITS) {
      if (unit.parent) expect(unit.code.startsWith(unit.parent)).toBe(true);
    }
  });

  it("are drawn at every map level, and only they are", () => {
    for (const level of NUTS_MAP_LEVELS) {
      const drawn = (geometry.shapes as Record<string, { code: string }[]>)[String(level)];
      expect(drawn.map((shape) => shape.code).sort()).toEqual(
        nutsUnitsAt(level)
          .map((unit) => unit.code)
          .sort(),
      );
    }
  });
});

describe("nutsMemberships", () => {
  it("adds every region above a tagged unit, in table order", () => {
    expect(nutsMemberships(["PT11D"])).toEqual(["PT", "PT1", "PT11", "PT11D"]);
    expect(nutsMemberships(["PT20", "PT1C2"])).toEqual([
      "PT",
      "PT1",
      "PT2",
      "PT1C",
      "PT20",
      "PT1C2",
    ]);
    expect(nutsMemberships([])).toEqual([]);
  });
});

describe("nutsCodeOfSlug", () => {
  it("reads a term slug as its code, and nothing else", () => {
    expect(nutsCodeOfSlug("pt1c")).toBe("PT1C");
    expect(nutsCodeOfSlug("ptz")).toBeNull();
    expect(nutsCodeOfSlug("alentejo")).toBeNull();
  });
});
