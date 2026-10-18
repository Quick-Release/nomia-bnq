import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const RESOURCE_CARD_FIELDS = {
  title: stringAttribute(),
  description: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/circular-economy-resources",
    catalogId: "circular-economy-resources",
    schemaVersion: 1,
    order: 21,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("circular-economy-resources"),
    eyebrow: stringAttribute(),
    heading: stringAttribute(),
    cards: arrayAttribute(RESOURCE_CARD_FIELDS, {
      required: ["title", "description", "href"],
    }),
  },
  compatibility: {
    legacyReads: {
      resources: "array",
    },
  },
  renderer: {
    module: "EconomiaCircularRecursosBlock.astro",
    preview: {
      label: "Recursos",
      attributes: {
        eyebrow: "Recursos",
        heading: "Encontre documentos, guias e plataformas úteis",
        cards: [
          {
            title: "Documentos estratégicos",
            description: "Planos, estratégias e documentos de enquadramento.",
            href: "/biblioteca/",
          },
          {
            title: "Guias práticos",
            description: "Ferramentas para apoiar a transição circular.",
            href: "/biblioteca/",
          },
          {
            title: "Casos de estudo",
            description: "Exemplos nacionais e internacionais de boas práticas.",
            href: "/biblioteca/",
          },
        ],
      },
    },
  },
  editor: {
    title: "Economia circular: recursos",
    description:
      "Lista de recursos com cabeçalho e cartões de ligação, cada um com título e descrição.",
    icon: "portfolio",
    experience: "preview",
  },
  documentation: {
    path: "sections/economia-circular/recursos.md",
  },
});
