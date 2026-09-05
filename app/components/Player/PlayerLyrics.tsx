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
  const active = activeLyricIndex(view.lyrics, view.positionSeconds);
  const activeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active]);

  return (
    <div className={lyricsPane()}>
      {lines.length === 0 ? (
        <p className={lyricsEmpty()}>{t(`lyrics.${emptyReason(view)}`)}</p>
      ) : (
        <div className={lyricsScroll()}>
          <div className={lyricsBody()}>
            {lines.map((line, index) => (
              <p
                key={`${index}-${line.start ?? 0}`}
                ref={index === active ? activeRef : null}
                className={lyricsLine({ state: lyricLineState(view.lyrics, active, index) })}
              >
                {line.value}
              </p>
            ))}
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
