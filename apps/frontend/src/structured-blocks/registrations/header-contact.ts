import { defineStructuredBlock, numberAttribute, stringAttribute } from "../define.ts";

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/header-contact",
    catalogId: "header-contact",
    schemaVersion: 1,
    order: 41,
  },
  lifecycle: { status: "active", inserter: true },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("header-contact"),
    label: stringAttribute("Contactos"),
    href: stringAttribute("/contactos/", { ui: { kind: "url" } }),
    iconId: numberAttribute(),
    iconUrl: stringAttribute("", { ui: { kind: "media" } }),
  },
  renderer: {
    module: "HeaderContactBlock.astro",
    preview: { label: "Header contact", attributes: { label: "Contactos", href: "/contactos/" } },
  },
  editor: {
    title: "Contacto do cabeçalho",
    description: "Ícone de telefone com ligação à página de contactos ou a um número de telefone.",
    icon: "phone",
    keywords: ["nomia", "contacto", "telefone", "phone", "header"],
    experience: "inline-fields",
    bespoke: true,
  },
  documentation: { path: "sections/header-contact.md" },
});
