"use client";

import { RequestStatus } from "@api/__generated__/types";
import { formatTimeUntil } from "@utils/formatters";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

import { watchHint } from "./styles";
import type { TrackWatchHintProps } from "./types";

export function TrackWatchHint({ track }: TrackWatchHintProps) {
  const { t } = useTranslation("requests");

  if (track.status !== RequestStatus.enum.failed || !track.watch_enabled || !track.next_retry_at) return null;

  const label = t("watch.watchingNextRetry", { time: formatTimeUntil(new Date(track.next_retry_at)) });

  return (
    <span className={watchHint()} title={t("watch.retryCount", { count: track.retry_count })}>
      <Eye className="size-3 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );
}
