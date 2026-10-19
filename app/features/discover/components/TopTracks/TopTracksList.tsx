"use client";

import { cn } from "@utils/cn";

import { scrollFadeBottom } from "../styles";
import { list } from "./styles";
import { TopTrackRow } from "./TopTrackRow";
import type { TopTracksListProps } from "./types";

export function TopTracksList({ tracks, startRank }: TopTracksListProps) {
  return (
    <div className={cn(list(), scrollFadeBottom())}>
      {tracks.map((track, index) => (
        <TopTrackRow key={track.catalogTrackId} track={track} rank={startRank + index} />
      ))}
    </div>
  );
}
