"use client";

import useAlbum from "@hooks/api/useAlbum";
import { useRequestMutations } from "@hooks/api/mutations/useRequestMutations";
import { ContentType, RequestStatus, type AlbumWithTracks } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import { confirm } from "@utils/confirm";
import { trpc } from "@utils/trpc";
import { calculateAlbumStatus, isSingleTrackRequest } from "@utils/request-helpers";
import { isProcessingStatus } from "@utils/status-helpers";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import { CardActions } from "./components/CardActions";
import { CardHeader } from "./components/CardHeader";
import { RequestProgress } from "./components/RequestProgress";
import { TrackList } from "./components/TrackList";

type RequestableContentType = typeof ContentType.enum.album | typeof ContentType.enum.playlist;

interface RequestCardProps {
  album: AlbumWithTracks;
  contentType?: RequestableContentType;
}

export const RequestCard = memo(function RequestCard({
  album,
  contentType = ContentType.enum.album,
}: RequestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { getActions } = useAlbum();
  const { handleRemove, handleRetryAlbum, handleCancelAlbum } = getActions(album.id);
  const { getActions: getTrackActions } = useRequestMutations();
  const utils = trpc.useUtils();

  const isPlaylist = contentType === ContentType.enum.playlist;

  const deletePlaylist = trpc.requests.deletePlaylist.useMutation({
    onSuccess: () => utils.requests.getAllPlaylists.invalidate(),
  });
  const retryPlaylist = trpc.requests.retryPlaylist.useMutation({
    onSuccess: () => utils.requests.getAllPlaylists.invalidate(),
  });
  const cancelPlaylist = trpc.requests.cancelPlaylist.useMutation({
    onSuccess: () => utils.requests.getAllPlaylists.invalidate(),
  });

  const { newStatus: calculatedStatus, completedCount } = calculateAlbumStatus(album.tracks);
  const statusConfig = REQUEST_STATUS_CONFIG[calculatedStatus];
  const isSingleTrack = isSingleTrackRequest(album.tracks);

  const canRetry =
    calculatedStatus === RequestStatus.enum.failed ||
    calculatedStatus === RequestStatus.enum.cancelled ||
    calculatedStatus === RequestStatus.enum.partially_complete ||
    calculatedStatus === RequestStatus.enum.paused;
  const canCancel = isProcessingStatus(calculatedStatus);

  const label = isPlaylist ? "Playlist" : "Album";

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `Remove ${label} Request`,
      message: `Remove "${album.name}" by ${album.artist}? This action cannot be undone.`,
      variant: "danger",
      confirmText: `Remove ${label}`,
      cancelText: "Keep",
    });

    if (confirmed) {
      if (isPlaylist) {
        deletePlaylist.mutate({ playlistId: album.id });
      } else {
        handleRemove();
      }
    }
  };

  const handleRetry = () => {
    if (isPlaylist) {
      retryPlaylist.mutate({ playlistId: album.id });
    } else {
      handleRetryAlbum();
    }
  };

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: `Cancel ${label} Downloads`,
      message: `Cancel all active downloads for "${album.name}" by ${album.artist}?`,
      variant: "danger",
      confirmText: "Cancel Downloads",
      cancelText: "Keep Downloading",
    });

    if (confirmed) {
      if (isPlaylist) {
        cancelPlaylist.mutate({ playlistId: album.id });
      } else {
        handleCancelAlbum();
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group from-surface/40 to-surface/20 relative overflow-hidden rounded-xl border bg-gradient-to-br p-3 shadow-lg transition-all hover:shadow-xl sm:p-4 sm:backdrop-blur-sm",
        statusConfig.borderColor
      )}
      data-cy="content-card"
      data-status={calculatedStatus}
      data-testid="content-request-card"
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br opacity-5",
          statusConfig.bgGradient
        )}
      />

      <motion.div
        className={cn(
          "decorative-animation pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-xl transition-opacity group-hover:opacity-10",
          statusConfig.glowColor
        )}
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative space-y-3">
        <CardHeader
          imageUrl={album.album_art}
          title={album.name}
          subtitle={album.artist}
          status={calculatedStatus}
          size="md"
          showMusicBadge
          dataCyPrefix={contentType}
        />

        <RequestProgress
          variant={contentType}
          completedTracks={completedCount}
          totalTracks={album.total_tracks}
          isSingleTrack={isSingleTrack}
          status={calculatedStatus}
          createdAt={album.created_at}
          dataCyPrefix={contentType}
        />

        {album.tracks && album.tracks.length > 0 && (
          <TrackList
            request={album}
            expanded={expanded}
            isSingleTrack={isSingleTrack}
            onToggleExpanded={() => setExpanded(!expanded)}
            onCancelTrack={(trackId) => getTrackActions(trackId).handleCancelTrack()}
            onRetryTrack={(trackId) => getTrackActions(trackId).handleRetryTrack()}
          />
        )}

        <CardActions
          canRetry={canRetry}
          canCancel={canCancel}
          onRetry={handleRetry}
          onCancel={handleCancel}
          onRemove={handleDelete}
          variant="with-label"
          itemType={contentType}
        />
      </div>
    </motion.div>
  );
});
