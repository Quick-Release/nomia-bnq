import { presentationVariables } from "@getquick/content";

/** Serialize canonical variables for Astro wrappers while retaining native CSS. */
export function designPresentationStyle(
  name: string,
  attributes: Record<string, unknown> | null | undefined,
  nativeStyle?: string,
) {
  return (
    [
      nativeStyle,
      ...Object.entries(
        presentationVariables(name, attributes?.presentation, { attributes: attributes ?? {} }),
      ).map(([property, value]) => `${property}:${value}`),
    ]
      .filter(Boolean)
      .join(";") || undefined
  );
}
