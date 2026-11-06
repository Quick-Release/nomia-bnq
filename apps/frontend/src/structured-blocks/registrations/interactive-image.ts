import { INTERACTIVE_IMAGE_KEYS } from "../../lib/interactive-images.ts";
import { defineStructuredBlock, numberAttribute, stringAttribute } from "../define.ts";

/**
 * An interactive infographic shipped with the Frontend, such as the Economia
 * Circular diagram whose steps reveal their details on hover or tap. The block
 * stores which graphic to show, never the graphic itself.
 */
export default defineStructuredBlock({
  identity: {
    blockName: "getquick/interactive-image",
    catalogId: "interactive-image",
    schemaVersion: 1,
    order: 45,
  },
  lifecycle: { status: "active", inserter: true },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("interactive-image"),
    /** Which interactive image to show. */
    image: stringAttribute("economia-circular", {
      enum: INTERACTIVE_IMAGE_KEYS,
      ui: { kind: "select" },
    }),
  },
  renderer: {
    module: "InteractiveImageBlock.astro",
    preview: { label: "Interactive image", attributes: { image: "economia-circular" } },
  },
  editor: {
    title: "Imagem interativa",
    description:
      "Mostra uma imagem interativa: ao passar o rato ou tocar em cada etapa, aparecem os detalhes.",
    icon: "format-image",
    keywords: ["imagem", "interativa", "infografia", "economia circular", "interactive", "image"],
    experience: "preview",
  },
  documentation: { path: "sections/interactive-image.md" },
});
