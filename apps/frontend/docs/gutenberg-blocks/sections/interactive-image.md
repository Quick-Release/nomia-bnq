# Interactive image

## Purpose

Shows an interactive infographic shipped with the Frontend. The first one,
**Economia Circular** (`economia-circular`), replaces the static diagram on
`/economia-circular/visao-geral/`: hovering over (or tapping, or focusing) a
step of the circular model shows that step's dotted info box and dims the
other steps.

## Editing

Add an **Imagem interativa** block and pick the graphic in **Image**
(stored as `image`). The preview shows it as the Frontend draws it. The
graphic's texts are part of the graphic and can't be edited in the CMS yet.

## Frontend behavior

`InteractiveImage.astro` inlines the graphic's SVG and toggles
`data-active` on it: CSS shows the active step's `.ec-info` group, keeps its
`.ec-card` and ring `.ec-slice` at full opacity and dims the rest. A mouse
shows a step while it hovers; a tap, click, Enter or Space pins it; Escape or
a tap outside clears it. Each step is a focusable button with
`aria-expanded`. No library is used.

The text is real SVG text set in Montserrat, self-hosted with the component
(SIL Open Font License, `assets/OFL.txt`), because the layout was drawn in it
and the site's CSP allows fonts from its own origin only. The icons are cut
from the designer's raster layer (`assets/economia-circular-icons.webp`);
everything else is vector. An unknown `image` renders nothing.

## Regenerating the graphic

`economia-circular.svg` is generated from page 1 of the designer's Illustrator
file (`Img to Vector 1.ai`, kept outside the repository), whose layers are
Image, Full BG, Background, Circle, Elements, Info and Icons. Its Icons layer
holds no icons and its Image layer is only 512×341, so the icons are cut from
`raster.png`: the 1536×1024 PNG embedded in the designer's SVG export
(`Img-to-Vector-1-_2_.svg`, the base64 `<image>`), on the same coordinates:

```sh
python -m venv venv && venv/bin/pip install pikepdf pillow
venv/bin/python scripts/interactive-images/pdf2svg.py "Img to Vector 1.ai" elements.json
venv/bin/python scripts/interactive-images/build-economia-circular.py elements.json raster.png src/components/interactive-images
mv src/components/interactive-images/economia-circular-icons.webp src/components/interactive-images/assets/
```

The build script maps the file's elements to steps by index (`INFO`,
`CARD`, `SLICES`); re-check those if the designer changes the file.

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `interactive-image`
- WordPress block name: `getquick/interactive-image`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/InteractiveImageBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/assets/editor.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `image`
<!-- END GENERATED: structured-block-contract -->
