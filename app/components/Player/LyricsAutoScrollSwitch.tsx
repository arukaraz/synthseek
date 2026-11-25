"use client";

import { useTranslation } from "react-i18next";

import { lyricsAutoScroll, lyricsAutoScrollSwitch } from "./styles";
import type { LyricsAutoScrollSwitchProps } from "./types";

export function LyricsAutoScrollSwitch({ on, onChange }: LyricsAutoScrollSwitchProps) {
  const { t } = useTranslation("player");

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={lyricsAutoScroll({ on })}
      onClick={() => onChange(!on)}
    >
      <span className={lyricsAutoScrollSwitch({ on })} aria-hidden />
      {t("lyrics.autoScroll")}
    </button>
  );
}
