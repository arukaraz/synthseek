"use client";

import { cn } from "@utils/cn";
import { useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { clampRatio, fillStyle } from "./helpers";
import {
  activityDividerRoot,
  activityPausedLabel,
  activityRail,
  activityRailStatic,
  activityRailTravel,
  activityToolbarSlot,
} from "./styles";
import type { ActivityDividerProps } from "./types";

export function ActivityDivider({ state, value = 0, max = 0, children, className }: ActivityDividerProps) {
  const { t } = useTranslation("components");
  const reduced = useReducedMotion() ?? false;
  const isPlexSync = state === "plex-sync";
  const isPaused = state === "paused";

  const showTravel = isPlexSync && !reduced;
  const showStaticFill = isPlexSync && reduced;
  const ratio = clampRatio(value, max);

  return (
    <div className={cn(activityDividerRoot(), className)}>
      <div aria-hidden="true" className={activityRail({ state, reduced })}>
        {showTravel ? <span className={activityRailTravel()} /> : null}
        {showStaticFill ? <span className={activityRailStatic()} style={fillStyle(ratio)} /> : null}
      </div>

      {isPaused ? <span className={activityPausedLabel()}>{t("activity.paused")}</span> : null}

      <div className={activityToolbarSlot()}>{children}</div>
    </div>
  );
}
