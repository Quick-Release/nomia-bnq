"""Build economia-circular.svg and its icon image from pdf2svg.py's elements.json.

Usage: build-economia-circular.py <elements.json> <raster.png> <out-dir>

<raster.png> is the .ai's Image layer (the flat 1536x1024 picture); only the
icon areas are kept from it. Writes economia-circular.svg (with __ID__ and
__ICONS__ placeholders, filled in by InteractiveImage.astro) and
economia-circular-icons.webp.
"""
import html, json, math, pathlib, re, sys
from PIL import Image, ImageDraw

E = json.load(open(sys.argv[1]))
RASTER = sys.argv[2]
OUT = pathlib.Path(sys.argv[3])
OUT.mkdir(parents=True, exist_ok=True)

CX, CY = 768, 512  # ring centre (page centre)

# Step -> element indices of its info box (dashed box, "i" badge, text lines).
INFO = {
    1: [54, 55, 56, 57, 58, 59, *range(42, 48)],
    2: [123, 124, 125, *range(119, 123)],
    3: [131, 132, 133, *range(126, 131)],
    4: [154, 155, 156, *range(149, 154)],
    5: [146, 147, 148, *range(142, 146)],
    6: [139, 140, 141, *range(134, 139)],
}
# Step -> its card (panel + badge + title + text) and icon disc.
CARD = {
    1: [12, 61, 63, 64, 48, 49, 50, 62, 65],
    2: [14, 77, 79, 80, 74, 75, 76, 78, 81],
    3: [15, 85, 87, 88, 82, 83, 84, 86, 89],
    4: [16, 93, 95, 96, 97, 90, 91, 92, 94, 98],
    5: [17, 102, 104, 105, 106, 99, 100, 101, 103, 107],
    6: [13, 69, 71, 72, 66, 67, 68, 70, 73],
}
# Ring slices (element index) and the steps each one belongs to.
SLICES = {7: [1], 3: [2], 4: [3], 5: [4], 6: [5, 6]}
# Icon discs: centre of each step's white disc, for the raster icon clip.
DISC = {1: (612.5, 360), 2: (900, 360), 3: (944, 538), 4: (880, 686), 5: (642, 721), 6: (588, 608)}
# Hit wedges (degrees, y down, 0 = east) per step, around the ring.
WEDGE = {1: (188, 270), 2: (270, 340), 3: (340, 393), 4: (393, 449), 5: (449, 497), 6: (497, 548)}
TITLES = {1: "Prevenir e repensar", 2: "Conceber para durar", 3: "Reduzir e partilhar",
          4: "Manter, reparar e reutilizar", 5: "Recondicionar e remanufacturar", 6: "Reciclar com segurança"}

WEIGHT = {"Montserrat-Bold": 700, "Montserrat-SemiBold": 600, "Montserrat-Regular": 400}

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
        t = html.escape(e["text"].rstrip().replace("ﬁ", "fi"))
        return (f'<text x="{e["x"]:.2f}" y="{e["y"]:.2f}" font-size="{e["size"]:.1f}" '
                f'font-weight="{WEIGHT[e["font"]]}" fill="{e["fill"]}">{t}</text>')
    return ""

used = set()
def take(ids):
    used.update(ids)
    return "\n".join(el_svg(i) for i in ids)

def wedge(a0, a1, r0=118, r1=272):
    p = lambda r, a: (CX + r * math.cos(math.radians(a)), CY + r * math.sin(math.radians(a)))
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = p(r1, a0), p(r1, a1), p(r0, a1), p(r0, a0)
    large = 1 if a1 - a0 > 180 else 0
    return (f"M{x0:.1f},{y0:.1f} A{r1},{r1} 0 {large} 1 {x1:.1f},{y1:.1f} "
            f"L{x2:.1f},{y2:.1f} A{r0},{r0} 0 {large} 0 {x3:.1f},{y3:.1f} Z")

parts = []
# Static panels (linear band, regeneration band).
parts.append(f'<g class="ec-static">{take([8, 9, 10, 11])}</g>')
# Ring slices.
slices = []
for idx, steps in SLICES.items():
    slices.append(f'<g class="ec-slice" data-steps="{" ".join(map(str, steps))}">{take([idx])}</g>')
