"use client";

import { TrackRow } from "./TrackRow";
import type { TracklistProps } from "./types";

export function Tracklist({ tracks, showArtist = false }: TracklistProps) {
  return (
    <ul>
      {tracks.map((track, index) => (
        <TrackRow key={track.externalId} track={track} rank={track.trackNumber || index + 1} showArtist={showArtist} />
      ))}
    </ul>
  );
}
