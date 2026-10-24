import assert from "node:assert/strict";
import test from "node:test";

import {
  linkKeys,
  pluginContract,
  synchronizeStructuredBlocks,
  validateRegistrations,
} from "../scripts/sync-wp-plugin-contracts.mjs";

const synchronized = synchronizeStructuredBlocks({ operation: "check" });

test("legacy synchronization options cannot silently generate files", async () => {
  await assert.rejects(
    synchronizeStructuredBlocks({ check: true }),
    /Unknown generation option.*check/,
  );
});

test("structured block registration is the single generated source", async () => {
  const { registrations, outputs } = await synchronized;

  assert.equal(registrations.length, 40);
  assert.deepEqual(
    registrations.map((registration) => registration.identity.order),
    Array.from({ length: 40 }, (_value, index) => index + 1),
  );
  assert.ok(outputs.has("src/components/wp-blocks/WpCustomBlock.astro"));
  assert.ok(outputs.has("src/fixtures/wp-custom-block-fixtures.ts"));
  assert.ok(outputs.has("../cms/web/app/plugins/gq-bioeconomia/src/Contracts.php"));
  assert.ok(outputs.has("../cms/web/app/plugins/gq-bioeconomia/blocks/blocks-manifest.php"));
  assert.ok(outputs.has("../cms/web/app/plugins/gq-bioeconomia/assets/frontend-rules.js"));
  for (const registration of registrations) {
    const block = `../cms/web/app/plugins/gq-bioeconomia/blocks/${registration.identity.catalogId}`;
    assert.ok(outputs.has(`${block}/block.json`));
    // A bespoke editor's script is hand-written; every other block's is generated.
    assert.equal(outputs.has(`${block}/index.js`), !registration.editor.bespoke);
  }
});

test("every block ships standard block.json metadata", async () => {
  const { registrations, outputs } = await synchronized;

  for (const registration of registrations) {
    const metadata = JSON.parse(
      outputs.get(
        `../cms/web/app/plugins/gq-bioeconomia/blocks/${registration.identity.catalogId}/block.json`,
      ),
    );
    assert.equal(metadata.$schema, "https://schemas.wp.org/trunk/block.json");
    assert.equal(metadata.apiVersion, 3);
    assert.equal(metadata.name, registration.identity.blockName);
    assert.equal(metadata.title, registration.editor.title);
    assert.equal(metadata.textdomain, "gq-bioeconomia");
    assert.equal(metadata.supports.inserter, registration.lifecycle.inserter);
    // GQ Design's category; PHP registers the block's own editor script.
    assert.equal(metadata.category, "getquick-design");
    assert.equal(metadata.editorScript, undefined);
    assert.ok([metadata.editorStyle].flat().includes("gq-bioeconomia-editor"));
    assert.deepEqual(Object.keys(metadata.attributes), Object.keys(registration.attributes));
    // Contract-only hints never reach WordPress's attribute schema.
    assert.doesNotMatch(JSON.stringify(metadata.attributes), /"(ui|legacyReads)":/);
  }
});

test("title with label stores typography as design tokens, not measurements", async () => {
  const { registrations } = await synchronized;
  const block = registrations.find(
    (registration) => registration.identity.blockName === "getquick/title-with-label",
  );

  assert.ok(block);
  const { typography } = block.attributes;
  assert.equal(typography.type, "object");
  assert.equal(typography.additionalProperties, false);
  assert.deepEqual(Object.keys(typography.properties), ["label", "titleLine1", "titleLine2"]);
  for (const field of Object.values(typography.properties)) {
    assert.equal(field.additionalProperties, false);
    assert.ok(field.properties.size.enum.includes("h4"));
    assert.ok(field.properties.lineHeight.enum.includes("f"));
  }
  assert.deepEqual(
    Object.keys(block.attributes).filter((name) => /(FontSize|LineHeight)$/.test(name)),
    [],
  );
  assert.deepEqual(Object.keys(block.compatibility.legacyReads).sort(), [
    "labelBold",
    "labelFontSize",
    "labelItalic",
    "labelLineHeight",
    "titleLine1Bold",
    "titleLine1FontSize",
    "titleLine1Italic",
    "titleLine1LineHeight",
    "titleLine2Bold",
    "titleLine2FontSize",
    "titleLine2Italic",
    "titleLine2LineHeight",
  ]);
});

test("canonical attributes and compatibility reads remain distinct", async () => {
  const { registrations } = await synchronized;
  const pageHero = registrations.find(
    (registration) => registration.identity.blockName === "getquick/page-hero-static",
  );

  assert.ok(pageHero);
  assert.equal(pageHero.attributes.imageSrc.type, "string");
  assert.equal(pageHero.attributes.ctaHref.type, "string");
  assert.equal(pageHero.attributes.imageUrl, undefined);
  assert.equal(pageHero.attributes.ctaUrl, undefined);
  assert.deepEqual(pageHero.compatibility.legacyReads, {
    ctaUrl: "string",
    imageUrl: "string",
    hideCta: "boolean",
  });
});

