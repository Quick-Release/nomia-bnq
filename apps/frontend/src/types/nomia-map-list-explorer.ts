export type NomiaMapRegionId =
  | "norte"
  | "centro"
  | "lisboa"
  | "alentejo"
  | "algarve"
  | "acores"
  | "madeira";

export type NomiaMapAudienceId = "empresas" | "cidadaos" | "investigacao";

export type NomiaMapListItem = {
  id: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
  regionId: NomiaMapRegionId;
  audienceIds: NomiaMapAudienceId[];
};

export type NomiaMapListExplorerData = {
  regions: { id: NomiaMapRegionId; label: string }[];
  audiences: { id: NomiaMapAudienceId; label: string }[];
  items: NomiaMapListItem[];
};
