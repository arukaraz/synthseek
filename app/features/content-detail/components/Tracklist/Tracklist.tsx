"use client";

import { useRetryTracks } from "@hooks/api";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { playerActions, usePlayerResumableHere, useQueuePresence } from "@hooks/ui/player";

import { useContentDetailActions } from "../../ContentDetailActionsContext";
import { useContentDetailClose } from "../../ContentDetailCloseContext";
import { playableTrackId, trackRequestInput } from "../../helpers";
import { useDetailPlayback } from "../../hooks/useDetailPlayback";
import { TrackRow } from "./TrackRow";
import type { TracklistProps } from "./types";

export function Tracklist({ tracks, showArtist = false, onArtistNavigate }: TracklistProps) {
  const { requestTrack } = useContentDetailActions();
  const retryTracks = useRetryTracks();
  const { enqueueEntity } = useEntityPlayback();
  const closeDetail = useContentDetailClose();
  const { playTrack } = useDetailPlayback(closeDetail);
  const presenceOf = useQueuePresence();
  const resumableHere = usePlayerResumableHere();
  const retryingId = retryTracks.isPending ? retryTracks.variables?.trackIds[0] : undefined;

  return (
    <ul>
      {tracks.map((track, position) => {
        const playableId = playableTrackId(track);
        return (
          <TrackRow
            key={track.externalId}
            track={track}
            showArtist={showArtist}
            isRetrying={retryingId === track.requestId}
            onPlayNow={playableId === null ? undefined : () => playTrack(playableId)}
            onTogglePlay={playableId === null || !resumableHere ? undefined : playerActions.togglePlay}
            onEnqueue={
              playableId === null ? undefined : () => enqueueEntity({ kind: "tracks", trackIds: [playableId] })
            }
            onRemoveFromQueue={playableId === null ? undefined : () => playerActions.removeTrackFromQueue(playableId)}
            queuePresence={playableId === null ? "absent" : presenceOf(playableId)}
            previewSlot={position}
            onArtistNavigate={onArtistNavigate ? () => onArtistNavigate(track) : undefined}
            onRequest={() => requestTrack(trackRequestInput(track), "direct")}
            onCustomizeRequest={() => requestTrack(trackRequestInput(track), "customize")}
            onRetry={() => {
              if (track.requestId) retryTracks.mutate({ trackIds: [track.requestId] });
            }}
          />
        );
      })}
    </ul>
  );
}
