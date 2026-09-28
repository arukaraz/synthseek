"use client";

import { useRetryTracks } from "@hooks/api";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { playerActions, useQueuePresence } from "@hooks/ui/player";

import { useContentDetailActions } from "../../ContentDetailActionsContext";
import { isRemovableTrack, playableTrackId } from "../../helpers";
import { tracklistRoot } from "../../styles";
import { TrackRow } from "./TrackRow";
import type { TracklistProps } from "./types";

export function Tracklist({
  tracks,
  showArtist = false,
  selectable = false,
  isSelected,
  onSelectTrack,
  onPreviewHover,
  previewTone,
  onArtistNavigate,
}: TracklistProps) {
  const { requestTrack } = useContentDetailActions();
  const retryTracks = useRetryTracks();
  const { playEntity, enqueueEntity } = useEntityPlayback();
  const presenceOf = useQueuePresence();
  const retryingId = retryTracks.isPending ? retryTracks.variables?.trackIds[0] : undefined;

  return (
    <ul className={tracklistRoot()}>
      {tracks.map((track) => {
        const playableId = playableTrackId(track);
        const selectableId = selectable && isRemovableTrack(track) ? track.requestId : null;
        return (
          <TrackRow
            key={track.externalId}
            track={track}
            showArtist={showArtist}
            isRetrying={retryingId === track.requestId}
            selectable={selectable}
            isSelected={selectableId ? (isSelected?.(selectableId) ?? false) : false}
            onSelectTrack={selectableId ? (extend) => onSelectTrack?.(selectableId, extend) : undefined}
            onPreviewHover={selectableId ? (hovering) => onPreviewHover?.(hovering ? selectableId : null) : undefined}
            previewTone={selectableId ? previewTone?.(selectableId) : undefined}
            onPlayNow={playableId === null ? undefined : () => playEntity({ kind: "tracks", trackIds: [playableId] })}
            onEnqueue={
              playableId === null ? undefined : () => enqueueEntity({ kind: "tracks", trackIds: [playableId] })
            }
            onRemoveFromQueue={playableId === null ? undefined : () => playerActions.removeTrackFromQueue(playableId)}
            queuePresence={playableId === null ? "absent" : presenceOf(playableId)}
            onArtistNavigate={onArtistNavigate ? () => onArtistNavigate(track) : undefined}
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
