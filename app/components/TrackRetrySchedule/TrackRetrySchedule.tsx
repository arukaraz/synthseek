"use client";

import { Clock, History, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";

import { formatTimeUntil } from "@utils/formatters";

import { retryNowButton, scheduleFact, scheduleRow, scheduleTrigger } from "./styles";
import type { TrackRetryScheduleProps } from "./types";

export function TrackRetrySchedule({ nextRetryAt, retryCount, onRetryNow }: TrackRetryScheduleProps) {
  const { t } = useTranslation("components");
  const [scheduleOpen, setScheduleOpen] = useState(false);

  if (!nextRetryAt && retryCount <= 0) return null;

  const retryNowLabel = t("trackRetrySchedule.retryNow");

  return (
    <div className={scheduleRow()}>
      {nextRetryAt ? (
        <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <PopoverTrigger asChild>
            <button type="button" aria-label={t("trackRetrySchedule.watching")} className={scheduleTrigger()}>
              <Clock className="size-3.5" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top">
            <p>{t("trackRetrySchedule.watching")}</p>
            <p>{t("trackRetrySchedule.nextAttempt", { time: formatTimeUntil(new Date(nextRetryAt)) })}</p>
          </PopoverContent>
        </Popover>
      ) : (
        <History className="size-3.5 shrink-0" aria-hidden />
      )}
      {retryCount > 0 ? (
        <span className={scheduleFact()}>{t("trackRetrySchedule.attempts", { count: retryCount })}</span>
      ) : null}
      {onRetryNow ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" aria-label={retryNowLabel} className={retryNowButton()} onClick={onRetryNow}>
                <RefreshCw className="size-3.5" aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{retryNowLabel}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
}
