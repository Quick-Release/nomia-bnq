import assert from "node:assert/strict";
import test from "node:test";
import { isLightHexColor } from "../src/lib/color-contrast.ts";
import {
  normalizeSectionBackground,
  readSectionHorizontalPadding,
  readSectionPaddingStep,
  sectionContrastClasses,
  sectionPaddingClasses,
} from "../src/lib/section-block.ts";
import { synchronizeStructuredBlocks } from "../scripts/sync-wp-plugin-contracts.mjs";

test("section backgrounds accept six-digit hex and nothing else", () => {
  assert.equal(normalizeSectionBackground("#00A499"), "#00a499");
  assert.equal(normalizeSectionBackground("  #00524d  "), "#00524d");
  assert.equal(normalizeSectionBackground("teal"), null);
  assert.equal(normalizeSectionBackground("#fff"), null);
  assert.equal(normalizeSectionBackground(undefined), null);
});

test("section text contrast follows the background luminance", () => {
  // Dark brand surfaces take white copy, light ones take black.
  assert.equal(isLightHexColor("#003333"), false);
  assert.equal(isLightHexColor("#00524d"), false);
  assert.equal(isLightHexColor("#444444"), false);
  assert.equal(isLightHexColor("#00a499"), true);
  assert.equal(isLightHexColor("#a4d663"), true);
  assert.equal(isLightHexColor("#ffffff"), true);
});

test("contrast classes never leave body copy the same colour as its surface", () => {
  assert.match(sectionContrastClasses(true), /text-neutral-bw-black/);
  assert.doesNotMatch(sectionContrastClasses(true), /text-neutral-bw-white/);
  assert.match(sectionContrastClasses(false), /text-neutral-bw-white/);
  assert.doesNotMatch(sectionContrastClasses(false), /text-neutral-bw-black/);
});

test("padding steps fall back to the default when content stores anything else", () => {
  assert.equal(readSectionPaddingStep("large", "medium"), "large");
  assert.equal(readSectionPaddingStep("huge", "medium"), "medium");
  assert.equal(readSectionPaddingStep(undefined, "none"), "none");
  assert.equal(readSectionHorizontalPadding("none"), "none");
  assert.equal(readSectionHorizontalPadding(12), "default");
});

test("padding steps resolve to responsive classes, and none emits nothing", () => {
  assert.deepEqual(
    sectionPaddingClasses({ paddingTop: "medium", paddingBottom: "small", paddingX: "default" }),
    ["pt-16 md:pt-24", "pb-8 md:pb-12", "px-4 md:px-16"],
  );
  assert.deepEqual(
    sectionPaddingClasses({ paddingTop: "none", paddingBottom: "none", paddingX: "none" }),
    [],
  );
});

test("the section block is the registered container and carries the flag to both adapters", async () => {
  const { registrations, outputs } = await synchronizeStructuredBlocks({ operation: "check" });
  const section = registrations.find(
    (registration) => registration.identity.blockName === "getquick/section",
  );

  assert.ok(section);
  assert.equal(section.container, true);
  assert.equal(section.editor.module, "Section.jsx");
  assert.deepEqual(section.attributes.paddingTop.enum, ["none", "small", "medium", "large"]);
  assert.deepEqual(section.attributes.paddingX.enum, ["none", "small", "default"]);

  const pluginContracts = JSON.parse(
    outputs.get("../cms/web/app/plugins/nomia-blocks/src/contracts.json"),
  );
  const pluginSection = pluginContracts.find(
    (contract) => contract.blockName === "getquick/section",
  );
  assert.equal(pluginSection.container, true);

  // Every other block stays attribute-only, so `save()` keeps returning null.
  assert.deepEqual(
    pluginContracts.filter((contract) => contract.container).map((c) => c.blockName),
    ["getquick/section"],
  );
});

test("the generated dispatcher forwards nested blocks to container renderers", async () => {
  const { outputs } = await synchronizeStructuredBlocks({ operation: "check" });
  const dispatcher = outputs.get("src/components/wp-blocks/WpCustomBlock.astro");

  assert.match(
    dispatcher,
    /<Renderer block=\{renderedBlock\} pageFeaturedImage=\{pageFeaturedImage\}>/,
  );
  assert.match(dispatcher, /"getquick\/section": SectionBlock,/);
});
