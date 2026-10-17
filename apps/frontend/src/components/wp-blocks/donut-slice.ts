import type { PieChartDonutSlice } from "../charts/pie/PieChartDonutChart";
import type { WpParsedBlock } from "../../lib/wp-blocks";
import type { AttrsFor } from "./wp-block-attrs";
import { firstArray, mapValid, textOr, wpNumber } from "./normalizers.ts";

type SliceAttrs = { type?: unknown; label?: unknown; value?: unknown };

const DONUT_FILLS = [
  "var(--main-cinza-200)",
  "var(--main-cinza-300)",
  "var(--main-cinza-400)",
  "var(--main-cinza-500)",
  "var(--main-teal-400)",
  "var(--main-ciano-400)",
] as const;

/**
 * Shared slice validator + row-list read for the donut chart blocks
 * (`pie-chart-donut` and `grafico-donut`), which are otherwise identical.
 */
function slice(raw: unknown, index: number): PieChartDonutSlice | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as SliceAttrs;
  const value = wpNumber(item.value);
  const label = textOr(item.label, item.type);
  if (!label || !Number.isFinite(value) || value < 0) return null;
  return {
    type: textOr(item.type, label),
    label,
    value,
    fill: DONUT_FILLS[index % DONUT_FILLS.length],
  };
}

export function normalizeDonutSlices(block: WpParsedBlock): PieChartDonutSlice[] {
  const attrs = (block.attrs ?? {}) as AttrsFor<"getquick/pie-chart-donut">;
  return mapValid(firstArray(attrs.slices, attrs.items), slice);
}
