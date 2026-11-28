"use client";

import { cn } from "@utils/cn";
import { Square } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PlayGlyph } from "./PlayGlyph";
import { PLAYBACK_PROBLEM_ID } from "./constants";
import { labelledBelow } from "./helpers";
import { playButton, playCluster, stopBadge } from "./styles";
import type { PlayStopBadgeProps } from "./types";

export function PlayStopBadge({ view, actions, size, arrow, face, folds }: PlayStopBadgeProps) {
  const { t } = useTranslation("player");

  return (
    <div className={playCluster()} data-play-cluster>
      <button
        type="button"
        className={playButton({ size })}
        onClick={actions.togglePlay}
        aria-describedby={view.failing ? PLAYBACK_PROBLEM_ID : undefined}
        {...labelledBelow(view.playing ? t("controls.pause") : t("controls.play"))}
      >
        <PlayGlyph view={view} spin={arrow} face={face} />
      </button>
      <button
        type="button"
        className={cn(stopBadge({ size }), folds)}
        onClick={actions.stop}
        disabled={view.stopped}
        {...labelledBelow(t("controls.stop"))}
      >
        <Square className={size === "stage" ? "size-2.5 fill-current" : "size-2 fill-current"} />
      </button>
    </div>
  );
}
