import type { RefObject } from "react";

export interface SimilarArtistEntry {
  catalogArtistId: string | null;
  name: string;
  image: string | null;
}

export interface SimilarArtistsProps {
  artists: SimilarArtistEntry[];
  onSelect: (artist: SimilarArtistEntry) => void;
  trackRef: RefObject<HTMLDivElement | null>;
}
