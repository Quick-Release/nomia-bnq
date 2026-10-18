import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const PODCAST_ITEM_FIELDS = {
  episodeNumber: numberAttribute(),
  dateLabel: stringAttribute(),
  title: stringAttribute(),
  imageId: numberAttribute(),
  imageSrc: stringAttribute("", {
    legacyReads: ["imageUrl"],
    ui: { kind: "media" },
  }),
  imageAlt: stringAttribute(),
  listenHref: stringAttribute("", {
    legacyReads: ["listenUrl"],
    ui: { kind: "url" },
  }),
  shareUrl: stringAttribute("", { ui: { kind: "url" } }),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/content-list",
    catalogId: "content-list",
    schemaVersion: 1,
    order: 5,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("content-list"),
    items: arrayAttribute(PODCAST_ITEM_FIELDS, {
      required: ["title", "dateLabel", "imageSrc", "listenHref"],
    }),
  },
  compatibility: {
    legacyReads: {
      episodes: "array",
    },
  },
  renderer: {
    module: "PodcastListBlock.astro",
    preview: {
      label: "Podcasts list",
      attributes: {
        items: [
          {
            episodeNumber: 1,
            dateLabel: "2 de Janeiro 2026",
            title: "Episódio de teste para Gutenberg",
            imageSrc: "/images/home/bioeconomia-intro/hero.jpg",
            imageAlt: "Imagem de podcast",
            listenHref: "#podcast-1",
            shareUrl: "/podcasts/",
          },
        ],
      },
    },
  },
  editor: {
    title: "Lista de conteúdos",
    description: "Lista de episódios com imagem, número, data e botões para ouvir e partilhar.",
    icon: "playlist-audio",
    experience: "preview",
    bespoke: true,
  },
  documentation: {
    path: "content-lists/content-list.md",
  },
});
