import type { NomiaMapRegionId } from "../../types/nomia-map-list-explorer";

/** Approximate centre [lng, lat] for each NUTS II–style region. */
export const PORTUGAL_REGION_CENTERS: Record<
  NomiaMapRegionId,
  { lng: number; lat: number; zoom: number }
> = {
  norte: { lng: -8.25, lat: 41.55, zoom: 7.2 },
  centro: { lng: -8.45, lat: 40.35, zoom: 7.2 },
  lisboa: { lng: -9.14, lat: 38.72, zoom: 8 },
  alentejo: { lng: -7.9, lat: 38.57, zoom: 7.4 },
  algarve: { lng: -7.93, lat: 37.02, zoom: 7.8 },
  acores: { lng: -28.0, lat: 38.65, zoom: 6.2 },
  madeira: { lng: -16.9, lat: 32.76, zoom: 8.5 },
};

/** Mainland + Azores + Madeira — for initial fitBounds. */
export const PORTUGAL_FULL_BOUNDS = {
  southwest: [-31.6, 32.25] as [number, number],
  northeast: [-5.9, 42.25] as [number, number],
};

export const PORTUGAL_REGION_IDS = Object.keys(PORTUGAL_REGION_CENTERS) as NomiaMapRegionId[];

export const PORTUGAL_REGION_LABELS: Record<NomiaMapRegionId, string> = {
  norte: "Norte",
  centro: "Centro",
  lisboa: "Lisboa",
  alentejo: "Alentejo",
  algarve: "Algarve",
  acores: "Açores",
  madeira: "Madeira",
};
