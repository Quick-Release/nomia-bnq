"""Build the Economia Circular interactive image from pdf2svg.py's elements.json.

Usage: build-economia-circular.py <elements.json> <raster.png> <montserrat-dir> <out-dir>

<raster.png> is the 1536x1024 picture of the whole graphic (see the block doc);
only the icon areas are kept from it. <montserrat-dir> holds the component's
montserrat-latin-<weight>-normal.woff2 files, used to measure the text.

Writes to <out-dir>:
- economia-circular.svg: the graphic, with __ID__ and __ICONS__ placeholders
  filled in by InteractiveImage.astro. The title and subtitle aren't drawn:
  pages put them in their own blocks above it. Every editable text is a
  `<g data-slot="…">` and every icon a `<g data-icon="…">`.
- economia-circular.slots.json: each slot's position, size and default, so
  the Frontend can replace an edited slot with the same look.
- economia-circular-icons.webp: the raster, blanked outside the icons.
"""
import html, json, math, pathlib, re, sys
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw

E = json.load(open(sys.argv[1]))
RASTER = sys.argv[2]
FONTS = pathlib.Path(sys.argv[3])
OUT = pathlib.Path(sys.argv[4])
OUT.mkdir(parents=True, exist_ok=True)

CX, CY = 768, 512  # ring centre (page centre)
STEPS = range(1, 7)

# Editable texts: slot -> element indices of its lines, top to bottom.
TEXT = {
    "linear-heading": [18],
    "linear-1": [26],
    "linear-2": [33],
    "linear-3": [34],
    "linear-4": [35],
    "linear-info": [*range(36, 42)],
    "circular-heading": [21],
    "center-label": [22, 23],
    "regeneration-heading": [19, 20],
    "regeneration-text": [51, 52],
    "regeneration-1": [27],
    "regeneration-2": [28],
    "regeneration-3": [29],
    "regeneration-4": [30],
    "regeneration-5": [31, 32],
    "regeneration-info": [*range(109, 116)],
    "step-1-title": [64], "step-1-description": [48, 49, 50], "step-1-info": [*range(42, 48)],
    "step-2-title": [80], "step-2-description": [74, 75, 76], "step-2-info": [*range(119, 123)],
    "step-3-title": [88], "step-3-description": [82, 83, 84], "step-3-info": [*range(126, 131)],
    "step-4-title": [96, 97], "step-4-description": [90, 91, 92], "step-4-info": [*range(149, 154)],
    "step-5-title": [105, 106], "step-5-description": [99, 100, 101], "step-5-info": [*range(142, 146)],
    "step-6-title": [72], "step-6-description": [66, 67, 68], "step-6-info": [*range(134, 139)],
}
# The hint isn't in the .ai's vectors (only in its raster): drawn here.
HINT = dict(text="Clique em cada etapa para saber mais.", x=626, y=1006, size=16, weight=500, fill="#04596b")
# Centred slots and the width an edited text may wrap in, centred on the original.
CENTRED = {"center-label": 220, "hint": 600,
           **{f"linear-{i}": 190 for i in range(1, 5)},
           **{f"regeneration-{i}": 140 for i in range(1, 6)}}

# The title and subtitle (elements 24 and 25) are not drawn: the page has
# them as its own Heading and Paragraph blocks above the Interactive image,
# and the SVG is cropped below them. They still name the graphic.
LABEL = "{}: {}"  # title: subtitle, filled in below
TOP = 110  # the graphic's first shape starts at 118.6

# Non-text parts. Info box of each step: dashed box, notch, "i" badge.
INFO_SHAPES = {1: [54, 55, 56, 57, 58, 59], 2: [123, 124, 125], 3: [131, 132, 133],
               4: [154, 155, 156], 5: [146, 147, 148], 6: [139, 140, 141]}
# Card of each step: panel, number badge (circle + digit), icon disc rings.
CARD_SHAPES = {1: [12, 61, 63, 62, 65], 2: [14, 77, 79, 78, 81], 3: [15, 85, 87, 86, 89],
               4: [16, 93, 95, 94, 98], 5: [17, 102, 104, 103, 107], 6: [13, 69, 71, 70, 73]}
