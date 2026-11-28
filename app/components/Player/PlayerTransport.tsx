"use client";

import { cn } from "@utils/cn";
import { Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PlayGlyph } from "./PlayGlyph";
import { PlayStopBadge } from "./PlayStopBadge";
import { PLAYBACK_PROBLEM_ID, TRANSPORT_METRICS } from "./constants";
import { labelled, labelledBelow } from "./helpers";
import { iconButton, playButton, transportSide } from "./styles";
import type { PlayerTransportProps } from "./types";

export function PlayerTransport({ view, actions, size, joined = false }: PlayerTransportProps) {
  const { t } = useTranslation("player");
  const metrics = TRANSPORT_METRICS[size];
  const badgeSize = size === "bar" ? "bar" : size === "stage" ? "stage" : null;
  const pill = joined ? badgeSize : null;

  return (
    <>
      <div className={transportSide({ layout: metrics.sides, at: "start" })}>
        <button
          type="button"
          className={cn(iconButton({ tone: view.shuffle ? "active" : "muted", size: metrics.side }), metrics.folds)}
          onClick={actions.toggleShuffle}
          {...labelled(t("controls.shuffle"))}
          aria-pressed={view.shuffle}
        >
          <Shuffle className={metrics.mark} />
        </button>
        {pill === null ? (
          <button
            type="button"
            className={cn(iconButton({ size: metrics.side }), metrics.folds)}
            onClick={actions.stop}
            disabled={view.stopped}
            {...labelled(t("controls.stop"))}
          >
            <Square className={cn(metrics.mark, "fill-current")} />
          </button>
        ) : null}
        <button
          type="button"
          className={cn(iconButton({ size: metrics.skip }), metrics.folds)}
          onClick={actions.previous}
          {...labelled(t("controls.previous"))}
        >
          <SkipBack className={cn(metrics.arrow, "fill-current")} />
        </button>
      </div>
      {pill === null ? (
        <button
          type="button"
          className={playButton({ size: metrics.play })}
          onClick={actions.togglePlay}
          aria-describedby={view.failing ? PLAYBACK_PROBLEM_ID : undefined}
          {...labelledBelow(view.playing ? t("controls.pause") : t("controls.play"))}
        >
          <PlayGlyph view={view} spin={metrics.arrow} face={metrics.face} />
        </button>
      ) : (
        <PlayStopBadge
          view={view}
          actions={actions}
          size={pill}
          arrow={metrics.arrow}
          face={metrics.face}
          folds={metrics.folds}
        />
      )}
      <div className={transportSide({ layout: metrics.sides, at: "end" })}>
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
      </div>
    </>
  );
}
