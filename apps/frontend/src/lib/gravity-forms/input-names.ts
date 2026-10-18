import type { GFField, GFInput } from "./types";

/** Gravity Forms REST / HTML input names: `input_3`, `input_4_3`, … */
export function gfInputKeyFromInputId(compositeId: string): string {
  return `input_${compositeId.replace(/\./g, "_")}`;
}

export function listInputKeysForField(field: GFField): string[] {
  if (field.inputs?.length) {
    return field.inputs.filter((i) => !i.isHidden).map((i) => inputKeyFromSubInput(field.id, i));
  }
  return [`input_${field.id}`];
}

export function inputKeyFromSubInput(fieldId: number, input: GFInput): string {
  if (input.name?.startsWith("input_")) return input.name;
  if (input.id !== undefined && input.id !== "") return gfInputKeyFromInputId(String(input.id));
  return `input_${fieldId}`;
}

/**
 * Gravity Forms REST entry objects use keys like `"6"` or `"6.1"`, not `input_6_1`.
 * Maps wizard/submit keys from {@link inputKeyFromSubInput} to entry property keys.
 */
export function gfEntryPropertyKeyFromSubmitKey(submitKey: string): string {
  if (!submitKey.startsWith("input_")) return submitKey;
  const rest = submitKey.slice("input_".length);
  const segs = rest.split("_");
  if (segs.length >= 2) return `${segs[0]}.${segs.slice(1).join(".")}`;
  return rest;
}

export function isRenderableFieldType(type: string): boolean {
  return !["page", "captcha"].includes(type);
}

export function isStructuralOnlyType(type: string): boolean {
  return type === "page";
}
