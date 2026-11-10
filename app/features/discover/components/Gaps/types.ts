import type { RequestIntent } from "@features/content-detail";
import type { CatalogAlbumRef, DiscographyGap } from "@hooks/api/queries/analytics/types";

export interface GapCardProps {
  gap: DiscographyGap;
  onOpen: (album: CatalogAlbumRef) => void;
  onRequest: (album: CatalogAlbumRef, intent: RequestIntent) => void;
  onOpenArtist: () => void;
}

export interface GapHeaderProps {
  gap: DiscographyGap;
  onOpenArtist: () => void;
}
