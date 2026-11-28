"use client";

import { Reorder, useDragControls } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { useAccessibility } from "@modules/providers/AccessibilityProvider";
import { listPositionAttributes } from "@utils/list-position";

import { QueueRowMenu } from "./QueueRowMenu";
import { TrackCover } from "./TrackCover";
import { QUEUE_MOVE_SHORTCUTS } from "./constants";
import { labelledOnHover, trackInitials } from "./helpers";
import { queueMoveFromKey } from "./queueMove";
import { iconButton, queueGrip, queueRow, queueRowArtist, queueRowLines, queueRowText, queueRowTitle } from "./styles";
import type { PlayerQueueRowProps } from "./types";

export function QueueRow({ entry, current, editable, removable = false, actions, place, onMove }: PlayerQueueRowProps) {
  const { t } = useTranslation("player");
  const { mode: accessibilityMode } = useAccessibility();
  const controls = useDragControls();
  const movable = editable && place !== undefined && onMove !== undefined;
  const rowAttributes = {
    role: place === undefined ? undefined : "listitem",
    ...listPositionAttributes(place === undefined ? undefined : { setSize: place.total, posInSet: place.position }),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (!movable) return;
      const target = queueMoveFromKey(event);
      if (target === null) return;
      event.preventDefault();
      onMove(target);
    },
  };

  const body = (
    <>
      {editable ? (
        <span
          className={queueGrip()}
          onPointerDown={(event) => controls.start(event)}
          {...labelledOnHover(t("queue.reorder", { title: entry.track.title }))}
        >
          <Menu className="size-3.5" />
        </span>
      ) : null}
      <button
        type="button"
        className={queueRowText()}
        onClick={() => actions.jumpTo(entry.index)}
        aria-keyshortcuts={movable ? QUEUE_MOVE_SHORTCUTS : undefined}
        data-queue-track={entry.track.id}
        {...labelledOnHover(t("queue.jumpTo", { title: entry.track.title }))}
      >
        <TrackCover
          initials={trackInitials(entry.track.album)}
          tone={entry.track.tone}
          size="row"
          artworkUrl={entry.track.artworkUrl}
        />
        <span className={queueRowLines()}>
          <span className={queueRowTitle({ current })}>{entry.track.title}</span>
          <span className={queueRowArtist()}>{entry.track.artist}</span>
        </span>
      </button>
      {accessibilityMode && movable ? <QueueRowMenu title={entry.track.title} place={place} onMove={onMove} /> : null}
      {editable || removable ? (
        <button
          type="button"
          className={iconButton({ size: "inline" })}
          onClick={() => actions.removeFromQueue(entry.index)}
          {...labelledOnHover(t("queue.remove", { title: entry.track.title }))}
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </>
  );

  if (!editable)
    return (
      <div className={queueRow({ current })} {...rowAttributes}>
        {body}
      </div>
    );

  return (
    <Reorder.Item
      value={entry.track}
      as="div"
      className={queueRow({ current })}
      dragListener={false}
      dragControls={controls}
      {...rowAttributes}
    >
      {body}
    </Reorder.Item>
  );
}
