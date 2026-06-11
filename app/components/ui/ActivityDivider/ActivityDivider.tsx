"use client";

import { cn } from "@utils/cn";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { clampRatio, fillStyle, isAnnounceMilestone } from "./helpers";
import {
  activityDividerRoot,
  activityLabelCount,
  activityLabelNarrowText,
  activityLabelRowNarrow,
  activityLabelScrim,
  activityLabelText,
  activityLabelWrap,
  activityRail,
  activityRailStatic,
  activityRailTravel,
  activityToolbarSlot,
} from "./styles";
import type { ActivityDividerProps } from "./types";

export function ActivityDivider({
  state,
  value = 0,
  max = 0,
  label,
  labelShort,
  announcements,
  children,
  className,
}: ActivityDividerProps) {
  const reduced = useReducedMotion() ?? false;
  const isPlexSync = state === "plex-sync";

  const [announcement, setAnnouncement] = useState("");
  const lastAnnouncedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlexSync || !announcements) {
      lastAnnouncedRef.current = null;
      setAnnouncement("");
      return;
    }
    if (lastAnnouncedRef.current === null) {
      lastAnnouncedRef.current = value;
      setAnnouncement(announcements.start);
      return;
    }
    if (value !== lastAnnouncedRef.current && isAnnounceMilestone(value, max)) {
      lastAnnouncedRef.current = value;
      setAnnouncement(value >= max ? announcements.complete : announcements.progress);
    }
  }, [isPlexSync, announcements, value, max]);

  const showTravel = isPlexSync && !reduced;
  const showStaticFill = isPlexSync && reduced;
  const ratio = clampRatio(value, max);

  return (
    <div className={cn(activityDividerRoot(), className)}>
      <div aria-hidden="true" className={activityRail({ state, reduced })}>
        {showTravel ? <span className={activityRailTravel()} /> : null}
        {showStaticFill ? <span className={activityRailStatic()} style={fillStyle(ratio)} /> : null}
      </div>

      <div className={activityToolbarSlot()}>
        {children}

        {isPlexSync && label ? (
          <div className={activityLabelWrap({ visible: true })}>
            <div className={activityLabelScrim()}>
              <span className={activityLabelText()}>{label}</span>
              <span className={activityLabelCount()}>
                {value}/{max}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {isPlexSync && labelShort ? (
        <div className={activityLabelRowNarrow({ visible: true })}>
          <span className={activityLabelNarrowText()}>{labelShort}</span>
          <span className={activityLabelCount()}>
            {value}/{max}
          </span>
        </div>
      ) : null}

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
