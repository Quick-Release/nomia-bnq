# Interactive image

## Purpose

Shows an interactive infographic shipped with the Frontend. The first one,
**Economia Circular** (`economia-circular`), replaces the static diagram on
`/economia-circular/visao-geral/`: hovering over (or tapping, or focusing) a
step of the circular model shows that step's dotted info box and dims the
other steps.

## Editing

Add an **Imagem interativa** block and pick the graphic in **Imagem**
(stored as `image`). The preview shows it as the Frontend draws it.

Every text and icon of the graphic can be replaced in the block's sidebar,
grouped as the graphic is: Título, Modelo linear, Modelo circular, one panel
per Etapa (title, text, the detail shown on hover, icon) and Regeneração dos
sistemas naturais. Each field shows the graphic's own text as its placeholder.
**A field left empty keeps the graphic's own text or icon exactly as drawn**,
so a block with no replacements looks as it did before the fields existed.

- Texts are stored in `title`, `subtitle`, `linearHeading`, `linearInfo`,
  `circularHeading`, `centerLabel`, `regenerationHeading`,
  `regenerationText`, `regenerationInfo` and `hint`, and in the rows of
  `linearSteps` (`label`), `steps` (`title`, `description`, `info`) and
  `regenerationItems` (`label`). Rows are read by position: the n-th row of
  `steps` edits step n.
- Icons are uploads from the Media Library (`iconId`/`iconSrc` in each row,
  and `centerIconId`/`centerIconSrc` for the logo in the centre). An SVG
  upload stays sharp. **Repor ícone original** clears the upload.
- A replaced text wraps on its own within the original's width, at the same
  font, size, colour and line height, starting on the original's first
  baseline; Enter forces a line break. A text much longer than the original
  overflows its box, which the preview shows.

## Frontend behavior

`InteractiveImage.astro` inlines the graphic's SVG and toggles
`data-active` on it: CSS shows the active step's `.ec-info` group, keeps its
`.ec-card` and ring `.ec-slice` at full opacity and dims the rest. A mouse
shows a step while it hovers; a tap, click, Enter or Space pins it; Escape or
a tap outside clears it. Each step is a focusable button with
`aria-expanded`. No library is used.

Replacements: the generated SVG marks every editable text as
`<g data-slot="…">` and every icon as `<g data-icon="…">`, and
`economia-circular.slots.json` records each slot's box, font and default.
`renderInteractiveSvg` (`src/lib/interactive-images.ts`) swaps a filled slot
for HTML text in a `foreignObject` (or an `<image>` fitted into the icon's
box) and leaves every other slot untouched. The step buttons' labels follow
the (edited) step titles. Icon URLs must be `https:` or site paths.

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
python -m venv venv && venv/bin/pip install pikepdf pillow fonttools brotli
venv/bin/python scripts/interactive-images/pdf2svg.py "Img to Vector 1.ai" elements.json
venv/bin/python scripts/interactive-images/build-economia-circular.py elements.json raster.png \
  src/components/interactive-images/assets src/components/interactive-images
mv src/components/interactive-images/economia-circular-icons.webp src/components/interactive-images/assets/
```

The build script maps the file's elements to slots and steps by index
(`TEXT`, `CARD_SHAPES`, `INFO_SHAPES`, `SLICES`) and the icons to boxes
measured on the raster (`ICON`); re-check those if the designer changes the
file. It measures the texts with the self-hosted Montserrat files. If a
slot's default text changes, update the CMS editor's `DEFAULTS`
(`blocks/interactive-image/index.js`); a Frontend test compares them.

<!-- BEGIN GENERATED: structured-block-metadata -->
- Block ID: `interactive-image`
- WordPress block name: `getquick/interactive-image`
- Astro renderer: `apps/web/src/components/wp-blocks/blocks/InteractiveImageBlock.astro`
- Gutenberg editor: `apps/cms/web/app/plugins/gq-bioeconomia/blocks/interactive-image/index.js`
- Lifecycle: `active`
<!-- END GENERATED: structured-block-metadata -->

<!-- BEGIN GENERATED: structured-block-contract -->
## Astro contract attributes

- `schemaVersion`
- `blockId`
- `image`
- `title`
- `subtitle`
- `linearHeading`
- `linearSteps`
- `linearInfo`
- `circularHeading`
- `centerLabel`
- `centerIconId`
- `centerIconSrc`
- `steps`
- `regenerationHeading`
- `regenerationText`
- `regenerationItems`
- `regenerationInfo`
- `hint`
<!-- END GENERATED: structured-block-contract -->
