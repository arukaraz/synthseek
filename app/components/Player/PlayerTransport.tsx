"use client";

import { cn } from "@utils/cn";
import { Loader2, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TRANSPORT_METRICS } from "./constants";
import { labelled } from "./helpers";
import { iconButton, playButton } from "./styles";
import type { PlayerTransportProps } from "./types";

export function PlayerTransport({ view, actions, size }: PlayerTransportProps) {
  const { t } = useTranslation("player");
  const metrics = TRANSPORT_METRICS[size];

  return (
    <>
      <button
        type="button"
        className={cn(iconButton({ tone: view.shuffle ? "active" : "muted", size: metrics.side }), metrics.folds)}
        onClick={actions.toggleShuffle}
        {...labelled(t("controls.shuffle"))}
        aria-pressed={view.shuffle}
      >
        <Shuffle className={metrics.mark} />
      </button>
      <button
        type="button"
        className={cn(iconButton({ size: metrics.skip }), metrics.folds)}
        onClick={actions.previous}
        {...labelled(t("controls.previous"))}
      >
        <SkipBack className={cn(metrics.arrow, "fill-current")} />
      </button>
      <button
        type="button"
        className={playButton({ size: metrics.play })}
        onClick={actions.togglePlay}
        {...labelled(view.playing ? t("controls.pause") : t("controls.play"))}
      >
        {view.loading ? (
          <Loader2 className={cn(metrics.arrow, "animate-spin")} />
        ) : view.playing ? (
          <Pause className={cn(metrics.face, "fill-current")} />
        ) : (
          <Play className={cn(metrics.face, "fill-current")} />
        )}
      </button>
      <button
        type="button"
        className={iconButton({ size: metrics.skip })}
        onClick={actions.next}
        {...labelled(t("controls.next"))}
      >
        <SkipForward className={cn(metrics.arrow, "fill-current")} />
      </button>
      <button
        type="button"
        className={cn(
          iconButton({ tone: view.repeat === "off" ? "muted" : "active", size: metrics.side }),
          metrics.folds
        )}
        onClick={actions.cycleRepeat}
        {...labelled(t(`controls.repeat.${view.repeat}`))}
      >
        {view.repeat === "one" ? <Repeat1 className={metrics.mark} /> : <Repeat className={metrics.mark} />}
      </button>
    </>
  );
}
