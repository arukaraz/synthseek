"use client";

import { QueueAddButton } from "@components/ui/QueueAddButton";
import { useQueuedTrackIds } from "@hooks/ui/player";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { queueCell } from "../styles";
import type { TrackQueueCellProps } from "./types";

export function TrackQueueCell({ item, onEnqueue }: TrackQueueCellProps) {
  const { t } = useTranslation("player");
  const queuedIds = useQueuedTrackIds();
  const handleAdd = useCallback(() => onEnqueue([item.id]), [onEnqueue, item.id]);

  if (!item.playable) return null;

  return (
    <div className={queueCell()}>
      <QueueAddButton
        onAdd={handleAdd}
        label={t("queue.addTrack", { title: item.title })}
        confirmedLabel={t("queue.inQueue", { title: item.title })}
        inQueue={queuedIds.has(item.id)}
        revealOnHover
      />
    </div>
  );
}
