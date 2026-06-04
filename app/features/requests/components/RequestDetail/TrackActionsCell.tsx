"use client";

import { IconButton } from "@components/ui/IconButton";
import { isProcessingStatus, isRetryableStatus } from "@utils/status-helpers";
import { RefreshCw, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TrackActionsCellProps } from "./types";

export function TrackActionsCell({ track, canAct, onRetry, onCancel }: TrackActionsCellProps) {
  const { t } = useTranslation("requests");
  const showRetry = canAct && isRetryableStatus(track.status);
  const showCancel = canAct && isProcessingStatus(track.status);

  if (!canAct) {
    return <span className="text-fg/20 block text-right text-xs">-</span>;
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {showRetry && (
        <IconButton
          icon={RefreshCw}
          variant="green"
          size="sm"
          aria-label={t("tracks.retry")}
          title={t("tracks.retryTitle")}
          onClick={onRetry}
        />
      )}
      {showCancel && (
        <IconButton
          icon={X}
          variant="red"
          size="sm"
          aria-label={t("tracks.cancel")}
          title={t("tracks.cancelTitle")}
          onClick={onCancel}
        />
      )}
      {!showRetry && !showCancel && <span className="text-fg/20 text-xs">-</span>}
    </div>
  );
}
