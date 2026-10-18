# WordPress implementation guide

This is the WordPress-side recipe for the Astro-owned Gutenberg blocks.

The supported Bioeconomia.pt CMS runtime is WordPress 7.1.1 with PHP 8.4. The
product minimum is WordPress 6.7: the first-party blocks register from a
`block.json` metadata collection (`wp_register_block_metadata_collection()`,
new in 6.7), and the editor uses the `@wordpress/editor` document panels (6.6).
Block API v3 is used throughout, 7.1.1 is the highest tested
product runtime, and the editor compatibility model is the always-iframed
WordPress 7.1.1 editor.

## Core idea

Build Gutenberg blocks that save **content attributes only**. Do not recreate responsive layout, accessibility details, or visual styling in WordPress. `apps/web` renders the final HTML from the saved attributes.

## Required WordPress block shape

Each block should:

- use the `getquick/*` block name from `/api/wp-block-contracts.json`
- include `schemaVersion: 1`
- include `blockId` with the stable catalog ID
- expose only the attributes listed in the contract endpoint
- use `save: () => null` for dynamic/content-only serialization, or save a minimal static fallback if the WP project requires it
- render an iframe preview pointed at `apps/web/wp-block-preview`

## Example `block.json`

Never hand-write these: `pnpm generate` writes one per registration into the plugin's
ignored `blocks/` directory (ADR 0014). An abridged example of the output:

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "getquick/page-hero-static",
  "title": "Cabeçalho página com imagem",
  "category": "getquick-nomia",
  "icon": "cover-image",
  "textdomain": "getquick-nomia-blocks",
  "supports": {
    "html": false,
    "className": false,
    "customClassName": false,
    "color": false,
    "spacing": false,
    "typography": false,
    "align": false
  },
  "attributes": {
    "schemaVersion": { "type": "number", "default": 1 },
    "blockId": { "type": "string", "default": "page-hero-static" },
    "title": { "type": "string", "default": "" },
    "subtitle": { "type": "string", "default": "" },
    "imageId": { "type": "number" },
    "imageUrl": { "type": "string", "default": "" },
    "imageAlt": { "type": "string", "default": "" },
    "ctaLabel": { "type": "string", "default": "" },
    "ctaHref": { "type": "string", "default": "" }
  },
  "editorScript": "getquick-nomia-blocks-editor",
  "editorStyle": "getquick-nomia-blocks-editor-style"
}
```

## Iframe preview helper

Use `attrs64`, not raw JSON in the URL, to avoid escaping issues.

```js
function base64UrlEncodeJson(value) {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function buildNomiaPreviewUrl({ nomiaFeBaseUrl, blockName, attributes }) {
  const url = new URL("/wp-block-preview", nomiaFeBaseUrl);
  url.searchParams.set("block", blockName);
  url.searchParams.set("attrs64", base64UrlEncodeJson(attributes));
  return url.toString();
}
```

## Example Gutenberg edit component

```jsx
import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  RichText,
  URLInput,
} from "@wordpress/block-editor";
import { Button, PanelBody, TextControl } from "@wordpress/components";
import { buildNomiaPreviewUrl } from "./preview-url";

const NOMIA_FE_BASE_URL = window.getquickNomia?.nomiaFeBaseUrl ?? "http://localhost:4321";

export default function Edit({ attributes, setAttributes }) {
  const previewUrl = buildNomiaPreviewUrl({
    nomiaFeBaseUrl: NOMIA_FE_BASE_URL,
    blockName: "getquick/page-hero-static",
    attributes,
  });

  return (
    <>
      <InspectorControls>
        <PanelBody title="Content" initialOpen>
          <TextControl
            label="Title"
            value={attributes.title}
            onChange={(title) => setAttributes({ title })}
          />
          <TextControl
            label="Subtitle"
            value={attributes.subtitle}
            onChange={(subtitle) => setAttributes({ subtitle })}
          />
          <TextControl
            label="CTA label"
            value={attributes.ctaLabel}
            onChange={(ctaLabel) => setAttributes({ ctaLabel })}
          />
          <URLInput value={attributes.ctaHref} onChange={(ctaHref) => setAttributes({ ctaHref })} />
          <MediaUploadCheck>
            <MediaUpload
              allowedTypes={["image"]}
              value={attributes.imageId}
              onSelect={(media) =>
                setAttributes({
                  imageId: media.id,
                  imageSrc: media.url,
                  imageAlt: media.alt || "",
                })
              }
              render={({ open }) => <Button onClick={open}>Select image</Button>}
            />
          </MediaUploadCheck>
        </PanelBody>
      </InspectorControls>

      <iframe
        title="Page hero static preview"
        src={previewUrl}
        style={{ width: "100%", minHeight: 720, border: 0 }}
      />
    </>
  );
}
```

## Save function

Prefer dynamic/content-only saving:

```js
export default function save() {
  return null;
}
```

The serialized block comment still stores the attributes in `post_content`, which `apps/web` reads through `content(format: RAW)`.

## Contract checks

During WordPress plugin development, fetch:

`/api/wp-block-contracts.json`

Use it to ensure the plugin block names and attributes stay aligned with `apps/web`.

## What requires a WordPress update

Only update the WordPress plugin when content fields change:

- new attribute
- renamed attribute
- changed repeater structure
- new block type
- improved editor field UX

Do not update WordPress for frontend-only changes:

- classes
- spacing
- responsive behavior
- accessibility markup
- animations
- image ratios
- design token values
