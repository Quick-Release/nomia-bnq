// gq-bioeconomia ships its editor scripts as written, the way GQ Design does:
// plain scripts on WordPress's `window.wp` globals, with no build step. These
// tests load them in the order WordPress does (`Blocks\EditorAssets`, then
// each block's `blocks/<id>/index.js`) against stub WordPress packages, and
// hold them to GQ Design's lint and format rules, which `pnpm lint` (the
// Frontend's) doesn't cover.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import vm from "node:vm";

const plugin = new URL("../apps/cms/web/app/plugins/gq-bioeconomia/", import.meta.url).pathname;
const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(plugin, path), "utf8");

const blocks = globSync("blocks/*/block.json", { cwd: plugin }).map((path) => {
  const metadata = JSON.parse(read(path));
  return {
    blockName: metadata.name,
    catalogId: path.split("/")[1],
    attributes: metadata.attributes,
  };
});

// A WordPress package whose every export is a stub; `registerBlockType` and
// friends record their calls.
function wordpress(calls) {
  const record =
    (name) =>
    (...args) => {
      calls.push([name, ...args]);
    };
  const recorded = new Set(["registerBlockType", "registerBlockVariation", "registerPlugin"]);
  const stub = (name) => (recorded.has(name) ? record(name) : () => undefined);
  const pkg = () => new Proxy({}, { get: (_, name) => stub(String(name)) });
  return new Proxy({}, { get: () => pkg() });
}

// A shared editor global that throws on a name it doesn't export, so a script
// destructuring something its dependency lacks fails here, not in the editor.
function strict(name, value) {
  return new Proxy(value, {
    get(target, key) {
      if (typeof key === "string" && !(key in target)) throw new Error(`${name} has no ${key}`);
      return target[key];
    },
  });
}

function loadEditor() {
  const calls = [];
  const window = { wp: wordpress(calls) };
  window.gqBioeconomiaSettings = { frontendBaseUrl: "https://example.com/", previewToken: "" };
  window.gqBioeconomiaContracts = blocks;
  const context = vm.createContext({ window, console, setTimeout, clearTimeout });
  const run = (path) => vm.runInContext(read(path), context, { filename: path });

  run("assets/frontend-rules.js");
  window.gqBioeconomiaFrontendRules = strict(
    "gqBioeconomiaFrontendRules",
    context.gqBioeconomiaFrontendRules,
  );
  run("assets/editor-lib.js");
  window.gqBioeconomiaLib = strict("gqBioeconomiaLib", window.gqBioeconomiaLib);
  run("assets/editor.js");
  window.gqBioeconomiaEditor = strict(
    "gqBioeconomiaEditor",
    window.gqBioeconomiaEditor,
  );
  run("assets/document-settings.js");
  for (const { catalogId } of blocks) run(`blocks/${catalogId}/index.js`);

  return calls;
}

test("every block's script registers that block, once", () => {
  const registered = loadEditor()
    .filter(([name]) => name === "registerBlockType")
    .map(([, blockName]) => blockName);

  assert.deepEqual(
    registered,
    blocks.map(({ blockName }) => blockName),
  );
});

test("blocks register only their editor behavior: the rest is block.json's", () => {
  for (const [name, blockName, settings] of loadEditor()) {
    if (name !== "registerBlockType") continue;
    const keys = Object.keys(settings).filter((key) => key !== "deprecated");
    assert.deepEqual(keys, ["edit", "save"], blockName);
  }
});

test("the title with label keeps its deprecations", () => {
  const [, , settings] = loadEditor().find(
    ([name, blockName]) =>
      name === "registerBlockType" && blockName === "getquick/title-with-label",
  );
  assert.ok(Array.isArray(settings.deprecated) && settings.deprecated.length > 0);
});

test("the document settings add the page background panel and the button variation", () => {
  const calls = loadEditor();
  assert.ok(
    calls.some(
      ([name, id]) => name === "registerPlugin" && id === "gq-bioeconomia-page-background",
    ),
  );
  assert.ok(
    calls.some(([name, block]) => name === "registerBlockVariation" && block === "core/button"),
  );
});

test("the plugin's scripts and styles pass GQ Design's lint and format rules", () => {
  const vp = join(root, "node_modules/.bin/vp");
  execFileSync(vp, ["lint", "--deny-warnings", plugin], { cwd: root, stdio: "pipe" });
  execFileSync(vp, ["fmt", "--check", join(plugin, "assets"), join(plugin, "blocks")], {
    cwd: root,
    stdio: "pipe",
  });
});

test("the scripts name nothing undefined: without a bundler, nothing else would catch it", () => {
  const browserGlobals = new Set(["window", "setTimeout", "clearTimeout"]);
  const scripts = [
    ...globSync("assets/*.js", { cwd: plugin }).filter(
      (path) => !path.endsWith("frontend-rules.js"),
    ),
    ...globSync("blocks/*/index.js", { cwd: plugin }),
  ].map((path) => join(plugin, path));
  let output = "";
  try {
    output = execFileSync(
      join(root, "node_modules/.bin/vp"),
      ["lint", "-D", "no-undef", ...scripts],
      {
        cwd: root,
        encoding: "utf8",
        stdio: "pipe",
      },
    );
  } catch (error) {
    output = `${error.stdout}${error.stderr}`;
  }
  const undefinedNames = [...output.matchAll(/'([^']+)' is not defined/g)]
    .map(([, name]) => name)
    .filter((name) => !browserGlobals.has(name));
  assert.deepEqual(undefinedNames, []);
});
