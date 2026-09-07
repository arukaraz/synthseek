"use client";

import { useRetryTracks } from "@hooks/api";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";

import { useContentDetailActions } from "../../ContentDetailActionsContext";
import { isRemovableTrack, playableTrackId } from "../../helpers";
import { TrackRow } from "./TrackRow";
import type { TracklistProps } from "./types";

export function Tracklist({
  tracks,
  showArtist = false,
  selectable = false,
  isSelected,
  onToggleSelect,
}: TracklistProps) {
  const { requestTrack } = useContentDetailActions();
  const retryTracks = useRetryTracks();
  const { playEntity, enqueueEntity } = useEntityPlayback();
  const retryingId = retryTracks.isPending ? retryTracks.variables?.trackIds[0] : undefined;

  return (
    <ul>
      {tracks.map((track) => {
        const playableId = playableTrackId(track);
        return (
          <TrackRow
            key={track.externalId}
            track={track}
            showArtist={showArtist}
            isRetrying={retryingId === track.requestId}
            selectable={selectable}
            isSelected={selectable && track.requestId ? isSelected?.(track.requestId) : false}
            onToggleSelect={selectable && isRemovableTrack(track) ? () => onToggleSelect?.(track.requestId) : undefined}
            onPlayNow={playableId === null ? undefined : () => playEntity({ kind: "tracks", trackIds: [playableId] })}
            onEnqueue={
              playableId === null ? undefined : () => enqueueEntity({ kind: "tracks", trackIds: [playableId] })
            }
            onRequest={() =>
              requestTrack({
                id: track.externalId,
                title: track.title,
                artistName: track.artist,
                durationMs: track.durationMs,
                trackNumber: track.trackNumber,
                isrc: null,
                album: track.album,
              })
            }
            onRetry={() => {
              if (track.requestId) retryTracks.mutate({ trackIds: [track.requestId] });
            }}
          />
        );
      })}
    </ul>
  );
}
