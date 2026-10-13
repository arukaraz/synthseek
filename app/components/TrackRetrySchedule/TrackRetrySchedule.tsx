"use client";

import { Clock, History } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";

import { formatTimeUntil } from "@utils/formatters";

import { scheduleFact, scheduleIcon, scheduleRow, scheduleTrigger } from "./styles";
import type { TrackRetryScheduleProps } from "./types";

export function TrackRetrySchedule({ nextRetryAt, retryCount, compact = false }: TrackRetryScheduleProps) {
  const { t } = useTranslation("components");
  const [scheduleOpen, setScheduleOpen] = useState(false);

  if (!nextRetryAt && retryCount <= 0) return null;

  const attemptsLabel = retryCount > 0 ? t("trackRetrySchedule.attempts", { count: retryCount }) : null;

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
            {compact && attemptsLabel !== null ? <p>{attemptsLabel}</p> : null}
          </PopoverContent>
        </Popover>
      ) : compact && attemptsLabel !== null ? (
        <span role="img" aria-label={attemptsLabel} title={attemptsLabel} className={scheduleIcon()}>
          <History className="size-3.5" aria-hidden />
        </span>
      ) : (
        <History className="size-3.5 shrink-0" aria-hidden />
      )}
      {!compact && attemptsLabel !== null ? <span className={scheduleFact()}>{attemptsLabel}</span> : null}
    </div>
  );
}
