"use client";

import { list } from "./styles";
import { TopTrackRow } from "./TopTrackRow";
import type { TopTracksListProps } from "./types";

export function TopTracksList({ candidates, startRank }: TopTracksListProps) {
  return (
    <div className={list()}>
      {candidates.map((candidate, index) => (
        <TopTrackRow key={candidate.catalogTrackId} candidate={candidate} rank={startRank + index} />
      ))}
    </div>
  );
}
