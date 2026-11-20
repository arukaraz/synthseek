"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { cn } from "@utils/cn";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { isRemovableTrack } from "../../helpers";
import { PlaylistRowFigures, PlaylistRowIdentity } from "../PlaylistTracklist";
import { playlistRow, playlistRowStatus } from "../PlaylistTracklist/styles";
import { TrackStatusMark } from "../Tracklist";
import { rowDragging, rowGrip, rowRemove, rowSelect } from "./styles";
import { TrashNextIcon } from "./TrashNextIcon";
import type { WorkshopTrackRowProps } from "./types";

export function WorkshopTrackRow({
  track,
  position,
  presence,
  editable,
  selected,
  onSelect,
  onPlay,
  onTogglePlay,
  onRemove,
  onNudge,
  onDrop,
  onArtistNavigate,
  onRetry,
  isRetrying,
}: WorkshopTrackRowProps) {
  const { t } = useTranslation("contentDetail");
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);
  const current = presence === "playing" || presence === "paused";

  const body = (
    <>
      <PlaylistRowIdentity
        track={track}
        position={position}
        presence={presence}
        onPlay={onPlay}
        onTogglePlay={onTogglePlay}
        onArtistNavigate={onArtistNavigate}
      />
      {track.status !== null && track.status !== "complete" ? (
        <span className={playlistRowStatus()}>
          <TrackStatusMark
            title={track.title}
            status={track.status}
            failureReason={track.failureReason}
            canRetry
            onRetry={onRetry}
            isRetrying={isRetrying}
          />
        </span>
      ) : null}
      <PlaylistRowFigures track={track} />
    </>
  );

  if (!editable) return <li className={playlistRow({ current })}>{body}</li>;

  const removeLabel = current ? "workshop.tracks.removeAndNext" : "workshop.tracks.remove";

  return (
    <Reorder.Item
      value={track.requestId}
      as="li"
      className={cn(playlistRow({ current, selected }), dragging && rowDragging())}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => {
        setDragging(false);
        onDrop();
      }}
    >
      <button
        type="button"
        className={rowGrip()}
        onPointerDown={(event) => controls.start(event)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
          event.preventDefault();
          onNudge(event.key === "ArrowUp" ? -1 : 1);
        }}
        aria-label={t("workshop.tracks.reorder", { title: track.title })}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <span
        className={rowSelect()}
        onMouseDownCapture={(event) => {
          if (event.shiftKey) event.preventDefault();
        }}
        onClickCapture={(event) => {
          event.preventDefault();
          onSelect(event.shiftKey);
        }}
      >
        <Checkbox checked={selected} aria-label={t("workshop.tracks.select", { title: track.title })} />
      </span>
      {body}
      <button
        type="button"
        className={rowRemove({ current })}
        onClick={onRemove}
        disabled={!isRemovableTrack(track)}
        title={t(removeLabel, { title: track.title })}
        aria-label={t(removeLabel, { title: track.title })}
      >
        {current ? <TrashNextIcon className="size-5" /> : <X className="size-4" aria-hidden />}
      </button>
    </Reorder.Item>
  );
}