# Linear and regeneration info boxes: dashed box, "i" badge.
STATIC_SHAPES = [53, 60, 108, 116, 117, 118, 157, 158, 159, 160]
SLICES = {7: [1], 3: [2], 4: [3], 5: [4], 6: [5, 6]}  # ring slice -> steps
DISC = {1: (612.5, 360), 2: (900, 360), 3: (944, 538), 4: (880, 686), 5: (642, 721), 6: (588, 608)}
WEDGE = {1: (188, 270), 2: (270, 340), 3: (340, 393), 4: (393, 449), 5: (449, 497), 6: (497, 548)}

# Icons: slot -> box (x, y, width, height) an uploaded icon is fitted into,
# measured on the raster. Step icons sit in their disc (the raster is clipped
# to the disc, an upload to the box).
ICON = {
    **{f"step-{s}": (x - 30, y - 30, 60, 60) for s, (x, y) in DISC.items()},
    "linear-1": (368, 150.6, 84, 54), "linear-2": (604, 146.6, 64, 59),
    "linear-3": (833, 153.6, 58, 52), "linear-4": (1062, 150.6, 46, 55),
    "regeneration-1": (484, 853.6, 47, 46), "regeneration-2": (640, 852.6, 35, 47),
    "regeneration-3": (790, 849.6, 47, 51), "regeneration-4": (954, 854.6, 44, 42),
    "regeneration-5": (1108, 853.6, 42, 43),
    "center": (695, 463.6, 119, 55),
}
# Raster areas that are decoration, not replaceable icons.
DECOR = [(500, 168, 50, 32), (730, 168, 50, 32), (951, 167, 50, 32),  # linear arrows
         (590, 979, 29, 36)]  # hint hand
RASTER_OFF = 2.4  # the raster sits 2.4 units lower than the page in the .ai

WEIGHT = {"Montserrat-Bold": 700, "Montserrat-SemiBold": 600, "Montserrat-Regular": 400}
# Montserrat's vertical metrics (hhea = typo, USE_TYPO_METRICS): every platform
# lays a line box out the same, so a baseline maps to a box top exactly.
ASCENT, DESCENT = 0.968, 0.251

fonts = {w: TTFont(FONTS / f"montserrat-latin-{w}-normal.woff2") for w in (400, 500, 600, 700)}
def text_width(text, size, weight):
    f = fonts[weight]
    cmap, hmtx, upm = f.getBestCmap(), f["hmtx"], f["head"].unitsPerEm
    return sum(hmtx[cmap.get(ord(c), cmap[ord("?")])][0] for c in text) * size / upm

def clean(text):
    return text.replace("ﬁ", "fi").rstrip()

def el_svg(i):
    e = E[i]
    if e["kind"] == "path":
        a = [f'd="{e["d"]}"']
        a.append(f'fill="{e["fill"]}"' if e["fill"] else 'fill="none"')
        if e["stroke"]:
            a.append(f'stroke="{e["stroke"]}" stroke-width="{e["lw"]:.2f}"')
            if e["dash"]:
                a.append(f'stroke-dasharray="{" ".join(f"{v:.2f}" for v in e["dash"])}"')
        return f"<path {' '.join(a)}/>"
    if e["kind"] == "text":
        return (f'<text x="{e["x"]:.2f}" y="{e["y"]:.2f}" font-size="{e["size"]:.1f}" '
                f'font-weight="{WEIGHT[e["font"]]}" fill="{e["fill"]}">{html.escape(clean(e["text"]))}</text>')
    return ""

def shapes(ids):
    return "".join(el_svg(i) for i in ids)

