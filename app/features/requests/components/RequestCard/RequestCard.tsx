"use client";

import {
  useDeleteAlbum,
  useDeletePlaylist,
  useRetryAlbum,
  useRetryPlaylist,
  useCancelAlbum,
  useCancelPlaylist,
  useCancelTrack,
  useRetryTrack,
} from "@hooks/api";
import { ContentType, RequestStatus, type RequestWithTracks } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import { confirm } from "@utils/confirm";
import { calculateAlbumStatus, isSingleTrackRequest } from "@utils/request-helpers";
import { isProcessingStatus } from "@utils/status-helpers";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import { CardActions } from "./components/CardActions";
import { CardHeader } from "./components/CardHeader";
import { RequestProgress } from "./components/RequestProgress";
import { TrackList } from "./components/TrackList";

interface RequestCardProps {
  request: RequestWithTracks;
}

export const RequestCard = memo(function RequestCard({ request }: RequestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const deleteAlbum = useDeleteAlbum();
  const deletePlaylist = useDeletePlaylist();
  const retryAlbum = useRetryAlbum();
  const retryPlaylist = useRetryPlaylist();
  const cancelAlbum = useCancelAlbum();
  const cancelPlaylist = useCancelPlaylist();
  const cancelTrack = useCancelTrack();
  const retryTrack = useRetryTrack();

  if (request.contentType !== ContentType.enum.album && request.contentType !== ContentType.enum.playlist) {
    return null;
  }

  const isPlaylist = request.contentType === ContentType.enum.playlist;

  const { newStatus: calculatedStatus, completedCount } = calculateAlbumStatus(request.tracks);
  const statusConfig = REQUEST_STATUS_CONFIG[calculatedStatus];
  const isSingleTrack = isSingleTrackRequest(request.tracks);

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
      message: `Remove "${request.name}" by ${request.artist}? This action cannot be undone.`,
      variant: "danger",
      confirmText: `Remove ${label}`,
      cancelText: "Keep",
    });

    if (!confirmed) return;

    if (isPlaylist) {
      deletePlaylist.mutate({ playlistId: request.id });
    } else {
      deleteAlbum.mutate({ albumId: request.id });
    }
  };

  const handleRetry = () => {
    if (isPlaylist) {
      retryPlaylist.mutate({ playlistId: request.id });
    } else {
      retryAlbum.mutate({ albumId: request.id });
    }
  };

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: `Cancel ${label} Downloads`,
      message: `Cancel all active downloads for "${request.name}" by ${request.artist}?`,
      variant: "danger",
      confirmText: "Cancel Downloads",
      cancelText: "Keep Downloading",
    });

    if (!confirmed) return;

    if (isPlaylist) {
      cancelPlaylist.mutate({ playlistId: request.id });
    } else {
      cancelAlbum.mutate({ albumId: request.id });
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
          imageUrl={request.album_art}
          title={request.name}
          subtitle={request.artist}
          status={calculatedStatus}
          size="md"
          showMusicBadge
          dataCyPrefix={request.contentType}
        />

        <RequestProgress
          variant={request.contentType}
          completedTracks={completedCount}
          totalTracks={request.total_tracks}
          isSingleTrack={isSingleTrack}
          status={calculatedStatus}
          createdAt={request.created_at}
          dataCyPrefix={request.contentType}
        />

        {request.tracks && request.tracks.length > 0 && (
          <TrackList
            request={request}
            expanded={expanded}
            isSingleTrack={isSingleTrack}
            onToggleExpanded={() => setExpanded(!expanded)}
            onCancelTrack={(trackId) => cancelTrack.mutate({ trackId })}
            onRetryTrack={(trackId) => retryTrack.mutate({ trackId })}
          />
        )}

        <CardActions
          canRetry={canRetry}
          canCancel={canCancel}
          onRetry={handleRetry}
          onCancel={handleCancel}
          onRemove={handleDelete}
          variant="with-label"
          itemType={request.contentType}
        />
      </div>
    </motion.div>
  );
});
