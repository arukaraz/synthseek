import type { RefObject } from "react";

export interface SimilarArtistEntry {
  deezerArtistId: string | null;
  name: string;
  match: number;
  image: string | null;
}

export interface SimilarArtistsProps {
  artists: SimilarArtistEntry[];
  onSelect: (artist: SimilarArtistEntry) => void;
  trackRef: RefObject<HTMLDivElement | null>;
}
