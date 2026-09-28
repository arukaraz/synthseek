"use client";

import { QueueAddButton } from "@components/ui/QueueAddButton";
import { Play } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { trackPlaybackActions, trackPlayButton } from "../../styles";
import type { TrackPlaybackActionsProps } from "./types";

export function TrackPlaybackActions({ title, presence, onPlayNow, onEnqueue, onRemove }: TrackPlaybackActionsProps) {
  const { t } = useTranslation("player");
  const [starting, setStarting] = useState(false);

  const handlePlay = useCallback(async () => {
    if (starting) return;
    setStarting(true);
    try {
      await onPlayNow();
    } finally {
      setStarting(false);
    }
  }, [onPlayNow, starting]);

  return (
    <span className={trackPlaybackActions()}>
      <QueueAddButton title={title} presence={presence} onAdd={onEnqueue} onRemove={onRemove} revealOnHover />
      <button
        type="button"
        className={trackPlayButton()}
        onClick={handlePlay}
        disabled={starting}
        aria-label={t("queue.playTrack", { title })}
      >
        <Play className="size-4 fill-current" />
      </button>
    </span>
  );
}
