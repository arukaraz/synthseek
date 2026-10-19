import type { CatalogAlbumRef, DiscographyGap } from "@hooks/api/queries/analytics/types";

export interface GapCardProps {
  gap: DiscographyGap;
  onOpen: (album: CatalogAlbumRef) => void;
  onRequest: (album: CatalogAlbumRef) => void;
  onOpenArtist: () => void;
}
