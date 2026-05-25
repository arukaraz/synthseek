"use client";

import { IconButton } from "@components/ui/IconButton";
import { type TrackRequest } from "@api/__generated__/types";
import { isProcessingStatus, isRetryableStatus } from "@utils/status-helpers";
import { RefreshCw, X } from "lucide-react";

interface TrackActionsCellProps {
  track: TrackRequest;
  canAct: boolean;
  onRetry: () => void;
  onCancel: () => void;
}

export function TrackActionsCell({ track, canAct, onRetry, onCancel }: TrackActionsCellProps) {
  const showRetry = canAct && isRetryableStatus(track.status);
  const showCancel = canAct && isProcessingStatus(track.status);

  if (!canAct) {
    return <span className="text-fg/20 block text-right text-xs">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {showRetry && (
        <IconButton
          icon={RefreshCw}
          variant="green"
          size="sm"
          aria-label="Retry track"
          title="Retry"
          onClick={onRetry}
        />
      )}
      {showCancel && (
        <IconButton icon={X} variant="red" size="sm" aria-label="Cancel track" title="Cancel" onClick={onCancel} />
      )}
      {!showRetry && !showCancel && <span className="text-fg/20 text-xs">—</span>}
    </div>
  );
}
