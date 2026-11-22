"use client";

import { RequestStatus } from "@api/__generated__/types";
import { formatTimeUntil } from "@utils/formatters";
import { Clock, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { retryLine, retryLinePart } from "./styles";
import type { TrackRetryLineProps } from "./types";

export function TrackRetryLine({ track }: TrackRetryLineProps) {
  const { t } = useTranslation("requests");

  if (track.status !== RequestStatus.enum.failed) return null;

  const scheduled = track.watch_enabled && track.next_retry_at !== null;

  return (
    <span className={retryLine()}>
      <span className={retryLinePart()}>
        {scheduled ? <Clock aria-hidden /> : <EyeOff aria-hidden />}
        {scheduled && track.next_retry_at
          ? t("tracks.nextTry", { time: formatTimeUntil(new Date(track.next_retry_at)) })
          : t(track.watch_enabled ? "tracks.noTrySet" : "tracks.notWatching")}
      </span>
      {track.retry_count > 0 ? (
        <>
          <span aria-hidden>·</span>
          <span className={retryLinePart()}>{t("tracks.attempt", { count: track.retry_count })}</span>
        </>
      ) : null}
    </span>
  );
}
