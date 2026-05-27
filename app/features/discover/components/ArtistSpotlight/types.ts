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
    total_tracks: number;
  } | null;
  onClick?: () => void;
}
