/**
 * The interactive images the Interactive image block can show. Each one is a
 * site-owned graphic shipped with the Frontend; the block stores only its key.
 */
export const INTERACTIVE_IMAGE_KEYS = ["economia-circular"] as const;

export type InteractiveImageKey = (typeof INTERACTIVE_IMAGE_KEYS)[number];

/** A known key, or null for anything else (a removed or mistyped image). */
export function readInteractiveImageKey(value: unknown): InteractiveImageKey | null {
  return typeof value === "string" && (INTERACTIVE_IMAGE_KEYS as readonly string[]).includes(value)
    ? (value as InteractiveImageKey)
    : null;
}
