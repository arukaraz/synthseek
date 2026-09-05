"use client";

import { animate, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { LYRIC_SCROLL_SPRING } from "./constants";
import { activeLyricIndex, emptyReason, lyricDepth, lyricLineState } from "./helpers";
import { iconButton, lyricsBody, lyricsEmpty, lyricsLine, lyricsPane, lyricsScroll } from "./styles";
import type { PlayerLyricsProps } from "./types";

export function PlayerLyrics({ view, actions }: PlayerLyricsProps) {
  const { t } = useTranslation("player");
  const reduceMotion = useReducedMotion() === true;
  const lines = view.lyrics?.lines ?? [];
  const synced = view.lyrics?.synced === true;
  const active = activeLyricIndex(view.lyrics, view.positionSeconds);
  const scroller = useRef<HTMLDivElement>(null);
  const activeLine = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = scroller.current;
    const line = activeLine.current;
    if (container === null || line === null) return;

    const target =
      line.offsetTop - container.offsetTop - container.clientTop - container.clientHeight / 2 + line.offsetHeight / 2;
    if (reduceMotion) {
      container.scrollTop = target;
      return;
    }

    const controls = animate(container.scrollTop, target, {
      ...LYRIC_SCROLL_SPRING,
      onUpdate: (value) => {
        container.scrollTop = value;
      },
    });
    const yieldToReader = () => controls.stop();
    container.addEventListener("wheel", yieldToReader, { passive: true });
    container.addEventListener("touchstart", yieldToReader, { passive: true });

    return () => {
      controls.stop();
      container.removeEventListener("wheel", yieldToReader);
      container.removeEventListener("touchstart", yieldToReader);
    };
  }, [active, reduceMotion]);

  const keepActive = (index: number) => (node: HTMLElement | null) => {
    if (index === active) activeLine.current = node;
  };

  return (
    <div className={lyricsPane()}>
      {lines.length === 0 ? (
        <p className={lyricsEmpty()}>{t(`lyrics.${emptyReason(view)}`)}</p>
      ) : (
        <div className={lyricsScroll()} ref={scroller}>
          <div className={lyricsBody()}>
            {lines.map((line, index) => {
              const state = lyricLineState(view.lyrics, active, index);
              const depth = lyricDepth(active, index);

              return synced && line.start !== null ? (
                <button
                  key={`${index}-${line.start}`}
                  type="button"
                  ref={keepActive(index)}
                  className={lyricsLine({ state, depth, seekable: true })}
                  onClick={() => actions.seekTo((line.start ?? 0) / 1000)}
                >
                  {line.value}
                </button>
              ) : (
                <p key={`${index}-plain`} ref={keepActive(index)} className={lyricsLine({ state, depth })}>
                  {line.value}
                </p>
              );
            })}
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