test("page hero stores only the intentional text presentation overrides", async () => {
  const { registrations } = await synchronized;
  const hero = registrations.find(
    (registration) => registration.identity.blockName === "getquick/page-hero-static",
  );

  assert.ok(hero);
  for (const attributeName of ["backgroundColor", "heroHeight"]) {
    assert.equal(
      hero.attributes[attributeName],
      undefined,
      `getquick/page-hero-static still stores ${attributeName}`,
    );
  }
  for (const attributeName of ["titleTextFontSize", "subtitleTextFontSize"]) {
    assert.deepEqual(hero.attributes[attributeName], {
      type: "number",
      ui: { kind: "number" },
    });
  }
  for (const attributeName of ["titleTextColor", "subtitleTextColor"]) {
    assert.deepEqual(hero.attributes[attributeName], {
      type: "string",
      default: "",
      ui: { kind: "text" },
    });
  }
});

test("the static page hero stores text alignment as one of three named sides", async () => {
  const { registrations } = await synchronized;
  const hero = registrations.find(
    (registration) => registration.identity.blockName === "getquick/page-hero-static",
  );

  assert.ok(hero);
  assert.deepEqual(hero.attributes.textAlign, {
    type: "string",
    default: "left",
    enum: ["left", "center", "right"],
    ui: { kind: "select" },
  });
});

test("the static page hero stores height as a named step, never a measurement", async () => {
  const { registrations } = await synchronized;
  const hero = registrations.find(
    (registration) => registration.identity.blockName === "getquick/page-hero-static",
  );

  assert.ok(hero);
  assert.equal(hero.attributes.height.type, "string");
  assert.deepEqual(hero.attributes.height.enum, ["xs", "s", "m", "l", "xl"]);
  assert.equal(hero.attributes.height.default, "xl");
  assert.equal(hero.attributes.height.ui.kind, "select");
});

test("repeaters expose block-owned row contracts and canonical array writes", async () => {
  const { registrations, outputs } = await synchronized;
  const library = registrations.find(
    (registration) => registration.identity.blockName === "getquick/library-grid",
  );

  assert.ok(library);
  assert.equal(library.attributes.items, undefined);
  assert.equal(library.compatibility.legacyReads.items, "array");
  assert.deepEqual(Object.keys(library.attributes.cards.items.properties), [
    "title",
    "tag",
    "imageId",
    "imageSrc",
    "imageAlt",
    "href",
    "tagKind",
  ]);
  assert.deepEqual(library.attributes.cards.items.required, ["title", "tag", "imageSrc", "href"]);
  assert.deepEqual(library.attributes.cards.items.properties.imageSrc.legacyReads, ["imageUrl"]);
  assert.deepEqual(library.attributes.cards.items.properties.tagKind.enum, [
    "bioeconomia",
    "economia",
  ]);

  const artifact = JSON.parse(outputs.get("data/structured-block-contracts.json"));
  const contract = artifact.contracts.find((item) => item.blockName === "getquick/library-grid");
  assert.deepEqual(contract.attributes.cards.items.properties.href.ui, { kind: "url" });
  assert.deepEqual(contract.compatibilityReads.items, "array");
});

test("all declared array attributes carry an item contract", async () => {
  const { registrations } = await synchronized;

  for (const registration of registrations) {
    for (const [attributeName, schema] of Object.entries(registration.attributes)) {
      if (schema.type !== "array") continue;
      assert.ok(
        schema.items,
        `${registration.identity.blockName}.${attributeName} has no item schema`,
      );
      if (schema.items.type === "object") {
        assert.equal(typeof schema.items.properties, "object");
        for (const required of schema.items.required ?? []) {
          assert.ok(required in schema.items.properties);
        }
      }
    }
  }
});

test("media fields have paired uploader IDs and previews contain canonical content", async () => {
  const { registrations } = await synchronized;

  for (const registration of registrations) {
    assert.ok(
      Object.keys(registration.renderer.preview.attributes).length > 0,
      `${registration.identity.blockName} has no editor preview content`,
    );

    const visit = (properties, path) => {
      for (const [name, schema] of Object.entries(properties)) {
        if (schema.ui?.kind === "media") {
          const idName = name.replace(/(Src|Url)$/, "Id");
          assert.ok(idName in properties, `${path}.${name} needs paired ${path}.${idName}`);
        }
        if (schema.type === "array" && schema.items?.type === "object") {
          visit(schema.items.properties, `${path}.${name}.items`);
        }
      }
    };

    visit(registration.attributes, registration.identity.blockName);
  }
});

