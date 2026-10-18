import {
  TITLE_WITH_LABEL_FIELDS,
  TITLE_WITH_LABEL_FIELD_TYPOGRAPHY_SCHEMA,
  TITLE_WITH_LABEL_LEGACY_ATTRIBUTES,
} from "../../lib/title-with-label-typography.ts";
import {
  defineStructuredBlock,
  numberAttribute,
  objectAttribute,
  stringAttribute,
} from "../define.ts";

/**
 * Per-field typography as design-token slugs, keyed by field. Absent fields and
 * properties inherit the Nomia type classes, so an untouched block stores no
 * `typography` at all and keeps following token changes.
 */
const typography = objectAttribute({
  properties: Object.fromEntries(
    TITLE_WITH_LABEL_FIELDS.map((field) => [field, TITLE_WITH_LABEL_FIELD_TYPOGRAPHY_SCHEMA]),
  ),
});

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/title-with-label",
    catalogId: "title-with-label",
    schemaVersion: 1,
    order: 4,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("title-with-label"),
    label: stringAttribute(),
    titleLine1: stringAttribute(),
    titleLine2: stringAttribute(),
    /** Heading level of the title, 2–4; the renderer falls back to 2. */
    level: numberAttribute(2),
    typography,
  },
  /*
   * The retired per-field pixel attributes. The editor migrates them through a
   * block deprecation and Astro maps them onto the nearest token until then.
   */
  compatibility: {
    legacyReads: TITLE_WITH_LABEL_LEGACY_ATTRIBUTES,
  },
  renderer: {
    module: "TitleWithLabelBlock.astro",
    preview: {
      label: "Title with label",
      attributes: {
        label: "Visão geral",
        titleLine1: "A Economia Circular promove um modelo económico reorganizado,",
        titleLine2:
          "através da coordenação dos sistemas de produção e consumo em circuitos fechados.",
        typography: {
          titleLine1: { size: "h3", lineHeight: "f", bold: true },
        },
      },
    },
  },
  editor: {
    title: "Título com etiqueta",
    description: "Título de secção numa ou duas linhas, com uma etiqueta curta por cima.",
    icon: "heading",
    keywords: ["título", "etiqueta", "cabeçalho", "secção", "eyebrow"],
    experience: "inline-fields",
    module: "TitleWithLabel.jsx",
  },
  documentation: {
    path: "sections/landing/title-with-label.md",
  },
});
