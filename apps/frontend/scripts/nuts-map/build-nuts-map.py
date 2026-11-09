#!/usr/bin/env python3
"""Build the NUTS map block's SVG geometry from Eurostat GISCO's NUTS 2024 boundaries.

Usage:
  python3 -I build-nuts-map.py <gisco-dir> <output.json>

<gisco-dir> holds GISCO's 1:3 million boundaries in longitude/latitude
(EPSG:4326), one file per level, downloaded from
https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/ as
NUTS_RG_03M_2024_4326_LEVL_<n>.geojson, saved as L0.geojson … L2.geojson.

The output is the mainland plus two insets (Açores, Madeira), each projected
into its own box of one SVG viewBox (north up, an equirectangular projection
true to scale at the frame's middle latitude), simplified to half a pixel, as one path
per NUTS unit and level. No dependencies: standard library only.

Administrative boundaries: © EuroGeographics.
"""

import json
import math
import sys
from pathlib import Path

LEVELS = (0, 1, 2)

# The viewBox and the box each part of Portugal is drawn into, in SVG units.
# Mainland on the right; the islands' insets stacked on its left, as in the
# Figma design (Nomia — Website 2, node 40017522:49984).
VIEW_W, VIEW_H = 640, 860
FRAMES = {
    "mainland": {"box": (230, 10, 400, 840), "label": None},
    "acores": {"box": (4, 120, 216, 150), "label": "Açores"},
    "madeira": {"box": (4, 300, 216, 130), "label": "Madeira"},
}
INSET_PADDING = 12
# Douglas–Peucker tolerance in px; the islands are small, so they keep more detail.
TOLERANCE = {"mainland": 0.5, "acores": 0.15, "madeira": 0.25}


def frame_of(lon: float, lat: float) -> str:
    """Which frame a point belongs to."""
    if lon < -20:
        return "acores"
    if lat < 34:
        return "madeira"
    return "mainland"


def drawn(ring) -> bool:
    """The Selvagens, 280 km south of Madeira, are left out of its inset, as in the design."""
    lon, lat = ring[0]
    return not (frame_of(lon, lat) == "madeira" and lat < 31)


def rings(geometry):
    if geometry["type"] == "Polygon":
        yield from geometry["coordinates"]
    elif geometry["type"] == "MultiPolygon":
        for polygon in geometry["coordinates"]:
            yield from polygon
    else:
        raise ValueError(geometry["type"])


def load(gisco: Path):
    units = {}
    for level in LEVELS:
        data = json.loads((gisco / f"L{level}.geojson").read_text())
        for feature in data["features"]:
            props = feature["properties"]
            if props["CNTR_CODE"] != "PT":
                continue
            units[props["NUTS_ID"]] = {
                "level": level,
                "rings": [ring for ring in rings(feature["geometry"]) if drawn(ring)],
            }
    return units


def bounds(points):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return min(xs), min(ys), max(xs), max(ys)


def transforms(units):
    """A projection per frame, fitting its rings' bounds into its box."""
    by_frame = {name: [] for name in FRAMES}
    for unit in units.values():
        if unit["level"] != 0:
            continue
        for ring in unit["rings"]:
            by_frame[frame_of(*ring[0])].extend(ring)
    result = {}
    for name, points in by_frame.items():
        _, lat0, _, lat1 = bounds(points)
        k = math.cos(math.radians((lat0 + lat1) / 2))
        x0, y0, x1, y1 = bounds([(lon * k, lat) for lon, lat in points])
        bx, by, bw, bh = FRAMES[name]["box"]
        pad = 0 if name == "mainland" else INSET_PADDING
        scale = min((bw - 2 * pad) / (x1 - x0), (bh - 2 * pad) / (y1 - y0))
        ox = bx + (bw - (x1 - x0) * scale) / 2
        oy = by + (bh - (y1 - y0) * scale) / 2
        result[name] = (k, scale, ox, oy, x0, y1)
    return result


def project(point, transform):
    k, scale, ox, oy, x0, y1 = transform
    return (ox + (point[0] * k - x0) * scale, oy + (y1 - point[1]) * scale)


def simplify(points, tolerance):
    """Douglas–Peucker on a closed ring (first point == last point)."""
    if len(points) < 4:
        return points

    def dp(start, end, keep):
        (ax, ay), (bx, by) = points[start], points[end]
        dx, dy = bx - ax, by - ay
        length = (dx * dx + dy * dy) ** 0.5
        best, index = -1.0, -1
        for i in range(start + 1, end):
            px, py = points[i]
            if length == 0:
                dist = ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
            else:
                dist = abs(dy * px - dx * py + bx * ay - by * ax) / length
            if dist > best:
                best, index = dist, i
        if best > tolerance:
            keep[index] = True
            dp(start, index, keep)
            dp(index, end, keep)

    # Split the ring at its farthest point from the start so neither half is degenerate.
    far = max(range(len(points)), key=lambda i: (points[i][0] - points[0][0]) ** 2 + (points[i][1] - points[0][1]) ** 2)
    keep = [False] * len(points)
    keep[0] = keep[far] = keep[-1] = True
    dp(0, far, keep)
    dp(far, len(points) - 1, keep)
    return [p for p, k in zip(points, keep) if k]


def area(points):
    return abs(sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(points, points[1:]))) / 2


def path(unit, frames):
    parts = []
    for ring in unit["rings"]:
        frame = frame_of(*ring[0])
        projected = simplify([project(p, frames[frame]) for p in ring], TOLERANCE[frame])
        # Islets smaller than a pixel would only add noise.
        if len(projected) < 4 or area(projected) < 0.5:
            continue
        coords = [f"{x:.1f} {y:.1f}" for x, y in projected[:-1]]
        parts.append("M" + "L".join(coords) + "Z")
    return "".join(parts)


def main():
    gisco, output = Path(sys.argv[1]), Path(sys.argv[2])
    units = load(gisco)
    frames = transforms(units)
    shapes = {
        str(level): [
            {"code": code, "d": path(unit, frames)}
            for code, unit in sorted(units.items())
            if unit["level"] == level
        ]
        for level in LEVELS
    }
    insets = [
        {"label": spec["label"], "box": list(spec["box"])}
        for spec in FRAMES.values()
        if spec["label"]
    ]
    output.write_text(
        json.dumps(
            {
                "source": "Eurostat GISCO, NUTS 2024, 1:3 million (EPSG:4326). Administrative boundaries: © EuroGeographics.",
                "viewBox": f"0 0 {VIEW_W} {VIEW_H}",
                "insets": insets,
                "shapes": shapes,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        )
        + "\n"
    )
    print(output, output.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
