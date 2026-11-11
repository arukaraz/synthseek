"use client";

import { QueueAddButton } from "@components/ui/QueueAddButton";
import { Pause, Play } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { trackPlaybackActions, trackPlayButton } from "../../styles";
import type { TrackPlaybackActionsProps } from "./types";

export function TrackPlaybackActions({
  title,
  presence,
  onPlayNow,
  onTogglePlay,
  onEnqueue,
  onRemove,
}: TrackPlaybackActionsProps) {
  const { t } = useTranslation("player");
  const [starting, setStarting] = useState(false);
  const playing = presence === "playing";
  const current = onTogglePlay !== undefined && (playing || presence === "paused");

  const handlePlay = useCallback(async () => {
    if (current && onTogglePlay !== undefined) {
      onTogglePlay();
      return;
    }
    if (starting) return;
    setStarting(true);
    try {
      await onPlayNow();
    } finally {
      setStarting(false);
    }
  }, [current, onPlayNow, onTogglePlay, starting]);

  const Glyph = current && playing ? Pause : Play;
  const label = current && playing ? "queue.pauseTrack" : current ? "queue.resumeTrack" : "queue.playTrack";

  return (
    <span className={trackPlaybackActions()}>
      <QueueAddButton title={title} presence={presence} onAdd={onEnqueue} onRemove={onRemove} revealOnHover />
      <button
        type="button"
        className={trackPlayButton({ current })}
        onClick={handlePlay}
        disabled={starting}
        aria-label={t(label, { title })}
      >
        <Glyph className="size-4 fill-current" />
      </button>
    </span>
  );
}
