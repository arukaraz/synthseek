"use client";

import { QueueAddButton } from "@components/ui/QueueAddButton";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { queueCell } from "../styles";
import type { TrackQueueCellProps } from "./types";

export function TrackQueueCell({ item, onEnqueue }: TrackQueueCellProps) {
  const { t } = useTranslation("player");
  const handleAdd = useCallback(() => onEnqueue([item.id]), [onEnqueue, item.id]);

  if (!item.playable) return null;

  return (
    <div className={queueCell()}>
      <QueueAddButton
        onAdd={handleAdd}
        label={t("queue.addTrack", { title: item.title })}
        confirmedLabel={t("queue.added", { count: 1 })}
        revealOnHover
      />
    </div>
  );
}
