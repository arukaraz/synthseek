"use client";

import { RequestStatus, type TrackRequest } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { CircularLoadingImage } from "@components/ui/CircularLoadingImage";
import { IconButton } from "@components/ui/IconButton";
import { trackItem } from "../../../styles";
import { motion } from "framer-motion";
import { X, RefreshCw } from "lucide-react";

interface AlbumTrackItemProps {
  track: TrackRequest;
  albumArt?: string | null;
  index: number;
  onCancel?: () => void;
  onRetry?: () => void;
}

export function AlbumTrackItem({ track, albumArt, index, onCancel, onRetry }: AlbumTrackItemProps) {
  const statusConfig = REQUEST_STATUS_CONFIG[track.status];

  const isComplete = track.status === RequestStatus.enum.complete;
  const isFailed = track.status === RequestStatus.enum.failed;
  const isCancelled = track.status === RequestStatus.enum.cancelled;

  const showCancel = !isComplete && !isFailed && !isCancelled;
  const showRetry = isFailed || isCancelled;

  return (
    <motion.div
      className={trackItem({ size: "md", group: "none" })}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
    >
      <CircularLoadingImage src={albumArt} alt={track.title} status={track.status as RequestStatus} size="sm" />

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", isComplete ? "text-fg/70" : isFailed ? "text-fg/50" : "text-fg/80")}>
          {track.title}
        </p>
        <p className={cn("text-xs", statusConfig.color)}>{statusConfig.label}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {showCancel && (
          <IconButton icon={X} variant="default" size="sm" aria-label="Cancel download" onClick={onCancel} />
        )}
        {showRetry && (
          <IconButton icon={RefreshCw} variant="green" size="sm" aria-label="Retry download" onClick={onRetry} />
        )}
      </div>
    </motion.div>
  );
}
