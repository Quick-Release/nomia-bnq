import {
  defineStructuredBlock,
  numberAttribute,
  objectAttribute,
  stringAttribute,
} from "../define.ts";

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/event-card-compact",
    catalogId: "event-card-compact",
    schemaVersion: 1,
    order: 27,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("event-card-compact"),
    event: objectAttribute(),
    title: stringAttribute(),
    slug: stringAttribute(),
    href: stringAttribute("", { ui: { kind: "url" } }),
    date: stringAttribute(),
    imageId: numberAttribute(),
    imageUrl: stringAttribute("", { ui: { kind: "media" } }),
    imageAlt: stringAttribute(),
    startDate: stringAttribute(),
    endDate: stringAttribute(),
  },
  compatibility: {
    legacyReads: {
      url: "string",
    },
    legacyLinks: ["url"],
  },
  renderer: {
    module: "EventCardCompactBlock.astro",
    preview: {
      label: "Event card compact",
      attributes: {
        title: "Evento compacto",
        slug: "evento-compacto",
        date: "2026-01-01",
        imageUrl: "/images/hero-carousel/economia-circular.jpg",
        imageAlt: "Evento",
      },
    },
  },
  editor: {
    title: "Cartão compacto de evento",
    description:
      "Cartão pequeno de um evento com imagem, título e datas, com ligação para a página do evento.",
    icon: "calendar",
    experience: "preview",
  },
  documentation: {
    path: "sections/landing/event-card-compact.md",
  },
});
