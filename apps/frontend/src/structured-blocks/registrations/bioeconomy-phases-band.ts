import {
  defineStructuredBlock,
  arrayAttribute,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

const PHASE_FIELDS = {
  phase: stringAttribute(),
  title: stringAttribute(),
  body: stringAttribute(),
};

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/bioeconomy-phases-band",
    catalogId: "bioeconomy-phases-band",
    schemaVersion: 1,
    order: 13,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("bioeconomy-phases-band"),
    imageId: numberAttribute(),
    imageSrc: stringAttribute("", { ui: { kind: "media" } }),
    phases: arrayAttribute(PHASE_FIELDS, {
      required: ["phase", "title", "body"],
    }),
  },
  compatibility: {
    legacyReads: {
      imageUrl: "string",
      items: "array",
    },
  },
  renderer: {
    module: "BioeconomiaPhasesBandBlock.astro",
    preview: {
      label: "Bioeconomia phases band",
      attributes: {
        imageSrc: "/images/bioeconomia-sustentavel/phases-band-background.jpg",
        phases: [
          {
            phase: "01",
            title: "Produção",
            body: "Matérias-primas renováveis e processos regenerativos.",
          },
          {
            phase: "02",
            title: "Transformação",
            body: "Valorização de recursos biológicos em produtos.",
          },
          {
            phase: "03",
            title: "Regeneração",
            body: "Ciclos produtivos que devolvem valor ao território.",
          },
        ],
      },
    },
  },
  editor: {
    title: "Bioeconomia: faixa de fases",
    description:
      "Faixa sobre fotografia com as fases da bioeconomia, cada uma com fase, título e texto.",
    icon: "editor-ol",
    experience: "preview",
  },
  documentation: {
    path: "sections/bioeconomia/phases-band.md",
  },
});