slots = {}
def text_slot(name):
    if name == "hint":
        lines = [dict(HINT, font=None)]
        weight = HINT["weight"]
        lines[0]["text"] = HINT["text"]
    else:
        lines = [E[i] for i in TEXT[name]]
        weight = WEIGHT[lines[0]["font"]]
    size = round(lines[0]["size"], 2)
    widths = [text_width(clean(l["text"]), size, weight) for l in lines]
    ys = [l["y"] for l in lines]
    line_height = round((ys[-1] - ys[0]) / (len(ys) - 1), 2) if len(ys) > 1 else round(size * 1.25, 2)
    # Browsers lay text out a little wider than the font's advances (hinting
    # at the SVG's scale): leave room, or a text typed as it is would wrap.
    fit = max(widths) * 1.05 + 4
    if name in CENTRED:
        centre = max(l["x"] + w / 2 for l, w in zip(lines, widths))
        # A multi-line centred text keeps its width, so it breaks as drawn.
        width = fit if len(lines) > 1 else max(CENTRED[name], fit)
        x, align = centre - width / 2, "center"
    else:
        x, width, align = min(l["x"] for l in lines), fit, "left"
    slots[name] = dict(
        x=round(x, 2), baseline=round(ys[0], 2), width=round(width, 2), lines=len(lines),
        size=size, weight=weight, fill=lines[0]["fill"], lineHeight=line_height, align=align,
        default=" ".join(clean(l["text"]) for l in lines),
    )
    if name == "hint":
        inner = (f'<text x="{HINT["x"]}" y="{HINT["y"]}" font-size="{HINT["size"]}" '
                 f'font-weight="{HINT["weight"]}" fill="{HINT["fill"]}">{html.escape(HINT["text"])}</text>')
    else:
        inner = "".join(el_svg(i) for i in TEXT[name])
    return f'<g data-slot="{name}">{inner}</g>'

def icon_slot(name, clip):
    """The raster clipped to `clip` (svg shape markup), replaceable as a whole."""
    return (f'<g data-icon="{name}"><clipPath id="ec-icon-{name}">{clip}</clipPath>'
            f'<use href="#ec-raster" clip-path="url(#ec-icon-{name})"/></g>')

def rect_clip(box, pad=3):
    x, y, w, h = box
    return f'<rect x="{x - pad:.1f}" y="{y - pad:.1f}" width="{w + 2 * pad:.1f}" height="{h + 2 * pad:.1f}"/>'

def wedge(a0, a1, r0=118, r1=272):
    p = lambda r, a: (CX + r * math.cos(math.radians(a)), CY + r * math.sin(math.radians(a)))
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = p(r1, a0), p(r1, a1), p(r0, a1), p(r0, a0)
    large = 1 if a1 - a0 > 180 else 0
    return (f"M{x0:.1f},{y0:.1f} A{r1},{r1} 0 {large} 1 {x1:.1f},{y1:.1f} "
            f"L{x2:.1f},{y2:.1f} A{r0},{r0} 0 {large} 0 {x3:.1f},{y3:.1f} Z")

parts = ['<defs><image id="ec-raster" href="__ICONS__" x="0" y="-2.4" width="1536" height="1024"/></defs>']
# Bands (linear model, regeneration).
parts.append(f'<g class="ec-static">{shapes([8, 9, 10, 11])}</g>')
# Ring.
parts.append('<g class="ec-ring">' + "".join(
    f'<g class="ec-slice" data-steps="{" ".join(map(str, steps))}">{el_svg(i)}</g>'
    for i, steps in SLICES.items()) + "</g>")
# Cards: panel, badge, title, description, icon.
for s in STEPS:
    x, y = DISC[s]
    parts.append(
        f'<g class="ec-card" data-step="{s}">{shapes(CARD_SHAPES[s])}'
        f'{text_slot(f"step-{s}-title")}{text_slot(f"step-{s}-description")}'
        f'{icon_slot(f"step-{s}", f"<circle cx=\"{x}\" cy=\"{y}\" r=\"43\"/>")}</g>')
