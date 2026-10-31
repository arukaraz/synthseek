import type { BoardSize } from "@hooks/api/queries/board/types";

export interface ArtistSpotlightProps {
  size: BoardSize;
  info: string;
}

export interface ArtistSpotlightCardProps {
  artist: {
    id: string;
    name: string;
    images: { url: string; width?: number | null; height?: number | null }[];
    genres?: string[];
  };
  latestAlbum: {
    id: string;
    name: string;
    images: { url: string; width?: number | null; height?: number | null }[];
    total_tracks?: number;
  } | null;
  onClick?: () => void;
  onPlay?: () => void;
}
