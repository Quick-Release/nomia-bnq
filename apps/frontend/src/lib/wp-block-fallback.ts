export type WpUnsupportedFallbackMode = "saved-content" | "diagnostic";

export function resolveWpUnsupportedFallback(
  mode: WpUnsupportedFallbackMode,
  hasFallbackContent: boolean,
) {
  return mode === "diagnostic" || !hasFallbackContent ? "diagnostic" : "saved-content";
}