parts.append(f'<g class="ec-ring">{"".join(slices)}</g>')
# Cards, each with its raster icon clipped to its disc.
for s, ids in CARD.items():
    x, y = DISC[s]
    parts.append(f'<g class="ec-card" data-step="{s}">{take(ids)}'
                 f'<clipPath id="ec-disc-{s}"><circle cx="{x}" cy="{y}" r="43"/></clipPath>'
                 f'<use href="#ec-raster" clip-path="url(#ec-disc-{s})"/></g>')

# Raster icons, clipped to the places the vector file has no icons.
ICON_RECTS = [
    (360, 140, 760, 73),  # linear model icons + arrows
    (688, 458, 134, 68),  # infinity logo
    (470, 846, 690, 60),  # regeneration icons
    (588, 982, 34, 36),  # hand cursor of the hint
]
clip = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}"/>' for x, y, w, h in ICON_RECTS]
used.update([161, 162])  # the one vector arrow; the raster has all three
parts.insert(0,
    f'<defs><image id="ec-raster" href="__ICONS__" x="0" y="-2.4" width="1536" height="1024"/></defs>')
parts.append(
    f'<defs><clipPath id="ec-icons">{"".join(clip)}</clipPath></defs>'
    f'<use href="#ec-raster" clip-path="url(#ec-icons)" aria-hidden="true"/>'
)

# Remaining static text (titles, linear/regeneration labels, linear + regeneration info boxes).
rest = [i for i, e in enumerate(E) if e["layer"] == "Info" and i not in used
        and i not in {j for ids in INFO.values() for j in ids}]
parts.append(f'<g class="ec-static">{take(rest)}</g>')
parts.append('<text x="626" y="1006" font-size="16" font-weight="500" fill="#04596b">'
             'Clique em cada etapa para saber mais.</text>')

# Info boxes, hidden until their step is active.
for s, ids in INFO.items():
    parts.append(f'<g class="ec-info" data-step="{s}" id="ec-info-{s}">{take(ids)}</g>')

# Hit areas: ring wedge + card, one focusable button per step.
for s in INFO:
    b = [E[i]["bbox"] for i in CARD[s]]
    x0, y0 = min(v[0] for v in b), min(v[1] for v in b)
    x1, y1 = max(v[2] for v in b), max(v[3] for v in b)
    parts.append(
        f'<g class="ec-hit" data-step="{s}" tabindex="0" role="button" aria-expanded="false" '
        f'aria-controls="ec-info-{s}" aria-label="{html.escape(TITLES[s])}">'
        f'<path d="{wedge(*WEDGE[s])}"/><rect x="{x0:.0f}" y="{y0:.0f}" width="{x1-x0:.0f}" height="{y1-y0:.0f}" rx="12"/></g>'
    )

svg = (
    '<svg class="ec" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg" '
    'role="group" aria-label="Economia circular: do modelo linear ao modelo circular">'
    '<rect width="1536" height="1024" fill="#fff"/>' + "\n".join(parts) + "</svg>"
)


svg = svg.replace('id="ec-', 'id="__ID__-').replace("#ec-", "#__ID__-").replace('aria-controls="ec-', 'aria-controls="__ID__-')
svg = re.sub(r"(\d+\.\d)\d+", r"\1", svg)
(OUT / "economia-circular.svg").write_text(svg)

# Icons: the raster with everything outside the clipped icon areas blanked, so it compresses small.
im = Image.open(RASTER).convert("RGB")
mask = Image.new("L", im.size, 0)
draw = ImageDraw.Draw(mask)
OFF = 2.4  # the raster sits 2.4 units lower than the page in the .ai
for x, y in DISC.values():
    draw.ellipse([x - 45, y + OFF - 45, x + 45, y + OFF + 45], fill=255)
for x, y, w, h in ICON_RECTS:
    draw.rectangle([x - 2, y + OFF - 2, x + w + 2, y + OFF + h + 2], fill=255)
Image.composite(im, Image.new("RGB", im.size, "white"), mask).save(
    OUT / "economia-circular-icons.webp", "WEBP", quality=90)
print("wrote", OUT / "economia-circular.svg", OUT / "economia-circular-icons.webp")
