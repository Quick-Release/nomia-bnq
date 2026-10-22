# Image zoom

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `image-zoom`
- WordPress block name: `getquick/image-zoom`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/ImageZoomBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/image-zoom/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

## Purpose

Single image block for editorial pages where the image needs closer inspection. Gutenberg stores the chosen media and optional caption; Astro renders the hover zoom and click-to-open lightbox behavior.

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `imageId`
- `imageSrc`
- `imageAlt`
- `caption`

### Legacy compatibility reads

- `imageUrl`
- `url`
- `alt`
<!-- END GENERATED: structured-block-contract -->

## Editing behavior

- Editors select or replace one image from the media library.
- Alt text is editable in the inspector.
- Caption is optional and edited inline below the image preview.

## Frontend behavior

- Hovering the image gently zooms the visible image on pointer devices.
- Clicking the image opens the same image in a modal lightbox.
- The lightbox can be closed with the close button, backdrop click, or Escape key.
