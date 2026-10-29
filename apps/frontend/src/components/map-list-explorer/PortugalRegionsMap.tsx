import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";

import { MAP_STYLE_PATH, resolveMapStyle, resolveMapUrl } from "../../lib/map-tiles";
import {
  PORTUGAL_FULL_BOUNDS,
  PORTUGAL_REGION_CENTERS,
  PORTUGAL_REGION_IDS,
  PORTUGAL_REGION_LABELS,
} from "../../lib/map-list-explorer/portugal-regions-geo";
import { cn } from "../../lib/utils";
import type { NomiaMapRegionId } from "../../types/nomia-map-list-explorer";

import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  selectedRegionId: NomiaMapRegionId | "";
  onSelectRegion: (id: NomiaMapRegionId) => void;
};

const MARKER_BASE =
  "size-7 rounded-full border-2 shadow-sm transition-transform sm:size-8 focus-visible:ring-main-teal-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";
const MARKER_SELECTED = "border-main-teal-500 bg-main-botnico-400 scale-110";
const MARKER_DEFAULT =
  "border-main-cinza-400/90 bg-main-ciano-300/90 hover:border-main-teal-400 hover:bg-main-ciano-400";

function applyMarkerState(element: HTMLButtonElement, label: string, isSelected: boolean) {
  element.title = label;
  element.setAttribute("aria-label", `Região: ${label}`);
  element.setAttribute("aria-pressed", String(isSelected));
  element.className = cn(MARKER_BASE, isSelected ? MARKER_SELECTED : MARKER_DEFAULT);
}

function createMarkerButton(label: string, isSelected: boolean, onClick: () => void) {
  const button = document.createElement("button");
  button.type = "button";
  applyMarkerState(button, label, isSelected);
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return button;
}

export default function PortugalRegionsMap({ selectedRegionId, onSelectRegion }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Partial<Record<NomiaMapRegionId, maplibregl.Marker>>>({});
  const onSelectRef = useRef(onSelectRegion);
  onSelectRef.current = onSelectRegion;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const page = window.location.href;
    const map = new maplibregl.Map({
      container,
      // The proxied style and tileset name the Site's resources by path, so
      // the map asks the host the page is on, whichever that is.
      transformRequest: (url) => ({ url: resolveMapUrl(url, page) }),
      bounds: [PORTUGAL_FULL_BOUNDS.southwest, PORTUGAL_FULL_BOUNDS.northeast],
      fitBoundsOptions: { padding: 48, maxZoom: 5.8 },
      interactive: true,
    });
    // OpenFreeMap's style through the Site's own Worker, which proxies every
    // tile, glyph and sprite it names: the browser never contacts a third
    // party for the map (docs/adr/0001).
    map.setStyle(MAP_STYLE_PATH, {
      transformStyle: (_previous, next) => resolveMapStyle(next, page),
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    const markers: Partial<Record<NomiaMapRegionId, maplibregl.Marker>> = {};

    for (const id of PORTUGAL_REGION_IDS) {
      const { lng, lat } = PORTUGAL_REGION_CENTERS[id];
      const label = PORTUGAL_REGION_LABELS[id];
      const element = createMarkerButton(label, false, () => onSelectRef.current(id));

      markers[id] = new maplibregl.Marker({ element, anchor: "center" })
        .setLngLat([lng, lat])
        .addTo(map);
    }

    markersRef.current = markers;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      for (const marker of Object.values(markers)) {
        marker?.remove();
      }
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sync = () => {
      for (const id of PORTUGAL_REGION_IDS) {
        const marker = markersRef.current[id];
        if (!marker) continue;
        const el = marker.getElement() as HTMLButtonElement;
        applyMarkerState(el, PORTUGAL_REGION_LABELS[id], selectedRegionId === id);
      }

      if (!selectedRegionId) {
        map.fitBounds([PORTUGAL_FULL_BOUNDS.southwest, PORTUGAL_FULL_BOUNDS.northeast], {
          padding: 48,
          maxZoom: 5.8,
          duration: 800,
        });
        return;
      }

      const { lng, lat, zoom } = PORTUGAL_REGION_CENTERS[selectedRegionId];
      map.flyTo({ center: [lng, lat], zoom, duration: 900, essential: true });
    };

    if (map.isStyleLoaded()) sync();
    else map.once("load", sync);
  }, [selectedRegionId]);

  return (
    <div
      className="border-monochrome-light-400 relative mx-auto h-[min(28rem,52vh)] w-full min-h-[17.5rem] max-w-lg overflow-hidden rounded-lg border"
      data-node-id="40017244:29313"
    >
      <div
        ref={containerRef}
        className="absolute inset-0 size-full"
        role="application"
        aria-label="Mapa interactivo de Portugal, Açores e Madeira"
      />
    </div>
  );
}
