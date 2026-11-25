"use client";

import { PlayerWave } from "./PlayerWave";
import { formatClock } from "./helpers";
import { clock, stageScrubRow } from "./styles";
import type { PlayerProps } from "./types";

export function StageScrub({ view, actions }: PlayerProps) {
  return (
    <div className={stageScrubRow()}>
      <span className={clock({ size: "stage", align: "right" })}>{formatClock(view.positionSeconds)}</span>
      <PlayerWave view={view} actions={actions} size="stage" />
      <span className={clock({ size: "stage" })}>{formatClock(view.track.durationSeconds)}</span>
    </div>
  );
}
