import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const OPPORTUNITY_TILE_FIELDS = {
  label: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/opportunities-grid",
    catalogId: "opportunities-grid",
    schemaVersion: 1,
    order: 23,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("opportunities-grid"),
    eyebrow: stringAttribute(),
    heading: stringAttribute(),
    body: stringAttribute(),
    items: arrayAttribute(OPPORTUNITY_TILE_FIELDS, {
      required: ["label", "href"],
    }),
  },
  compatibility: {
    legacyReads: {
      tiles: "array",
    },
  },
  renderer: {
    module: "OportunidadesBlock.astro",
    preview: {
      label: "Oportunidades",
      attributes: {
        eyebrow: "NOMIA",
        heading: "Encontre novas oportunidades",
        body: "Acompanhe avisos, publicações e iniciativas relevantes.",
        items: [
          { label: "Avisos", href: "/oportunidades/avisos/" },
          { label: "Publicações", href: "/biblioteca/publicacoes/" },
          { label: "Boas práticas", href: "/biblioteca/boas-praticas/" },
          { label: "Newsletters", href: "/newsletters/" },
        ],
      },
    },
  },
  editor: {
    title: "Grelha de oportunidades",
    description:
      "Cabeçalho com texto e mosaicos de ligação para oportunidades, como avisos e publicações.",
    icon: "megaphone",
    experience: "preview",
  },
  documentation: {
    path: "sections/landing/oportunidades.md",
  },
});
