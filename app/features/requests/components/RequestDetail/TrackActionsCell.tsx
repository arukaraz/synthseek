"use client";

import { RequestStatus } from "@api/__generated__/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { isProcessingStatus, isRetryableStatus } from "@utils/status-helpers";
import { ChevronsUp, MoreVertical, RefreshCw, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { mobileActionsButton } from "../styles";
import type { TrackActionsCellProps } from "./types";

export function TrackActionsCell({ track, canAct, onRetry, onCancel, onPrioritize }: TrackActionsCellProps) {
  const { t } = useTranslation("requests");

  if (!canAct) {
    return <span className="text-fg/20 block text-right text-xs">-</span>;
  }

  const showRetry = isRetryableStatus(track.status);
  const showPrioritize = track.status === RequestStatus.enum.queued && track.priority === 0;
  const showCancel = isProcessingStatus(track.status);

  if (!showRetry && !showPrioritize && !showCancel) {
    return <span className="text-fg/20 block text-right text-xs">-</span>;
  }

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={mobileActionsButton()} aria-label={t("tracks.actionsMenu")}>
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showRetry && (
            <DropdownMenuItem onClick={onRetry} className="text-green-400 hover:text-green-300">
              <RefreshCw className="size-4" />
              {t("tracks.retry")}
            </DropdownMenuItem>
          )}
          {showPrioritize && (
            <DropdownMenuItem
              onClick={onPrioritize}
              title={t("tracks.jumpTheQueueTitle")}
              className="text-primary-400 hover:text-primary-300"
            >
              <ChevronsUp className="size-4" />
              {t("tracks.jumpTheQueue")}
            </DropdownMenuItem>
          )}
          {showCancel && (
            <DropdownMenuItem onClick={onCancel} className="text-red-400 hover:text-red-300">
              <X className="size-4" />
              {t("tracks.cancel")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
