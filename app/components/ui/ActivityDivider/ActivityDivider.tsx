"use client";

import { cn } from "@utils/cn";
import { useReducedMotion } from "framer-motion";

import { clampRatio, fillStyle } from "./helpers";
import {
  activityDividerRoot,
  activityRail,
  activityRailStatic,
  activityRailTravel,
  activityToolbarSlot,
} from "./styles";
import type { ActivityDividerProps } from "./types";

export function ActivityDivider({ state, value = 0, max = 0, children, className }: ActivityDividerProps) {
  const reduced = useReducedMotion() ?? false;
  const isPlexSync = state === "plex-sync";

  const showTravel = isPlexSync && !reduced;
  const showStaticFill = isPlexSync && reduced;
  const ratio = clampRatio(value, max);

  return (
    <div className={cn(activityDividerRoot(), className)}>
      <div aria-hidden="true" className={activityRail({ state, reduced })}>
        {showTravel ? <span className={activityRailTravel()} /> : null}
        {showStaticFill ? <span className={activityRailStatic()} style={fillStyle(ratio)} /> : null}
      </div>

      <div className={activityToolbarSlot()}>{children}</div>
    </div>
  );
}
