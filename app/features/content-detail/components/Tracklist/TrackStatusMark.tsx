"use client";

import { TrackStatusIndicator } from "@components/TrackStatusIndicator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { isRetryableStatus } from "@utils/status-helpers";
import { Loader2, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { trackRetryButton, trackStatusIcon } from "../../styles";
import type { TrackStatusMarkProps } from "./types";

export function TrackStatusMark({ title, status, failureReason, canRetry, onRetry, isRetrying }: TrackStatusMarkProps) {
  const { t } = useTranslation("contentDetail");
  const { t: tStatus } = useTranslation("status");

  return (
    <>
      {canRetry && isRetryableStatus(status) ? (
        <button
          type="button"
          className={trackRetryButton()}
          onClick={onRetry}
          disabled={isRetrying}
          aria-label={t("retryTrack", { title })}
        >
          {isRetrying ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <RotateCcw className="size-4" aria-hidden />
          )}
        </button>
      ) : null}
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={trackStatusIcon()}>
              <TrackStatusIndicator status={status} failureReason={failureReason} hideLabel />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{tStatus(`request.${status}.label`)}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
