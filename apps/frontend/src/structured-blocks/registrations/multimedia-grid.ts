import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const MULTIMEDIA_CARD_FIELDS = {
  title: stringAttribute(),
  tag: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/multimedia-grid",
    catalogId: "multimedia-grid",
    schemaVersion: 1,
    order: 24,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("multimedia-grid"),
    eyebrow: stringAttribute(),
    heading: stringAttribute(),
    body: stringAttribute(),
    cards: arrayAttribute(MULTIMEDIA_CARD_FIELDS, {
      required: ["title", "tag", "href"],
    }),
  },
  compatibility: {
    legacyReads: {
      items: "array",
    },
  },
  renderer: {
    module: "MultimediaBlock.astro",
    preview: {
      label: "Multimedia",
      attributes: {
        eyebrow: "NOMIA",
        heading: "Multimédia e ferramentas",
        body: "Explore conteúdos e recursos para conhecer projetos, iniciativas e dados.",
        cards: [
          { title: "Infografias", tag: "Multimédia", href: "/infografias/" },
          { title: "Vídeos", tag: "Multimédia", href: "/videos/" },
          { title: "Podcasts", tag: "Multimédia", href: "/podcasts/" },
          { title: "Galeria", tag: "Multimédia", href: "/galeria/" },
          { title: "Plataformas", tag: "Ferramenta", href: "/ferramentas/plataformas/" },
          { title: "Bases de dados", tag: "Ferramenta", href: "/bases-de-dados/" },
        ],
      },
    },
  },
  editor: {
    title: "Grelha multimédia",
    description:
      "Grelha de ligações para conteúdos multimédia e ferramentas, com cabeçalho, texto e etiquetas.",
    icon: "admin-media",
    experience: "preview",
  },
  documentation: {
    path: "sections/landing/multimedia.md",
  },
});
