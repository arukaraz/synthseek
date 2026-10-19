import type { OrbitAlbum } from "@hooks/api/queries/analytics/types";

export interface OrbitCardProps {
  album: OrbitAlbum;
  onOpen: () => void;
}
