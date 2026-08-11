"use client";

import { Clock, History, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatTimeUntil } from "@utils/formatters";

import { retryNowButton, scheduleFacts, scheduleRow, scheduleSeparator } from "./styles";
import type { TrackRetryScheduleProps } from "./types";

export function TrackRetrySchedule({ nextRetryAt, retryCount, onRetryNow }: TrackRetryScheduleProps) {
  const { t } = useTranslation("components");

  if (!nextRetryAt && retryCount <= 0) return null;

  const scheduled = nextRetryAt !== null;
  const Icon = scheduled ? Clock : History;

  return (
    <div className={scheduleRow()}>
      <span className={scheduleFacts()} title={scheduled ? t("trackRetrySchedule.watching") : undefined}>
        <Icon className="size-3 shrink-0" aria-hidden />
        {scheduled ? t("trackRetrySchedule.nextAttempt", { time: formatTimeUntil(new Date(nextRetryAt)) }) : null}
        {scheduled && retryCount > 0 ? (
          <span className={scheduleSeparator()} aria-hidden>
            &middot;
          </span>
        ) : null}
        {retryCount > 0 ? t("trackRetrySchedule.attempts", { count: retryCount }) : null}
      </span>
      {onRetryNow ? (
        <button type="button" className={retryNowButton()} onClick={onRetryNow}>
          <RefreshCw className="size-3 shrink-0" aria-hidden />
          {t("trackRetrySchedule.retryNow")}
        </button>
      ) : null}
    </div>
  );
}
