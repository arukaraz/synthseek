"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatBytes, formatTrackDuration } from "@utils/formatters";

import {
  dupFileLength,
  dupFileName,
  dupFileRow,
  dupFileSize,
  dupKeepThis,
  dupPlay,
  dupServingBadge,
} from "../../styles";
import { MS_PER_SECOND } from "./constants";
import { copyAudioUrl } from "./helpers";
import type { CopyRowProps } from "./types";

export function CopyRow({ copy, disabled, keeping, playing, onPlayChange, onKeep }: CopyRowProps) {
  const { t } = useTranslation("settings");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [buffering, setBuffering] = useState(false);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) return;
    if (playing) {
      setBuffering(true);
      void element.play().catch(() => {
        setBuffering(false);
        onPlayChange(null);
      });
    } else {
      element.pause();
      setBuffering(false);
    }
  }, [playing, onPlayChange]);

  useEffect(() => {
    const element = audioRef.current;
    return () => {
      element?.pause();
    };
  }, []);

  const label = buffering
    ? t("libraryScan.duplicates.loading")
    : playing
      ? t("libraryScan.duplicates.pause")
      : t("libraryScan.duplicates.play");

  return (
    <div className={dupFileRow({ serving: copy.serving })}>
      <button
        type="button"
        className={dupPlay()}
        onClick={() => onPlayChange(playing ? null : copy.id)}
        aria-label={label}
        aria-pressed={playing}
        aria-busy={buffering}
      >
        {buffering ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : playing ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5 fill-current" />
        )}
      </button>
      <audio
        ref={audioRef}
        src={copyAudioUrl(copy.id)}
        preload="none"
        onPlaying={() => setBuffering(false)}
        onWaiting={() => setBuffering(true)}
        onEnded={() => onPlayChange(null)}
        onError={() => {
          setBuffering(false);
          onPlayChange(null);
        }}
      />
      {copy.serving ? <span className={dupServingBadge()}>{t("libraryScan.duplicates.inLibrary")}</span> : null}
      <span className={dupFileName()}>{copy.fileName}</span>
      {copy.durationSeconds === null ? null : (
        <span className={dupFileLength()}>{formatTrackDuration(copy.durationSeconds * MS_PER_SECOND)}</span>
      )}
      <span className={dupFileSize()}>{formatBytes(copy.sizeBytes)}</span>
      <button type="button" className={dupKeepThis()} disabled={disabled || keeping} onClick={onKeep}>
        {keeping ? <Loader2 className="size-3 animate-spin" /> : null}
        {t("libraryScan.duplicates.keepThis")}
      </button>
    </div>
  );
}
