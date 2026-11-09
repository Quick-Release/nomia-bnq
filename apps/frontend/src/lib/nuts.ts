/*
 * Portugal's NUTS 2024 units (in force since 1 January 2024), as the
 * `regiao_nuts` taxonomy holds them: each unit is a term whose slug is its
 * code in lower case. gq-bioeconomia's `Content\Nuts` seeds the same table;
 * nuts.test.ts compares the two.
 *
 * The codes nest by prefix (PT → PT1 → PT1C → PT1C2), so a region contains
 * every unit whose code starts with its own. Source: Eurostat, NUTS 2024.
 */

export type NutsLevel = 0 | 1 | 2 | 3;

export interface NutsUnit {
  code: string;
  level: NutsLevel;
  parent: string | null;
  /** Its Portuguese name, as the Site shows it. */
  name: string;
  /** An explanatory English label. */
  labelEn: string;
}

const unit = (
  code: string,
  level: NutsLevel,
  parent: string | null,
  name: string,
  labelEn: string,
): NutsUnit => ({ code, level, parent, name, labelEn });

export const NUTS_UNITS: readonly NutsUnit[] = [
  unit("PT", 0, null, "Portugal", "Portugal"),
  unit("PT1", 1, "PT", "Continente", "Mainland Portugal"),
  unit("PT2", 1, "PT", "Região Autónoma dos Açores", "Autonomous Region of the Azores"),
  unit("PT3", 1, "PT", "Região Autónoma da Madeira", "Autonomous Region of Madeira"),
  unit("PT11", 2, "PT1", "Norte", "North"),
  unit("PT19", 2, "PT1", "Centro", "Centre"),
  unit("PT1D", 2, "PT1", "Oeste e Vale do Tejo", "West and Tagus Valley"),
  unit("PT1A", 2, "PT1", "Grande Lisboa", "Greater Lisbon"),
  unit("PT1B", 2, "PT1", "Península de Setúbal", "Setúbal Peninsula"),
  unit("PT1C", 2, "PT1", "Alentejo", "Alentejo"),
  unit("PT15", 2, "PT1", "Algarve", "Algarve"),
  unit("PT20", 2, "PT2", "Região Autónoma dos Açores", "Autonomous Region of the Azores"),
  unit("PT30", 2, "PT3", "Região Autónoma da Madeira", "Autonomous Region of Madeira"),
  unit("PT111", 3, "PT11", "Alto Minho", "Upper Minho"),
  unit("PT112", 3, "PT11", "Cávado", "Cávado"),
  unit("PT119", 3, "PT11", "Ave", "Ave"),
  unit("PT11A", 3, "PT11", "Área Metropolitana do Porto", "Porto Metropolitan Area"),
  unit("PT11B", 3, "PT11", "Alto Tâmega e Barroso", "Upper Tâmega and Barroso"),
  unit("PT11C", 3, "PT11", "Tâmega e Sousa", "Tâmega and Sousa"),
  unit("PT11D", 3, "PT11", "Douro", "Douro"),
  unit("PT11E", 3, "PT11", "Terras de Trás-os-Montes", "Terras de Trás-os-Montes"),
  unit("PT191", 3, "PT19", "Região de Aveiro", "Aveiro Region"),
  unit("PT192", 3, "PT19", "Região de Coimbra", "Coimbra Region"),
  unit("PT193", 3, "PT19", "Região de Leiria", "Leiria Region"),
  unit("PT194", 3, "PT19", "Viseu Dão Lafões", "Viseu Dão Lafões"),
  unit("PT195", 3, "PT19", "Beira Baixa", "Beira Baixa"),
  unit("PT196", 3, "PT19", "Beiras e Serra da Estrela", "Beiras and Serra da Estrela"),
  unit("PT1D1", 3, "PT1D", "Oeste", "West"),
  unit("PT1D2", 3, "PT1D", "Médio Tejo", "Middle Tagus"),
  unit("PT1D3", 3, "PT1D", "Lezíria do Tejo", "Lezíria do Tejo"),
  unit("PT1A0", 3, "PT1A", "Grande Lisboa", "Greater Lisbon"),
  unit("PT1B0", 3, "PT1B", "Península de Setúbal", "Setúbal Peninsula"),
  unit("PT1C1", 3, "PT1C", "Alentejo Litoral", "Coastal Alentejo"),
  unit("PT1C2", 3, "PT1C", "Baixo Alentejo", "Lower Alentejo"),
  unit("PT1C3", 3, "PT1C", "Alto Alentejo", "Upper Alentejo"),
  unit("PT1C4", 3, "PT1C", "Alentejo Central", "Central Alentejo"),
  unit("PT150", 3, "PT15", "Algarve", "Algarve"),
  unit("PT200", 3, "PT20", "Região Autónoma dos Açores", "Autonomous Region of the Azores"),
  unit("PT300", 3, "PT30", "Região Autónoma da Madeira", "Autonomous Region of Madeira"),
];

const BY_CODE = new Map(NUTS_UNITS.map((u) => [u.code, u]));

/** The levels the map draws, each in its own colour. */
export const NUTS_MAP_LEVELS = [0, 1, 2] as const;
export type NutsMapLevel = (typeof NUTS_MAP_LEVELS)[number];

export function nutsUnit(code: string): NutsUnit | undefined {
  return BY_CODE.get(code);
}

export function nutsUnitsAt(level: NutsLevel): NutsUnit[] {
  return NUTS_UNITS.filter((u) => u.level === level);
}

/** The unit a `regiao_nuts` term slug names (`pt1c` → PT1C), if any. */
export function nutsCodeOfSlug(slug: string): string | null {
  const code = slug.trim().toUpperCase();
  return BY_CODE.has(code) ? code : null;
}

/**
 * The units an entry tagged with these codes belongs to: each code and every
 * region above it, so selecting a region matches entries tagged anywhere
 * inside it.
 */
export function nutsMemberships(codes: readonly string[]): string[] {
  const result = new Set<string>();
  for (const code of codes) {
    for (
      let current = BY_CODE.get(code);
      current;
      current = current.parent ? BY_CODE.get(current.parent) : undefined
    ) {
      result.add(current.code);
    }
  }
  return NUTS_UNITS.map((u) => u.code).filter((code) => result.has(code));
}
