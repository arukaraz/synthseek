"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { activeLyricIndex, emptyReason, lyricLineState } from "./helpers";
import { iconButton, lyricsBody, lyricsEmpty, lyricsLine, lyricsPane, lyricsScroll } from "./styles";
import type { PlayerLyricsProps } from "./types";

export function PlayerLyrics({ view, actions }: PlayerLyricsProps) {
  const { t } = useTranslation("player");
  const lines = view.lyrics?.lines ?? [];
  const synced = view.lyrics?.synced === true;
  const active = activeLyricIndex(view.lyrics, view.positionSeconds);
  const activeLine = useRef<HTMLElement | null>(null);

  useEffect(() => {
    activeLine.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active]);

  const keepActive = (index: number) => (node: HTMLElement | null) => {
    if (index === active) activeLine.current = node;
  };

  return (
    <div className={lyricsPane()}>
      {lines.length === 0 ? (
        <p className={lyricsEmpty()}>{t(`lyrics.${emptyReason(view)}`)}</p>
      ) : (
        <div className={lyricsScroll()}>
          <div className={lyricsBody()}>
            {lines.map((line, index) =>
              synced && line.start !== null ? (
                <button
                  key={`${index}-${line.start}`}
                  type="button"
                  ref={keepActive(index)}
                  className={lyricsLine({ state: lyricLineState(view.lyrics, active, index), seekable: true })}
                  onClick={() => actions.seekTo((line.start ?? 0) / 1000)}
                >
                  {line.value}
                </button>
              ) : (
                <p
                  key={`${index}-plain`}
                  ref={keepActive(index)}
                  className={lyricsLine({ state: lyricLineState(view.lyrics, active, index) })}
                >
                  {line.value}
                </p>
              )
            )}
          </div>
        </div>
      )}
      <button
        type="button"
        className={iconButton({ size: "stage" })}
        onClick={actions.toggleLyrics}
        aria-label={t("controls.lyricsClose")}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
