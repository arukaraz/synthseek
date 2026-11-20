"use client";

import { useRetryTracks } from "@hooks/api";
import { playerActions, usePlayerResumableHere, useQueuePresence } from "@hooks/ui/player";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";

import { useContentDetailClose } from "../../ContentDetailCloseContext";
import { playableTrackId } from "../../helpers";
import { useDetailPlayback } from "../../hooks/useDetailPlayback";
import { PlaylistTrackRow } from "./PlaylistTrackRow";
import type { PlaylistTracklistProps } from "./types";

export function PlaylistTracklist({ playlistId, tracks, onArtistNavigate }: PlaylistTracklistProps) {
  const retryTracks = useRetryTracks();
  const { enqueueEntity, playNextEntity } = useEntityPlayback();
  const closeDetail = useContentDetailClose();
  const { playTrackFrom } = useDetailPlayback(closeDetail);
  const presenceOf = useQueuePresence();
  const resumableHere = usePlayerResumableHere();
  const retryingId = retryTracks.isPending ? retryTracks.variables?.trackIds[0] : undefined;

  return (
    <ul>
      {tracks.map((track, position) => {
        const playableId = playableTrackId(track);
        return (
          <PlaylistTrackRow
            key={track.requestId ?? track.externalId}
            track={track}
            position={position}
            presence={playableId === null ? "absent" : presenceOf(playableId)}
            onPlay={playableId === null ? undefined : () => playTrackFrom({ kind: "playlist", playlistId }, playableId)}
            onTogglePlay={playableId === null || !resumableHere ? undefined : playerActions.togglePlay}
            onPlayNext={
              playableId === null ? undefined : () => playNextEntity({ kind: "tracks", trackIds: [playableId] })
            }
            onEnqueue={
              playableId === null ? undefined : () => enqueueEntity({ kind: "tracks", trackIds: [playableId] })
            }
            onArtistNavigate={onArtistNavigate ? () => onArtistNavigate(track) : undefined}
            onRetry={() => {
              if (track.requestId) retryTracks.mutate({ trackIds: [track.requestId] });
            }}
            isRetrying={retryingId === track.requestId}
          />
        );
      })}
    </ul>
  );
}