test("legacy lifecycle drives both Gutenberg adapters", async () => {
  const { registrations } = await synchronized;
  const legacy = registrations.find(
    (registration) => registration.identity.blockName === "getquick/circular-economy-overview",
  );
  const pluginContracts = registrations.map(pluginContract);
  const pluginLegacy = pluginContracts.find(
    (contract) => contract.blockName === legacy.identity.blockName,
  );

  assert.equal(legacy.lifecycle.status, "legacy");
  assert.equal(legacy.lifecycle.inserter, false);
  assert.equal(pluginLegacy.status, "legacy");
  assert.equal(pluginLegacy.inserter, false);
});

test("mechanical documentation is generated without replacing prose", async () => {
  const { outputs } = await synchronized;
  const documentation = outputs.get("docs/gutenberg-blocks/nomia-contact-map.md");

  assert.match(documentation, /BEGIN GENERATED: structured-block-metadata/);
  assert.match(documentation, /BEGIN GENERATED: structured-block-contract/);
  assert.match(documentation, /### Legacy compatibility reads/);
  assert.match(documentation, /Contact-page map block\. Editors paste a Google Maps link/);
});

test("machine adapter exposes the public content contract without implementation references", async () => {
  const { outputs } = await synchronized;
  const artifact = JSON.parse(outputs.get("data/structured-block-contracts.json"));
  const pageHero = artifact.contracts.find(
    (contract) => contract.blockName === "getquick/page-hero-static",
  );

  assert.equal(artifact.schemaVersion, 1);
  assert.equal(artifact.source, "apps/web");
  assert.equal(artifact.contracts.length, 40);
  assert.deepEqual(
    artifact.contracts.map((contract) => contract.order),
    Array.from({ length: 40 }, (_value, index) => index + 1),
  );
  for (const contract of artifact.contracts) {
    assert.equal(typeof contract.editorTitle, "string");
    assert.equal(typeof contract.editorDescription, "string");
    assert.equal(typeof contract.editorIcon, "string");
    assert.ok(["inline-fields", "preview"].includes(contract.editorExperience));
    assert.equal(typeof contract.attributes, "object");
    assert.equal(typeof contract.compatibilityReads, "object");
    for (const internalField of ["renderer", "preview", "documentation", "editorModule"]) {
      assert.equal(contract[internalField], undefined);
    }
  }
  assert.deepEqual(pageHero.attributes.imageSrc, {
    type: "string",
    default: "",
    ui: { kind: "media" },
  });
  assert.deepEqual(pageHero.compatibilityReads, {
    ctaUrl: "string",
    imageUrl: "string",
    hideCta: "boolean",
  });
  assert.equal(pageHero.status, "active");
  assert.equal(pageHero.inserter, true);
  assert.equal(pageHero.editorTitle, "Cabeçalho página com imagem");
  assert.equal(pageHero.editorExperience, "preview");
});

test("HTTP content contract is identical to the machine adapter", async () => {
  const { GET } = await import("../src/pages/api/wp-block-contracts.json.ts");
  const { outputs } = await synchronized;
  const expected = JSON.parse(outputs.get("data/structured-block-contracts.json"));
  const response = GET();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.equal(response.headers.get("cache-control"), "public, max-age=300");
  assert.deepEqual(await response.json(), expected);
});

function attributeNames(attributes, predicate, names = new Set()) {
  for (const [name, schema] of Object.entries(attributes ?? {})) {
    if (predicate(schema)) {
      names.add(name);
      for (const legacy of schema.legacyReads ?? []) names.add(legacy);
    }
    attributeNames(schema?.properties, predicate, names);
    attributeNames(schema?.items?.properties, predicate, names);
  }
  return names;
}

test("every URL attribute is a filtered link key and no media attribute is", async () => {
  const { registrations } = await synchronized;

  for (const registration of registrations) {
    const keys = new Set(linkKeys(registration));
    const label = registration.identity.blockName;
    for (const name of attributeNames(
      registration.attributes,
      (schema) => schema?.ui?.kind === "url",
    )) {
      assert.ok(keys.has(name), `${label} ${name} is not filtered`);
    }
    // Filtering by key name must not reach an image source of the same block.
    for (const name of attributeNames(
      registration.attributes,
      (schema) => schema?.ui?.kind === "media",
    )) {
      assert.ok(!keys.has(name), `${label} ${name} is media but filtered as a link`);
    }
  }
});

test("legacy links must be attribute key names", async () => {
  const { registrations } = await synchronized;
  const [first] = registrations;

  for (const legacyLinks of [["items[].href"], [""], "ctaUrl"]) {
    assert.throws(
      () =>
        validateRegistrations([
          { ...first, compatibility: { legacyReads: {}, ...first.compatibility, legacyLinks } },
        ]),
      /legacy links must be attribute key names/,
    );
  }
});
