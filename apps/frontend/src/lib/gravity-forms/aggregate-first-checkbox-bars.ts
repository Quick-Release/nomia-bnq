import {
  gfEntryPropertyKeyFromSubmitKey,
  inputKeyFromSubInput,
  listInputKeysForField,
} from "./input-names";
import type { GFField, GFForm } from "./types";

export type VerticalBarDatum = { band: string; label: string; pct: number; fill: string };

export type GFEntryRecord = Record<string, unknown>;

const FILLS = [
  "var(--main-cinza-200)",
  "var(--main-cinza-300)",
  "var(--main-cinza-400)",
  "var(--main-cinza-500)",
] as const;

function isNonEmptyEntryValue(v: unknown): boolean {
  if (v == null) return false;
  const s = String(v).trim();
  return s !== "" && s !== "null" && s !== "0";
}

export function findFirstCheckboxField(fields: GFField[] | undefined): GFField | null {
  if (!fields?.length) return null;
  return fields.find((f) => f.type === "checkbox") ?? null;
}

function isSurveyRadioField(field: GFField): boolean {
  return field.type === "survey" && (!field.inputType || field.inputType === "radio");
}

/**
 * When the form has no checkbox (common with Survey add-on radio rows), aggregate the first
 * single-choice field so Barómetro results still render.
 */
export function findFirstScalarChoiceField(fields: GFField[] | undefined): GFField | null {
  if (!fields?.length) return null;
  return (
    fields.find((f) => f.type === "radio") ??
    fields.find((f) => isSurveyRadioField(f)) ??
    fields.find((f) => f.type === "select") ??
    null
  );
}

export type PickedBarField = {
  field: GFField;
  mode: "checkbox" | "scalar";
  /**
   * True only when auto-resolution (`pickFieldForBarometroBars`) chose the first scalar field
   * because the form had no checkbox. Explicit `fieldId` picks always set this to false.
   */
  usedFallback: boolean;
};

export function pickFieldForBarometroBars(form: GFForm): PickedBarField | null {
  const fields = form.fields ?? [];
  const checkbox = findFirstCheckboxField(fields);
  if (checkbox) return { field: checkbox, mode: "checkbox", usedFallback: false };
  const scalar = findFirstScalarChoiceField(fields);
  if (scalar) return { field: scalar, mode: "scalar", usedFallback: true };
  return null;
}

/**
 * Resolve a specific form field by Gravity Forms `id` for vertical-bar aggregation.
 * Supported: `checkbox`, `radio`, `select`, and survey fields with single-choice (`inputType` radio or unset).
 */
export function pickFieldByIdForBarometroBars(
  form: GFForm,
  fieldId: number,
): PickedBarField | null {
  if (!Number.isFinite(fieldId) || fieldId < 1) return null;
  const field = form.fields?.find((f) => f.id === fieldId);
  if (!field) return null;
  if (field.type === "checkbox") return { field, mode: "checkbox", usedFallback: false };
  if (field.type === "radio" || field.type === "select" || isSurveyRadioField(field)) {
    return { field, mode: "scalar", usedFallback: false };
  }
  return null;
}

function choiceLabel(field: GFField, value: string): string {
  const c = field.choices?.find((ch) => ch.value === value);
  return c?.text ?? value;
}

export function aggregateScalarChoiceFieldToBars(
  field: GFField,
  entries: GFEntryRecord[],
): VerticalBarDatum[] {
  const submitKeys = listInputKeysForField(field);
  const entryKey = gfEntryPropertyKeyFromSubmitKey(submitKeys[0] ?? `input_${field.id}`);
  const counts = new Map<string, number>();
  let answered = 0;
  for (const e of entries) {
    const raw = e[entryKey];
    if (!isNonEmptyEntryValue(raw)) continue;
    answered++;
    const v = String(raw).trim();
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  const total = answered || 1;
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return rows.map(([value, count], i) => ({
    band: value,
    label: choiceLabel(field, value),
    pct: Math.round((count / total) * 1000) / 10,
    fill: FILLS[i % FILLS.length]!,
  }));
}

export function aggregateCheckboxFieldToBars(
  field: GFField,
  entries: GFEntryRecord[],
): VerticalBarDatum[] {
  const visibleInputs = field.inputs?.filter((i) => !i.isHidden) ?? [];

  if (visibleInputs.length > 1) {
    const rows = visibleInputs.map((input) => {
      const submitKey = inputKeyFromSubInput(field.id, input);
      const key = gfEntryPropertyKeyFromSubmitKey(submitKey);
      const label = input.label?.trim() || input.name || key;
      return { key, label, count: 0 };
    });
    for (const e of entries) {
      for (const r of rows) {
        if (isNonEmptyEntryValue(e[r.key])) r.count++;
      }
    }
    const total = rows.reduce((s, r) => s + r.count, 0) || 1;
    return rows.map((r, i) => ({
      band: r.key,
      label: r.label,
      pct: Math.round((r.count / total) * 1000) / 10,
      fill: FILLS[i % FILLS.length]!,
    }));
  }

  const submitKey =
    visibleInputs.length === 1
      ? inputKeyFromSubInput(field.id, visibleInputs[0]!)
      : (`input_${field.id}` as const);
  const key = gfEntryPropertyKeyFromSubmitKey(submitKey);
  let selected = 0;
  for (const e of entries) {
    if (isNonEmptyEntryValue(e[key])) selected++;
  }
  const n = entries.length || 1;
  const notSelected = Math.max(0, entries.length - selected);
  return [
    {
      band: "checked",
      label: "Selecionado",
      pct: Math.round((selected / n) * 1000) / 10,
      fill: FILLS[0]!,
    },
    {
      band: "unchecked",
      label: "Não selecionado",
      pct: Math.round((notSelected / n) * 1000) / 10,
      fill: FILLS[1]!,
    },
  ];
}

export function aggregatePickedFieldToBars(
  picked: PickedBarField,
  entries: GFEntryRecord[],
): VerticalBarDatum[] {
  return picked.mode === "checkbox"
    ? aggregateCheckboxFieldToBars(picked.field, entries)
    : aggregateScalarChoiceFieldToBars(picked.field, entries);
}

/** Normalises Gravity Forms entries list payloads. */
export function normaliseGravityEntriesPayload(json: unknown): GFEntryRecord[] {
  if (!json || typeof json !== "object") return [];
  const o = json as Record<string, unknown>;
  const raw = o.entries;
  if (!Array.isArray(raw)) return [];
  return raw.filter((e): e is GFEntryRecord => e != null && typeof e === "object");
}

export function readTotalEntryCount(json: unknown): number {
  if (!json || typeof json !== "object") return 0;
  const o = json as Record<string, unknown>;
  const tc = o.total_count;
  if (typeof tc === "number" && Number.isFinite(tc)) return tc;
  if (typeof tc === "string") {
    const n = Number(tc);
    return Number.isFinite(n) ? n : 0;
  }
  return normaliseGravityEntriesPayload(json).length;
}
