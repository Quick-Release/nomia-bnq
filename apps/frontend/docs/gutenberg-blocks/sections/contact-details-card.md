# Contact details card

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `contact-details-card`
- WordPress block name: `getquick/contact-details-card`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/ContactDetailsCardBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/nomia-blocks/blocks/contact-details-card/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Purpose

A single contact entry for contact pages: an icon, a short title (for example
"Morada"), a few lines of details, and an optional outline button such as
"Direções" pointing to a map. Figma: Nomia — Website (2), node `40017530:15782`.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `iconId`
- `iconUrl`
- `iconAlt`
- `hideIcon`
- `title`
- `details`
- `buttonLabel`
- `buttonHref`
- `hideButton`
<!-- END GENERATED: structured-block-contract -->

## Editing behavior

- The icon is uploaded or picked from the media library, either by clicking the
  icon slot in the canvas or from the **Ícone** inspector panel, which also
  removes it and edits its alt text. SVG icons upload through the Safe SVG
  plugin (`wp-plugin/safe-svg`), which sanitizes them; PNG/WebP also work.
  Icons are shown in a 64×64 box with `object-fit: contain`.
- Title, details and the button text are edited in place. Each line of the
  details is a line break (`<br>`) in the stored RichText value.
- The title and details accept **bold** and *italic* (toolbar or
  Ctrl/⌘+B / Ctrl/⌘+I); the button text stays plain. No field offers links.
- The button link is edited from the link chip under the button in the canvas,
  the toolbar link button, or the **Botão** inspector panel. It accepts pages,
  `https://`, `mailto:` and `tel:` links; any other scheme (`javascript:`,
  `data:`, …) is refused. The chip turns red and the button outline dashed
  while the button lacks text or an accepted link, because the site omits it.
- A warning in the canvas says when the whole card would not appear on the
  site, and when the button would not.
- **Mostrar ícone** and **Mostrar botão** toggles in the **Ícone** and **Botão**
  panels hide either part without losing its stored content. They store
  `hideIcon` / `hideButton`, defaulting to false, so older cards show both.

## Frontend behavior

- The card renders when it has a title, at least one line of details, or a
  visible button.
- The icon is omitted when none is uploaded or `hideIcon` is set.
- Title and details render bold and italic as `<strong>` / `<em>`. The stored
  HTML is never output as markup: every other tag is dropped and the text is
  escaped (`contactDetailsRichLines` in `src/lib/contact-details-card.ts`).
- The button renders only when it has both text and a link accepted by
  `safeHref` (`src/lib/safe-href.ts`) and `hideButton` is not set; `http(s)`
  links open in a new tab with `rel="noopener noreferrer"` and a visually
  hidden "(abre numa nova janela)".
- Below `md` the card stacks icon, copy and button vertically with 24px side
  padding; from `md` it is the Figma row layout (64px side padding).
- Details are split on `<br>`/newlines by `apps/web/src/lib/contact-details-card.ts`,
  with tags stripped, so no editor HTML reaches the page.
