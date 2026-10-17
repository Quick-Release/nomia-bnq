import {
  SECTION_BACKGROUND_POSITION_DEFAULT,
  SECTION_BACKGROUND_POSITIONS,
  SECTION_BACKGROUND_SIZE_DEFAULT,
  SECTION_BACKGROUND_SIZES,
  SECTION_HORIZONTAL_PADDINGS,
  SECTION_PADDING_BOTTOM_DEFAULT,
  SECTION_PADDING_STEPS,
  SECTION_PADDING_TOP_DEFAULT,
  SECTION_PADDING_X_DEFAULT,
} from "../../lib/section-block.ts";
import { defineStructuredBlock, numberAttribute, stringAttribute } from "../define.ts";

/**
 * Generic band that nests other Gutenberg blocks.
 *
 * `backgroundColor` is the one place this contract stores a raw colour: a
 * section exists to set the surface its children sit on, and editors pick from
 * the Nomia swatches the bespoke editor offers. Padding stays a named step so
 * the responsive rhythm remains owned by `src/lib/section-block.ts` instead of
 * being frozen into post content. The optional background image stores its
 * media reference plus a named position and size, which the same module
 * resolves to CSS.
 */
export default defineStructuredBlock({
  identity: {
    blockName: "getquick/section",
    catalogId: "section",
    schemaVersion: 1,
    order: 36,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  container: true,
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("section"),
    backgroundColor: stringAttribute(),
    backgroundImageId: numberAttribute(),
    backgroundImageSrc: stringAttribute("", { ui: { kind: "media" } }),
    backgroundImagePosition: stringAttribute(SECTION_BACKGROUND_POSITION_DEFAULT, {
      enum: SECTION_BACKGROUND_POSITIONS,
      ui: { kind: "select" },
    }),
    backgroundImageSize: stringAttribute(SECTION_BACKGROUND_SIZE_DEFAULT, {
      enum: SECTION_BACKGROUND_SIZES,
      ui: { kind: "select" },
    }),
    paddingTop: stringAttribute(SECTION_PADDING_TOP_DEFAULT, {
      enum: SECTION_PADDING_STEPS,
      ui: { kind: "select" },
    }),
    paddingBottom: stringAttribute(SECTION_PADDING_BOTTOM_DEFAULT, {
      enum: SECTION_PADDING_STEPS,
      ui: { kind: "select" },
    }),
    paddingX: stringAttribute(SECTION_PADDING_X_DEFAULT, {
      enum: SECTION_HORIZONTAL_PADDINGS,
      ui: { kind: "select" },
    }),
  },
  renderer: {
    module: "SectionBlock.astro",
    preview: {
      label: "Section",
      attributes: {
        backgroundColor: "#00524d",
        paddingTop: "medium",
        paddingBottom: "medium",
        paddingX: "default",
      },
    },
  },
  editor: {
    title: "Secção",
    description: "Faixa Nomia que agrupa outros blocos, com fundo e espaçamento próprios.",
    icon: "editor-table",
    experience: "inline-fields",
    module: "Section.jsx",
  },
  documentation: {
    path: "sections/section.md",
  },
});