# Static icons, decoration and texts.
static = [icon_slot(n, rect_clip(ICON[n])) for n in ICON if not n.startswith("step-")]
static.append('<g aria-hidden="true"><clipPath id="ec-decor">'
              + "".join(rect_clip(b, 0) for b in DECOR)
              + '</clipPath><use href="#ec-raster" clip-path="url(#ec-decor)"/></g>')
static.append(shapes(STATIC_SHAPES))
for name in ["linear-heading", *[f"linear-{i}" for i in range(1, 5)], "linear-info",
             "circular-heading", "center-label", "regeneration-heading", "regeneration-text",
             *[f"regeneration-{i}" for i in range(1, 6)], "regeneration-info", "hint"]:
    static.append(text_slot(name))
parts.append(f'<g class="ec-static">{"".join(static)}</g>')
# Info boxes, hidden until their step is active.
for s in STEPS:
    parts.append(f'<g class="ec-info" data-step="{s}" id="ec-info-{s}">'
                 f'{shapes(INFO_SHAPES[s])}{text_slot(f"step-{s}-info")}</g>')
# Hit areas: ring wedge + card, one focusable button per step. The label is
# filled in by the Frontend from the step's (possibly edited) title.
for s in STEPS:
    b = [E[i]["bbox"] for i in CARD_SHAPES[s][:1]]
    x0, y0, x1, y1 = b[0]
    dx, dy = DISC[s]
    x0, y0, x1, y1 = min(x0, dx - 49), min(y0, dy - 49), max(x1, dx + 49), max(y1, dy + 49)
    parts.append(
        f'<g class="ec-hit" data-step="{s}" tabindex="0" role="button" aria-expanded="false" '
        f'aria-controls="ec-info-{s}" aria-label="__LABEL_{s}__">'
        f'<path d="{wedge(*WEDGE[s])}"/><rect x="{x0:.0f}" y="{y0:.0f}" width="{x1-x0:.0f}" height="{y1-y0:.0f}" rx="12"/></g>')

svg = (f'<svg class="ec" viewBox="0 {TOP} 1536 {1024 - TOP}" xmlns="http://www.w3.org/2000/svg" '
       f'role="group" aria-label="{html.escape(LABEL.format(clean(E[24]["text"]), clean(E[25]["text"])))}">'
       f'<rect y="{TOP}" width="1536" height="{1024 - TOP}" fill="#fff"/>' + "\n".join(parts) + "</svg>")
svg = svg.replace('id="ec-', 'id="__ID__-').replace("#ec-", "#__ID__-").replace('aria-controls="ec-', 'aria-controls="__ID__-')
svg = re.sub(r"(\d+\.\d)\d+", r"\1", svg)
(OUT / "economia-circular.svg").write_text(svg)

manifest = dict(
    ascent=ASCENT, descent=DESCENT, texts=slots,
    icons={n: dict(x=round(x, 2), y=round(y, 2), width=w, height=h) for n, (x, y, w, h) in ICON.items()},
)
(OUT / "economia-circular.slots.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")

# Icons: the raster with everything outside the icon areas blanked, so it compresses small.
im = Image.open(RASTER).convert("RGB")
mask = Image.new("L", im.size, 0)
draw = ImageDraw.Draw(mask)
for x, y in DISC.values():
    draw.ellipse([x - 45, y + RASTER_OFF - 45, x + 45, y + RASTER_OFF + 45], fill=255)
for n, (x, y, w, h) in ICON.items():
    if not n.startswith("step-"):
        draw.rectangle([x - 5, y + RASTER_OFF - 5, x + w + 5, y + RASTER_OFF + h + 5], fill=255)
for x, y, w, h in DECOR:
    draw.rectangle([x - 2, y + RASTER_OFF - 2, x + w + 2, y + RASTER_OFF + h + 2], fill=255)
Image.composite(im, Image.new("RGB", im.size, "white"), mask).save(
    OUT / "economia-circular-icons.webp", "WEBP", quality=90)
print("wrote", *(OUT / f for f in ("economia-circular.svg", "economia-circular.slots.json",
                                   "economia-circular-icons.webp")))
