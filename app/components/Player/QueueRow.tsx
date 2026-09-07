"use client";

import { Reorder, useDragControls } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TrackCover } from "./TrackCover";
import { labelled, trackInitials } from "./helpers";
import { iconButton, queueGrip, queueRow, queueRowArtist, queueRowLines, queueRowText, queueRowTitle } from "./styles";
import type { PlayerQueueRowProps } from "./types";

export function QueueRow({ entry, current, editable, actions }: PlayerQueueRowProps) {
  const { t } = useTranslation("player");
  const controls = useDragControls();

  const body = (
    <>
      {editable ? (
        <span
          className={queueGrip()}
          onPointerDown={(event) => controls.start(event)}
          {...labelled(t("queue.reorder", { title: entry.track.title }))}
        >
          <Menu className="size-3.5" />
        </span>
      ) : null}
      <button
        type="button"
        className={queueRowText()}
        onClick={() => actions.jumpTo(entry.index)}
        {...labelled(t("queue.jumpTo", { title: entry.track.title }))}
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
      {editable ? (
        <button
          type="button"
          className={iconButton({ size: "inline" })}
          onClick={() => actions.removeFromQueue(entry.index)}
          {...labelled(t("queue.remove", { title: entry.track.title }))}
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </>
  );

  if (!editable) return <div className={queueRow({ current })}>{body}</div>;

  return (
    <Reorder.Item
      value={entry.track}
      as="div"
      className={queueRow({ current })}
      dragListener={false}
      dragControls={controls}
    >
      {body}
    </Reorder.Item>
  );
}
