"use client";

import { useRetryTracks } from "@hooks/api";

import { useContentDetailActions } from "../../ContentDetailActionsContext";
import { TrackRow } from "./TrackRow";
import type { TracklistProps } from "./types";

export function Tracklist({ tracks, showArtist = false, albumContext }: TracklistProps) {
  const { requestTrack } = useContentDetailActions();
  const retryTracks = useRetryTracks();
  const retryingId = retryTracks.isPending ? retryTracks.variables?.trackIds[0] : undefined;

  return (
    <ul>
      {tracks.map((track, index) => (
        <TrackRow
          key={track.externalId}
          track={track}
          rank={track.trackNumber || index + 1}
          showArtist={showArtist}
          isRetrying={retryingId === track.requestId}
          onRequest={() =>
            requestTrack({
              id: track.externalId,
              title: track.title,
              artistName: track.artist,
              durationMs: track.durationMs,
              trackNumber: track.trackNumber,
              isrc: null,
              album: albumContext,
            })
          }
          onRetry={() => {
            if (track.requestId) retryTracks.mutate({ trackIds: [track.requestId] });
          }}
        />
      ))}
    </ul>
  );
}
