"use client";

import { QueueAddButton } from "@components/ui/QueueAddButton";
import { playerActions, useQueuePresence } from "@hooks/ui/player";
import { useCallback } from "react";

import { queueCell } from "../styles";
import type { TrackQueueCellProps } from "./types";

export function TrackQueueCell({ item, onEnqueue }: TrackQueueCellProps) {
  const presenceOf = useQueuePresence();
  const handleAdd = useCallback(() => onEnqueue([item.id]), [onEnqueue, item.id]);
  const handleRemove = useCallback(() => playerActions.removeTrackFromQueue(item.id), [item.id]);

  if (!item.playable) return null;

  return (
    <div className={queueCell()}>
      <QueueAddButton
        title={item.title}
        presence={presenceOf(item.id)}
        onAdd={handleAdd}
        onRemove={handleRemove}
        revealOnHover
      />
    </div>
  );
}
