import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const EVENT_FIELDS = {
  title: stringAttribute(),
  slug: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
  date: stringAttribute(),
  imageId: numberAttribute(),
  imageUrl: stringAttribute("", { ui: { kind: "media" } }),
  imageAlt: stringAttribute(),
  startDate: stringAttribute(),
  endDate: stringAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/events-grid",
    catalogId: "events-grid",
    schemaVersion: 1,
    order: 26,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("events-grid"),
    events: arrayAttribute(EVENT_FIELDS, {
      required: ["title"],
    }),
    eventBasePath: stringAttribute(),
  },
  compatibility: {
    legacyReads: {
      items: "array",
    },
  },
  renderer: {
    module: "EventsGridBlock.astro",
    preview: {
      label: "Events grid",
      attributes: {
        events: [
          {
            title: "Evento de teste",
            slug: "evento-de-teste",
            date: "2026-01-01",
            startDate: "2026-02-01",
            endDate: null,
            imageUrl: "/images/hero-carousel/economia-circular.jpg",
            imageAlt: "Evento",
          },
        ],
      },
    },
  },
  editor: {
    title: "Grelha de eventos",
    description:
      "Grelha de eventos com um cartão em destaque e cartões compactos, ligados à página de cada evento.",
    icon: "calendar-alt",
    experience: "preview",
  },
  documentation: {
    path: "sections/landing/events-grid.md",
  },
});
