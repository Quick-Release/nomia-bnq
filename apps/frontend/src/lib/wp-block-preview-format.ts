export const PREVIEW_PATH = "/wp-block-preview";
export const PREVIEW_RESIZE_MESSAGE_TYPE = "gq-bioeconomia-block-preview:resize";
export const PREVIEW_DEFAULT_HEIGHT = 320;
export const PREVIEW_MIN_HEIGHT = 160;
export const PREVIEW_MAX_HEIGHT = 4000;

export type PreviewAttributes = Record<string, unknown>;
export type PreviewAttributeSource = "none" | "attrs" | "attrs64";
export type PreviewAttributeError = "invalid-base64" | "invalid-json" | "invalid-object";

export type PreviewAttributesResult =
  | {
      ok: true;
      source: PreviewAttributeSource;
      attributes: PreviewAttributes;
    }
  | {
      ok: false;
      source: Exclude<PreviewAttributeSource, "none">;
      error: PreviewAttributeError;
      attributes: PreviewAttributes;
    };

export type PreviewRequest = {
  blockName: string | null;
  previewToken: string | null;
  attributes: PreviewAttributesResult;
};

export type PreviewUrlOptions = {
  baseUrl: string | URL;
  path?: string;
  blockName: string;
  attributes: PreviewAttributes;
  previewToken?: string | null;
};

export function getPreviewOrigin(baseUrl: string | URL) {
  return new URL(baseUrl).origin;
}

export function getPreviewParentOrigin(referrer: string) {
  if (!referrer) return "*";

  try {
    return getPreviewOrigin(referrer);
  } catch {
    return "*";
  }
}

type PreviewResizeEvent = Pick<MessageEvent, "origin" | "source" | "data">;
type PreviewResizeTarget = { expectedOrigin: string; source: unknown };
type PreviewResizeEventTarget = Pick<Window, "addEventListener" | "removeEventListener">;

type PreviewSearchParams = {
  get(name: string): string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function invalidAttributes(
  source: Exclude<PreviewAttributeSource, "none">,
  error: PreviewAttributeError,
) {
  return {
    ok: false as const,
    source,
    error,
    attributes: {},
  };
}

function parseJsonAttributes(raw: string, source: Exclude<PreviewAttributeSource, "none">) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return invalidAttributes(source, "invalid-json");
  }

  return isRecord(parsed)
    ? { ok: true as const, source, attributes: parsed }
    : invalidAttributes(source, "invalid-object");
}

function decodeBase64UrlJson(raw: string, source: "attrs64") {
  const match = /^([A-Za-z0-9_-]+)(={0,2})$/u.exec(raw);
  const unpadded = match?.[1] ?? "";
  const padding = match?.[2] ?? "";
  const remainder = unpadded.length % 4;
  const requiresPadding = remainder > 0 ? 4 - remainder : 0;
  if (!match || remainder === 1 || (padding.length > 0 && padding.length !== requiresPadding)) {
    return invalidAttributes(source, "invalid-base64");
  }

  try {
    const normalized = unpadded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(unpadded.length + requiresPadding, "=");
    const binary = globalThis.atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return parseJsonAttributes(json, source);
  } catch {
    return invalidAttributes(source, "invalid-base64");
  }
}

export function buildPreviewUrl({
  baseUrl,
  path = PREVIEW_PATH,
  blockName,
  attributes,
  previewToken,
}: PreviewUrlOptions) {
  const url = new URL(path, baseUrl);
  url.searchParams.set("block", blockName);
  url.searchParams.set("attrs64", encodeBase64UrlJson(attributes));

  const token = previewToken?.trim();
  if (token) url.searchParams.set("previewToken", token);

  return url.toString();
}

function encodeBase64UrlJson(attributes: PreviewAttributes) {
  const bytes = new TextEncoder().encode(JSON.stringify(attributes));
  let binary = "";

  for (const byte of bytes) binary += String.fromCharCode(byte);

  return globalThis.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

export function parsePreviewRequest(searchParams: PreviewSearchParams): PreviewRequest {
  const blockName = searchParams.get("block")?.trim() || searchParams.get("name")?.trim() || null;
  const previewToken =
    searchParams.get("previewToken")?.trim() || searchParams.get("token")?.trim() || null;
  const attrs64 = searchParams.get("attrs64");
  const attrs = searchParams.get("attrs");
  const attributes =
    attrs64 !== null
      ? decodeBase64UrlJson(attrs64, "attrs64")
      : attrs !== null
        ? parseJsonAttributes(attrs, "attrs")
        : { ok: true as const, source: "none" as const, attributes: {} };

  return { blockName, previewToken, attributes };
}

export function normalizePreviewHeight(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") return null;

  const height = Number(value);
  if (!Number.isFinite(height) || height <= 0) return null;

  return Math.min(PREVIEW_MAX_HEIGHT, Math.max(PREVIEW_MIN_HEIGHT, Math.ceil(height)));
}

export function buildPreviewResizeMessage(value: unknown) {
  const height = normalizePreviewHeight(value);
  return height === null ? null : ({ type: PREVIEW_RESIZE_MESSAGE_TYPE, height } as const);
}

export function parsePreviewResizeMessage(data: unknown) {
  if (!isRecord(data) || data.type !== PREVIEW_RESIZE_MESSAGE_TYPE) return null;
  return normalizePreviewHeight(data.height);
}

export function parsePreviewResizeEvent(
  event: PreviewResizeEvent,
  target: PreviewResizeTarget | null | undefined,
) {
  if (
    !target ||
    !event.source ||
    event.origin !== target.expectedOrigin ||
    event.source !== target.source
  ) {
    return null;
  }

  return parsePreviewResizeMessage(event.data);
}

export function registerPreviewResizeListener<T extends PreviewResizeTarget>(
  eventTarget: PreviewResizeEventTarget,
  resolveTarget: (event: PreviewResizeEvent) => T | null | undefined,
  onResize: (height: number, target: T) => void,
) {
  const onMessage = (event: MessageEvent) => {
    const target = resolveTarget(event);
    const height = parsePreviewResizeEvent(event, target);
    if (target && height !== null) onResize(height, target);
  };

  eventTarget.addEventListener("message", onMessage);
  return () => eventTarget.removeEventListener("message", onMessage);
}
