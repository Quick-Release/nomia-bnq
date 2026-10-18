import {
  NOMIA_CONTACT_MAP_ALIGNMENT_DEFAULT,
  NOMIA_CONTACT_MAP_ALIGNMENTS,
} from "../../lib/nomia-contact-map.ts";
import { defineStructuredBlock, numberAttribute, stringAttribute } from "../define.ts";

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/nomia-contact-map",
    catalogId: "nomia-contact-map",
    schemaVersion: 1,
    order: 35,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("nomia-contact-map"),
    mapUrl: stringAttribute("", { ui: { kind: "url" } }),
    title: stringAttribute(),
    align: stringAttribute(NOMIA_CONTACT_MAP_ALIGNMENT_DEFAULT, {
      enum: NOMIA_CONTACT_MAP_ALIGNMENTS,
      ui: { kind: "select" },
    }),
  },
  compatibility: {
    legacyReads: {
      url: "string",
    },
    legacyLinks: ["url"],
  },
  renderer: {
    module: "NomiaContactMapBlock.astro",
    preview: {
      label: "Nomia contact map",
      attributes: {
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Lisboa%2C%20Portugal",
        title: "Mapa de contacto",
      },
    },
  },
  editor: {
    title: "Mapa de contacto",
    description: "Mapa Google para páginas de contacto. Cole um link do Google Maps.",
    icon: "location-alt",
    experience: "inline-fields",
    bespoke: true,
  },
  documentation: {
    path: "nomia-contact-map.md",
  },
});
