"use client";

import useAlbum from "@hooks/api/useAlbum";
import { useRequestMutations } from "@hooks/api/mutations/useRequestMutations";
import { ContentType, RequestStatus, type AlbumWithTracks } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import { confirm } from "@utils/confirm";
import { calculateAlbumStatus, isSingleTrackRequest } from "@utils/request-helpers";
import { isProcessingStatus } from "@utils/status-helpers";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import { CardActions } from "../CardActions";
import { CardHeader } from "../CardHeader";
import { RequestProgress } from "../RequestProgress";
import { AlbumTrackList } from "./components/AlbumTrackList";

interface AlbumCardProps {
  album: AlbumWithTracks;
}

export const AlbumCard = memo(function AlbumCard({ album }: AlbumCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { getActions } = useAlbum();
  const { handleRemove, handleRetryAlbum, handleCancelAlbum } = getActions(album.id);
  const { getActions: getTrackActions } = useRequestMutations();

  const { newStatus: calculatedStatus, completedCount } = calculateAlbumStatus(album.tracks);
  const statusConfig = REQUEST_STATUS_CONFIG[calculatedStatus];
  const isSingleTrack = isSingleTrackRequest(album.tracks);

  const canRetry =
    calculatedStatus === RequestStatus.enum.failed ||
    calculatedStatus === RequestStatus.enum.cancelled ||
    calculatedStatus === RequestStatus.enum.partially_complete ||
    calculatedStatus === RequestStatus.enum.paused;
  const canCancel = isProcessingStatus(calculatedStatus);

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Remove Album Request",
      message: `Remove "${album.name}" by ${album.artist}? This action cannot be undone.`,
      variant: "danger",
      confirmText: "Remove Album",
      cancelText: "Keep",
    });

    if (confirmed) {
      handleRemove();
    }
  };

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: "Cancel Album Downloads",
      message: `Cancel all active downloads for "${album.name}" by ${album.artist}?`,
      variant: "danger",
      confirmText: "Cancel Downloads",
      cancelText: "Keep Downloading",
    });

    if (confirmed) {
      handleCancelAlbum();
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
      data-cy="album-card"
      data-status={calculatedStatus}
      data-testid="album-request-card"
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
        animate={{
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative space-y-3">
        <CardHeader
          imageUrl={album.album_art}
          title={album.name}
          subtitle={album.artist}
          status={calculatedStatus}
          size="md"
          showMusicBadge
          dataCyPrefix={ContentType.enum.album}
        />

        <RequestProgress
          variant={ContentType.enum.album}
          completedTracks={completedCount}
          totalTracks={album.total_tracks}
          isSingleTrack={isSingleTrack}
          status={calculatedStatus}
          createdAt={album.created_at}
          dataCyPrefix={ContentType.enum.album}
        />

        {album.tracks && album.tracks.length > 0 && (
          <AlbumTrackList
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
          onRetry={handleRetryAlbum}
          onCancel={handleCancel}
          onRemove={handleDelete}
          variant="with-label"
          itemType={ContentType.enum.album}
        />
      </div>
    </motion.div>
  );
});
