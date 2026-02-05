"use client";

import { Crown } from "lucide-react";
import { topArtistsContainer, scrollableGrid } from "../styles";

interface TopArtist {
  artist: string;
  trackCount: number;
}

interface TopArtistsListProps {
  artists: TopArtist[];
}

export function TopArtistsList({ artists }: TopArtistsListProps) {
  if (artists.length === 0) {
    return null;
  }

  return (
    <div className={topArtistsContainer()}>
      <div className="mb-4 flex items-center gap-2">
        <Crown className="text-primary-400 h-5 w-5" />
        <span className="text-fg text-lg font-semibold">Artist Breakdown</span>
      </div>
      <div className={scrollableGrid()}>
        {artists.map((artist) => (
          <div key={artist.artist} className="flex items-center justify-between text-base">
            <span className="text-fg/90 truncate">{artist.artist}</span>
            <span className="text-primary-400 ml-3 shrink-0 font-semibold">{artist.trackCount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
