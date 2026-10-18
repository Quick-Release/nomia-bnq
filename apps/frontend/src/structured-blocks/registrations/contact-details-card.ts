import {
  booleanAttribute,
  defineStructuredBlock,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

/**
 * Contact card: an uploaded icon, a title, a few lines of details, and an
 * optional outline button. `details` is RichText HTML whose lines are split on
 * `<br>` by `src/lib/contact-details-card.ts`. `hideIcon` / `hideButton` default
 * to false so cards saved before the toggles existed keep both parts.
 */
export default defineStructuredBlock({
  identity: {
    blockName: "getquick/contact-details-card",
    catalogId: "contact-details-card",
    schemaVersion: 1,
    order: 37,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("contact-details-card"),
    iconId: numberAttribute(),
    iconUrl: stringAttribute("", { ui: { kind: "media" } }),
    iconAlt: stringAttribute(),
    hideIcon: booleanAttribute(),
    title: stringAttribute(),
    details: stringAttribute("", { ui: { kind: "textarea" } }),
    buttonLabel: stringAttribute(),
    buttonHref: stringAttribute("", { ui: { kind: "url" } }),
    hideButton: booleanAttribute(),
  },
  renderer: {
    module: "ContactDetailsCardBlock.astro",
    preview: {
      label: "Contact details card",
      attributes: {
        iconUrl: "/images/contact-details-card/adults.svg",
        title: "Morada",
        details:
          "Serviços Centrais Rua da Murgueira, 9<br>Zambujal - Alfragide<br>2610-124 Amadora",
        buttonLabel: "Direções",
        buttonHref:
          "https://www.google.com/maps/search/?api=1&query=Rua%20da%20Murgueira%209%20Amadora",
      },
    },
  },
  editor: {
    title: "Cartão de contacto",
    description: "Cartão com ícone, título, detalhes de contacto e botão opcional.",
    icon: "id",
    keywords: ["contacto", "morada", "telefone", "email", "cartão"],
    experience: "inline-fields",
    bespoke: true,
  },
  documentation: {
    path: "sections/contact-details-card.md",
  },
});
