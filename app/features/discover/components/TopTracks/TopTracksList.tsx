"use client";

import { FadeScroll } from "@components/FadeScroll";

import { list } from "./styles";
import { TopTrackRow } from "./TopTrackRow";
import type { TopTracksListProps } from "./types";

export function TopTracksList({ tracks, startRank }: TopTracksListProps) {
  return (
    <FadeScroll>
      <div className={list()}>
        {tracks.map((track, index) => (
          <TopTrackRow key={track.catalogTrackId} track={track} rank={startRank + index} />
        ))}
      </div>
    </FadeScroll>
  );
}
