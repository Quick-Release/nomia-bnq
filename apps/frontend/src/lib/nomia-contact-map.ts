/**
 * Block alignment for `getquick/nomia-contact-map`.
 *
 * `none` keeps the historical centred map; `left` / `right` pin a narrower map
 * to that side without floating it (a float would let the next full-width band
 * slide underneath); `full` bleeds the map to the viewport edges.
 */
export const NOMIA_CONTACT_MAP_ALIGNMENTS = ["none", "left", "right", "full"] as const;

export type NomiaContactMapAlignment = (typeof NOMIA_CONTACT_MAP_ALIGNMENTS)[number];

export const NOMIA_CONTACT_MAP_ALIGNMENT_DEFAULT: NomiaContactMapAlignment = "none";

export function readNomiaContactMapAlignment(value: unknown): NomiaContactMapAlignment {
  return (
    NOMIA_CONTACT_MAP_ALIGNMENTS.find((alignment) => alignment === value) ??
    NOMIA_CONTACT_MAP_ALIGNMENT_DEFAULT
  );
}
