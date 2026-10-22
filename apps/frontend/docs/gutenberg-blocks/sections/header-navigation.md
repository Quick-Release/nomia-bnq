# Header navigation (`nomia_navigation`)

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `header-navigation`
- WordPress block name: `getquick/header-navigation`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/HeaderNavigationBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/header-navigation/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Purpose

A navigation bar showing a WordPress menu, styled like bioeconomia.pt's header
navigation (`apps/web/src/components/navigation/header/NomiaHeader.astro`
there; Figma: Nomia — Website (2), node `40017025:6739`). The block only
chooses the menu; its look is fixed.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `menuId`
- `menuItems`
<!-- END GENERATED: structured-block-contract -->

## Editing behavior

- The canvas and the **Menu** inspector panel list the site's menus
  (Appearance → Menus, passed to the editor as `window.gqBioeconomiaMenus`);
  picking one stores its ID as `menuId`. The canvas names the chosen menu and
  warns when it has been deleted, since the block then renders nothing.
- `menuItems` is never saved by the editor. gq-bioeconomia's `wpBlocksJson`
  resolver fills it from the menu each time the page is read
  (`src/GraphQL/BlocksJson.php`): every item's `id`, `parentId`, `label`,
  `url` and `target`, in menu order.

## Frontend behavior

- The bar renders only when its menu has items; a deleted or empty menu
  renders nothing.
- `headerNavigationTree` (`src/lib/header-navigation.ts`) nests the items under
  their parents. Links into this site become frontend paths, as the site
  menu's do, and links `safeHref` refuses become `#`.
- From the `nav` breakpoint (1400px) the top-level items are a row, the links
  drawn as pills using the **Cor** field of their Temáticas term. Identity
  follows the internal destination’s first path segment (the term slug),
  including subpages, rather than menu order. The legacy `/bioeconomia/`
  route resolves to `bioeconomia-sustentavel`; taxonomy archive links are
  recognized too. Links without a configured term color use gray. Hover and
  keyboard focus derive from the same selected color as the homepage cards,
  with automatic black/white text contrast. An item with children opens its
  submenu on hover or focus. Below it the bar shows a menu button that opens a
  drawer listing every item and its children with the same thematic colors; the drawer traps focus and
  closes on Escape, its close button or a click outside it.
- The bar is sticky at the top of the page, translucent teal (80%) under a
  blur, as the bioeconomia.pt header was (that header was fixed).
- The menu is stored with the page: after editing the menu, refresh the pages
  that show it (`pnpm frontend:refresh`) for visitors to see the change.
