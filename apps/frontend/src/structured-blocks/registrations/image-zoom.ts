import { defineStructuredBlock, numberAttribute, stringAttribute } from "../define.ts";

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/image-zoom",
    catalogId: "image-zoom",
    schemaVersion: 1,
    order: 10,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("image-zoom"),
    imageId: numberAttribute(),
    imageSrc: stringAttribute("", { ui: { kind: "media" } }),
    imageAlt: stringAttribute(),
    caption: stringAttribute(),
  },
  compatibility: {
    legacyReads: {
      imageUrl: "string",
      url: "string",
      alt: "string",
    },
  },
  renderer: {
    module: "ImageZoomBlock.astro",
    preview: {
      label: "Image zoom",
      attributes: {
        imageSrc: "/images/hero-carousel/economia-circular.jpg",
        imageAlt: "Paisagem de economia circular",
        caption: "Clique na imagem para abrir em modo ampliado.",
      },
    },
  },
  editor: {
    title: "Imagem com zoom",
    description:
      "Imagem com legenda opcional que amplia ao passar o rato e abre em ecrã inteiro ao clicar.",
    icon: "search",
    experience: "preview",
    bespoke: true,
  },
  documentation: {
    path: "media/image-zoom.md",
  },
});
