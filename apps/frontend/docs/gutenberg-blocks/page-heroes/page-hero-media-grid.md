# NomiaPageHero media grid

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `page-hero-media-grid`
- WordPress block name: `getquick/page-hero-media-grid`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/PageHeroMediaGridBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/page-hero-media-grid/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Goal

Create a native WordPress Gutenberg custom block for a page hero with a custom background image, two CTA columns, and a video column.

## Editor experience

- Render the real block preview in Gutenberg.
- Use inline rich text for the two CTA panels.
- Put media selection, CTA URLs, visual options, and video metadata in the sidebar.
- Keep the frontend layout fixed at 25% / 25% / 50% on desktop, stacking on smaller screens.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `backgroundImageId`
- `backgroundImageSrc`
- `backgroundImageAlt`
- `heading`
- `firstTitle`
- `firstText`
- `firstHref`
- `firstBackgroundColor`
- `firstHoverBackgroundColor`
- `firstTitleColor`
- `firstTextColor`
- `firstBorderRadius`
- `secondTitle`
- `secondText`
- `secondHref`
- `secondBackgroundColor`
- `secondHoverBackgroundColor`
- `secondTitleColor`
- `secondTextColor`
- `secondBorderRadius`
- `textVerticalAlign`
- `videoId`
- `videoSrc`
- `videoPosterId`
- `videoPosterSrc`
- `videoTitle`
- `videoBorderRadius`
- `shareHref`
- `shareLabel`
<!-- END GENERATED: structured-block-contract -->

## Customizable fields

Background image, accessible section label, two CTA titles, two CTA body texts, two CTA URLs, column colors, corner radii, text vertical alignment, video file or URL, optional video poster, video title, and share link/label.

## Locked controls

The Astro renderer owns typography, spacing, column widths, borders/shadows, responsive behavior, animation, and interactions. Do not expose arbitrary CSS classes or custom HTML. The Site reads action colors from the **Cor** field on Temáticas terms. Internal destination paths identify their term by slug (including subpages and the legacy `/bioeconomia/` route). General destinations and terms without a color use gray. Hover/focus and readable text colors are derived automatically. These colors match the navigation. Previously saved column colors remain in the content contract but no longer override the term color. Other layout and content options remain editable.

## Stored-content migration

The visual attributes introduced by the previous migration are now registered canonical fields, so existing saved values are preserved. The Site's thematic identity takes precedence over saved column colors when rendering. Unknown style values are ignored by the renderer when they are not safe CSS colors or radii; re-saving a block through Gutenberg normalizes the registered fields.

## Implementation notes for the coding agent

- Register the block with the exact block ID `page-hero-media-grid` or the project namespace equivalent, preserving this ID as the stable reference.
- Save structured content as block attributes.
- Render empty state UI only in the editor, not in frontend output.
