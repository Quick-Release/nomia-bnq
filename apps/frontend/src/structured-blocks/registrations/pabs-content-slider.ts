import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const PABS_TAG_FIELDS = {
  label: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
};

const PABS_PANE_FIELDS = {
  navLabel: stringAttribute(),
  title: stringAttribute(),
  subtitle: stringAttribute(),
  imageId: numberAttribute(),
  imageSrc: stringAttribute("", {
    legacyReads: ["imageUrl"],
    ui: { kind: "media" },
  }),
  imageAlt: stringAttribute(),
  tags: arrayAttribute(PABS_TAG_FIELDS, {
    required: ["label", "href"],
  }),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/pabs-content-slider",
    catalogId: "pabs-content-slider",
    schemaVersion: 1,
    order: 14,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("pabs-content-slider"),
    eyebrow: stringAttribute(),
    heading: stringAttribute(),
    intro: stringAttribute(),
    panes: arrayAttribute(PABS_PANE_FIELDS, {
      required: ["navLabel", "title", "subtitle", "imageSrc"],
    }),
  },
  compatibility: {
    legacyReads: {
      items: "array",
    },
  },
  renderer: {
    module: "BioeconomiaPabsContentSliderBlock.astro",
    preview: {
      label: "Bioeconomia PABS slider",
      attributes: {
        eyebrow: "Bioeconomia sustentável",
        heading: "Planos de ação para uma bioeconomia sustentável",
        intro: "Explore conteúdos e recursos organizados por tema.",
        panes: [
          {
            navLabel: "O que é",
            title: "O que é a bioeconomia sustentável?",
            subtitle: "Um modelo que valoriza recursos biológicos de forma responsável.",
            imageSrc: "/images/bioeconomia-sustentavel/pabs-slider-sustentavel.jpg",
            imageAlt: "Paisagem natural",
            tags: [{ label: "Conhecer", href: "/bioeconomia-sustentavel/" }],
          },
          {
            navLabel: "Porque importa",
            title: "Porque é importante",
            subtitle: "A transição combina inovação, circularidade e regeneração.",
            imageSrc: "/images/bioeconomia-sustentavel/card-porque-importante.jpg",
            imageAlt: "Recursos naturais",
            tags: [{ label: "Explorar", href: "/biblioteca/" }],
          },
        ],
      },
    },
  },
  editor: {
    title: "PABS: slider de conteúdos",
    description:
      "Conteúdos do PABS em separadores: menu lateral e painel com imagem, título, texto e etiquetas.",
    icon: "list-view",
    experience: "preview",
  },
  documentation: {
    path: "sections/bioeconomia/pabs-content-slider.md",
  },
});
