"use client";

import { useReducedMotion } from "framer-motion";
import { LocateFixed, X } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { activeLyricIndex, emptyReason, labelled, lyricDepth, lyricLineState } from "./helpers";
import {
  iconButton,
  lyricsBody,
  lyricsEmpty,
  lyricsLine,
  lyricsPane,
  lyricsReturn,
  lyricsScroll,
  lyricsUntimed,
} from "./styles";
import type { PlayerLyricsProps } from "./types";
import { useLyricFollow } from "./useLyricFollow";

export function PlayerLyrics({ view, actions, column }: PlayerLyricsProps) {
  const { t } = useTranslation("player");
  const reduceMotion = useReducedMotion() === true;
  const lines = view.lyrics?.lines ?? [];
  const synced = view.lyrics?.synced === true;
  const active = activeLyricIndex(view.lyrics, view.positionSeconds);
  const activeLine = useRef<HTMLElement | null>(null);
  const fit = column === undefined ? "stage" : "column";
  const mode = column === undefined ? "always" : column.autoScroll ? "reader" : "off";
  const { lost, returnToLine, scrollerRef } = useLyricFollow({ activeLine, active, reduceMotion, mode });

  const keepActive = (index: number) => (node: HTMLElement | null) => {
    if (index === active) activeLine.current = node;
  };

  return (
    <div className={lyricsPane({ fit })}>
      {lines.length === 0 ? (
        <p className={lyricsEmpty()}>{view.lyricsFailure ?? t(`lyrics.${emptyReason(view)}`)}</p>
      ) : (
        <div className={lyricsScroll()} ref={scrollerRef}>
          <div className={lyricsBody({ fit })}>
            {lines.map((line, index) => {
              const state = lyricLineState(view.lyrics, active, index);
              const depth = lyricDepth(active, index);
              const current = index === active && synced ? true : undefined;

              return synced && line.start !== null ? (
                <button
                  key={`${index}-${line.start}`}
                  type="button"
                  ref={keepActive(index)}
                  className={lyricsLine({ state, depth, seekable: true, fit })}
                  aria-current={current}
                  onClick={() => actions.seekTo((line.start ?? 0) / 1000)}
                >
                  {line.value}
                </button>
              ) : (
                <p key={`${index}-plain`} ref={keepActive(index)} className={lyricsLine({ state, depth, fit })}>
                  {line.value}
                </p>
              );
            })}
          </div>
        </div>
      )}
      {lines.length > 0 && !synced ? <p className={lyricsUntimed()}>{t("lyrics.untimed")}</p> : null}
      {column !== undefined && synced && lost ? (
        <button type="button" className={lyricsReturn()} onClick={returnToLine}>
          <LocateFixed className="size-4" aria-hidden />
          {t("lyrics.backToLine")}
        </button>
      ) : null}
      {column === undefined ? (
        <button
          type="button"
          className={iconButton({ size: "stage" })}
          onClick={actions.toggleLyrics}
          {...labelled(t("controls.lyricsClose"))}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
