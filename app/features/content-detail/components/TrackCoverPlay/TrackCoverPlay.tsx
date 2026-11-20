"use client";

import { NowPlayingBars } from "@components/ui/NowPlayingBars";
import { artworkImage } from "@utils/artworkProxy";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { detailInitials } from "../../helpers";
import { coverPlay, coverPlayBars, coverPlayImage, coverPlayInitials, coverPlayVeil } from "./styles";
import type { TrackCoverPlayProps } from "./types";

export function TrackCoverPlay({ title, cover, presence, onPlay, onTogglePlay, overlay }: TrackCoverPlayProps) {
  const { t } = useTranslation("player");
  const [starting, setStarting] = useState(false);
  const playing = presence === "playing";
  const current = playing || presence === "paused";
  const toggles = current && onTogglePlay !== undefined;

  const handlePress = useCallback(async () => {
    if (toggles) {
      onTogglePlay();
      return;
    }
    if (starting || onPlay === undefined) return;
    setStarting(true);
    try {
      await onPlay();
    } finally {
      setStarting(false);
    }
  }, [onPlay, onTogglePlay, starting, toggles]);

  const art = cover ? (
    <Image {...artworkImage(cover)} alt="" fill sizes="36px" className={coverPlayImage()} />
  ) : (
    <span aria-hidden className={coverPlayInitials()}>
      {detailInitials(title)}
    </span>
  );
  const bars = current ? (
    <span className={coverPlayBars()}>
      <NowPlayingBars playing={playing} label={t(playing ? "queue.playingTrack" : "queue.pausedTrack", { title })} />
    </span>
  ) : null;

  if (onPlay === undefined) {
    return (
      <span className={coverPlay()}>
        {art}
        {bars}
        {overlay}
      </span>
    );
  }

  const Glyph = toggles && playing ? Pause : Play;
  const label = toggles && playing ? "queue.pauseTrack" : toggles ? "queue.resumeTrack" : "queue.playTrack";

  return (
    <button
      type="button"
      className={coverPlay({ pressable: true })}
      onClick={handlePress}
      disabled={starting}
      aria-label={t(label, { title })}
    >
      {art}
      {bars}
      <span className={coverPlayVeil()} aria-hidden>
        <Glyph className="size-4 fill-current" />
      </span>
    </button>
  );
}
