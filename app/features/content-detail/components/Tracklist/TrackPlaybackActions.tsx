"use client";

import { QueueAddButton } from "@components/ui/QueueAddButton";
import { ListStart, Play } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { trackPlaybackActions, trackPlayButton, trackPlayNextButton } from "../../styles";
import type { TrackPlaybackActionsProps } from "./types";

export function TrackPlaybackActions({ title, onPlayNow, onEnqueue, onPlayNext, inQueue }: TrackPlaybackActionsProps) {
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
      {onPlayNext ? (
        <button
          type="button"
          className={trackPlayNextButton()}
          onClick={() => void onPlayNext()}
          aria-label={t("queue.playNextTrack", { title })}
        >
          <ListStart className="size-4" />
        </button>
      ) : null}
      <QueueAddButton
        onAdd={onEnqueue}
        label={t("queue.addTrack", { title })}
        confirmedLabel={t("queue.inQueue", { title })}
        inQueue={inQueue}
        revealOnHover
      />
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
