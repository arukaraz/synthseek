"use client";

import { Eye, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatTimeUntil } from "@utils/formatters";

import { retryNowButton, scheduleFact, scheduleRow } from "./styles";
import type { TrackRetryScheduleProps } from "./types";

export function TrackRetrySchedule({ nextRetryAt, retryCount, onRetryNow }: TrackRetryScheduleProps) {
  const { t } = useTranslation("components");

  if (!nextRetryAt && retryCount <= 0) return null;

  return (
    <div className={scheduleRow()}>
      {nextRetryAt ? (
        <span className={scheduleFact()} title={t("trackRetrySchedule.watching")}>
          <Eye className="size-3 shrink-0" aria-hidden />
          {t("trackRetrySchedule.nextAttempt", { time: formatTimeUntil(new Date(nextRetryAt)) })}
        </span>
      ) : null}
      {retryCount > 0 ? <span>{t("trackRetrySchedule.attempts", { count: retryCount })}</span> : null}
      {onRetryNow ? (
        <button type="button" className={retryNowButton()} onClick={onRetryNow}>
          <RefreshCw className="size-3 shrink-0" aria-hidden />
          {t("trackRetrySchedule.retryNow")}
        </button>
      ) : null}
    </div>
  );
}
