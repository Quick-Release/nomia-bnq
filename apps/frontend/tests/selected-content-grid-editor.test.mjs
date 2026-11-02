import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(
  new URL(
    "../../cms/web/app/plugins/gq-bioeconomia/blocks/selected-content-grid/index.js",
    import.meta.url,
  ),
  "utf8",
);
function boot() {
  let edit;
  let saved;
  const calls = [];
  const core = {
    getEntityRecords: () => [],
    isResolving: () => false,
    getResolutionError: () => null,
    getPostTypes: () => [],
  };
  const el = (type, props, ...children) => ({
    type,
    props: props || {},
    children: children.flat(Infinity),
  });
  const wp = {
    element: {
      createElement: el,
      Fragment: "fragment",
      useState: (initial) => [initial, () => {}],
      useEffect: () => {},
    },
    blockEditor: { InspectorControls: "inspector", useBlockProps: () => ({}) },
    components: Object.fromEntries(
      ["PanelBody", "SelectControl", "TextControl", "Button", "Spinner", "Notice"].map((key) => [
        key,
        key,
      ]),
    ),
    i18n: { __: (text) => text },
    data: {
      useSelect: (callback) => callback(() => core),
      resolveSelect: () => ({
        getEntityRecords: async (_kind, type) => {
          calls.push(type);
          return [
            {
              id: type.length,
              date: type === "podcasts" ? "2026-02-01" : "2026-01-01",
              link: `https://cms.example/${type}/latest/`,
              title: { raw: type },
            },
          ];
        },
      }),
    },
  };
  runInNewContext(source, {
    window: {
      wp,
      gqBioeconomiaEditor: {
        registerContractBlock: (_name, options) => {
          edit = options.edit;
        },
        buildPreviewUrl: () => "/preview",
        PreviewIframe: "preview",
      },
    },
    URL,
    setTimeout,
    clearTimeout,
  });
  const tree = edit({
    attributes: {},
    setAttributes: (attrs) => {
      saved = attrs;
    },
  });
  function nodes(node) {
    return [
      node,
      ...(node.children || []).flatMap((child) =>
        typeof child === "object" && child ? nodes(child) : [],
      ),
    ];
  }
  return { nodes: nodes(tree), calls, saved: () => saved };
}

test("the editor exposes five working searchable slots", () => {
  const { nodes } = boot();
  const slots = nodes.filter(
    (node) => typeof node.type === "function" && node.type.name === "Slot",
  );
  assert.equal(slots.length, 5);
  for (const slot of slots) assert.doesNotThrow(() => slot.type(slot.props));
});

test("fill latest chooses one item per group and the newest multimedia item", async () => {
  const editor = boot();
  const fill = editor.nodes.find(
    (node) => node.type === "Button" && node.props.onClick?.name === "fillLatest",
  );
  await fill.props.onClick();
  const items = editor.saved().items;
  assert.equal(items.length, 5);
  assert.deepEqual(
    Array.from(items, (item) => item.postType),
    ["post", "podcasts", "eventos", "oportunidades", "bases_de_dados"],
  );
  assert.equal(editor.calls.length, 10);
  assert.ok(items.every((item) => item.uri.startsWith("/")));
});
