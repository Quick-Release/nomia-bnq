import { INTERACTIVE_IMAGE_KEYS } from "../../lib/interactive-images.ts";
import {
  arrayAttribute,
  defineStructuredBlock,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const icon = {
  iconId: numberAttribute(),
  iconSrc: stringAttribute("", { ui: { kind: "media" } }),
};

/**
 * An interactive infographic shipped with the Frontend, such as the Economia
 * Circular diagram whose steps reveal their details on hover or tap. The block
 * stores which graphic to show and the editor's replacements for its texts and
 * icons. Every replacement is optional: an empty one keeps the graphic's own
 * text or icon, exactly as drawn. Rows are read by position (the n-th step row
 * edits step n).
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
    title: stringAttribute(),
    subtitle: stringAttribute(),
    linearHeading: stringAttribute(),
    /** The four stages of the linear model (Extrair, Produzir, Utilizar, Eliminar). */
    linearSteps: arrayAttribute({ label: stringAttribute(), ...icon }),
    linearInfo: stringAttribute("", { ui: { kind: "textarea" } }),
    circularHeading: stringAttribute(),
    centerLabel: stringAttribute(),
    centerIconId: numberAttribute(),
    centerIconSrc: stringAttribute("", { ui: { kind: "media" } }),
    /** The six steps of the circular model: card title and text, info box, icon. */
    steps: arrayAttribute({
      title: stringAttribute(),
      description: stringAttribute("", { ui: { kind: "textarea" } }),
      info: stringAttribute("", { ui: { kind: "textarea" } }),
      ...icon,
    }),
    regenerationHeading: stringAttribute(),
    regenerationText: stringAttribute("", { ui: { kind: "textarea" } }),
    /** The five natural systems (solo, água, biodiversidade, nutrientes, compostagem segura). */
    regenerationItems: arrayAttribute({ label: stringAttribute(), ...icon }),
    regenerationInfo: stringAttribute("", { ui: { kind: "textarea" } }),
    hint: stringAttribute(),
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
    bespoke: true,
  },
  documentation: { path: "sections/interactive-image.md" },
});
