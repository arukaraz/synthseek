"use client";

import { percentOf } from "./helpers";
import { barMobileProgressFill, headerProgress, progressVars } from "./styles";
import type { PlayerProps } from "./types";

export function HeaderProgress({ view }: Pick<PlayerProps, "view">) {
  return (
    <div className={headerProgress()} style={progressVars(percentOf(view.positionSeconds, view.track.durationSeconds))}>
      <div className={barMobileProgressFill()} />
    </div>
  );
}
