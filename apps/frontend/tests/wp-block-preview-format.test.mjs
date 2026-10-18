import assert from "node:assert/strict";
import test from "node:test";

import {
  PREVIEW_MAX_HEIGHT,
  PREVIEW_MIN_HEIGHT,
  PREVIEW_RESIZE_MESSAGE_TYPE,
  buildPreviewResizeMessage,
  buildPreviewUrl,
  getPreviewOrigin,
  getPreviewParentOrigin,
  normalizePreviewHeight,
  parsePreviewRequest,
  parsePreviewResizeEvent,
  parsePreviewResizeMessage,
  registerPreviewResizeListener,
} from "../src/lib/wp-block-preview-format.ts";

const getquickPreviewUrl = "https://nomia.example/wp-block-preview";

function params(values) {
  return new URLSearchParams(values);
}

test("buildPreviewUrl writes the canonical UTF-8 base64url preview protocol", () => {
  const url = new URL(
    buildPreviewUrl({
      baseUrl: "https://nomia.example/editor",
      blockName: "getquick/title-with-label",
      attributes: { label: "Pré-visualização — é" },
      previewToken: " secret-token ",
    }),
  );

  assert.equal(
    url.href,
    `${getquickPreviewUrl}?block=getquick%2Ftitle-with-label&attrs64=eyJsYWJlbCI6IlByw6ktdmlzdWFsaXphw6fDo28g4oCUIMOpIn0&previewToken=secret-token`,
  );

  const request = parsePreviewRequest(url.searchParams);
  assert.deepEqual(request, {
    blockName: "getquick/title-with-label",
    previewToken: "secret-token",
    attributes: {
      ok: true,
      source: "attrs64",
      attributes: { label: "Pré-visualização — é" },
    },
  });
});

test("parsePreviewRequest retains the legacy raw JSON and parameter aliases", () => {
  const request = parsePreviewRequest(
    params({
      name: " getquick/title-with-label ",
      attrs: JSON.stringify({ title: "Olá", items: [{ label: "ação" }] }),
      token: "legacy-token",
    }),
  );

  assert.deepEqual(request, {
    blockName: "getquick/title-with-label",
    previewToken: "legacy-token",
    attributes: {
      ok: true,
      source: "attrs",
      attributes: { title: "Olá", items: [{ label: "ação" }] },
    },
  });
});

test("parsePreviewRequest reports malformed attributes instead of silently using an empty object", () => {
  const invalidBase64 = parsePreviewRequest(
    params({ block: "getquick/example", attrs64: "not valid" }),
  );
  assert.deepEqual(invalidBase64.attributes, {
    ok: false,
    source: "attrs64",
    error: "invalid-base64",
    attributes: {},
  });

  const invalidPadding = parsePreviewRequest(params({ block: "getquick/example", attrs64: "AA=" }));
  assert.deepEqual(invalidPadding.attributes, {
    ok: false,
    source: "attrs64",
    error: "invalid-base64",
    attributes: {},
  });

  const invalidJson = parsePreviewRequest(
    params({ block: "getquick/example", attrs64: "bm90LWpzb24" }),
  );
  assert.deepEqual(invalidJson.attributes, {
    ok: false,
    source: "attrs64",
    error: "invalid-json",
    attributes: {},
  });

  const invalidShape = parsePreviewRequest(
    params({ block: "getquick/example", attrs64: "bnVsbA" }),
  );
  assert.deepEqual(invalidShape.attributes, {
    ok: false,
    source: "attrs64",
    error: "invalid-object",
    attributes: {},
  });
});

test("parsePreviewRequest allows a block with no attributes", () => {
  assert.deepEqual(parsePreviewRequest(params({ block: "getquick/example" })), {
    blockName: "getquick/example",
    previewToken: null,
    attributes: {
      ok: true,
      source: "none",
      attributes: {},
    },
  });
});

test("preview resize events enforce the trusted iframe origin and source", () => {
  const source = {};
  const event = {
    origin: "https://nomia.example",
    source,
    data: { type: PREVIEW_RESIZE_MESSAGE_TYPE, height: "640" },
  };
  const target = { expectedOrigin: "https://nomia.example", source };

  assert.equal(parsePreviewResizeEvent(event, target), 640);
  assert.equal(parsePreviewResizeEvent({ ...event, origin: "https://evil.example" }, target), null);
  assert.equal(parsePreviewResizeEvent({ ...event, source: {} }, target), null);
  assert.equal(parsePreviewResizeEvent({ ...event, source: null }, target), null);
  assert.equal(
    parsePreviewResizeEvent(
      { ...event, data: { type: PREVIEW_RESIZE_MESSAGE_TYPE, height: "invalid" } },
      target,
    ),
    null,
  );
});

test("preview resize messages and origins use the shared protocol helpers", () => {
  assert.deepEqual(buildPreviewResizeMessage(639.2), {
    type: PREVIEW_RESIZE_MESSAGE_TYPE,
    height: 640,
  });
  assert.equal(buildPreviewResizeMessage(0), null);
  assert.equal(getPreviewOrigin("https://nomia.example/editor"), "https://nomia.example");
  assert.equal(
    getPreviewParentOrigin("https://wordpress.example/wp-admin/post.php"),
    "https://wordpress.example",
  );
  assert.equal(getPreviewParentOrigin(""), "*");
  assert.equal(getPreviewParentOrigin("not a URL"), "*");
});

test("preview resize listener owns registration, dispatch, and cleanup", () => {
  const source = {};
  let listener;
  let removed = false;
  const eventTarget = {
    addEventListener(type, nextListener) {
      assert.equal(type, "message");
      listener = nextListener;
    },
    removeEventListener(type, nextListener) {
      assert.equal(type, "message");
      assert.equal(nextListener, listener);
      removed = true;
    },
  };
  const target = { expectedOrigin: "https://nomia.example", source };
  const heights = [];
  const unsubscribe = registerPreviewResizeListener(
    eventTarget,
    () => target,
    (height) => heights.push(height),
  );

  listener({
    origin: "https://nomia.example",
    source,
    data: { type: PREVIEW_RESIZE_MESSAGE_TYPE, height: 480 },
  });
  listener({
    origin: "https://evil.example",
    source,
    data: { type: PREVIEW_RESIZE_MESSAGE_TYPE, height: 640 },
  });
  unsubscribe();

  assert.deepEqual(heights, [480]);
  assert.equal(removed, true);
});

test("preview resize parsing owns message validation and height limits", () => {
  assert.equal(
    parsePreviewResizeMessage({
      type: PREVIEW_RESIZE_MESSAGE_TYPE,
      height: PREVIEW_MIN_HEIGHT - 1,
    }),
    PREVIEW_MIN_HEIGHT,
  );
  assert.equal(
    parsePreviewResizeMessage({
      type: PREVIEW_RESIZE_MESSAGE_TYPE,
      height: PREVIEW_MAX_HEIGHT + 1,
    }),
    PREVIEW_MAX_HEIGHT,
  );
  assert.equal(
    parsePreviewResizeMessage({
      type: PREVIEW_RESIZE_MESSAGE_TYPE,
      height: "640",
    }),
    640,
  );
  assert.equal(parsePreviewResizeMessage({ type: "other", height: 640 }), null);
  assert.equal(parsePreviewResizeMessage({ type: PREVIEW_RESIZE_MESSAGE_TYPE, height: 0 }), null);
  assert.equal(parsePreviewResizeMessage(null), null);
  assert.equal(normalizePreviewHeight("not a number"), null);
});
