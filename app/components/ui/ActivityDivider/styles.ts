import { cva } from "class-variance-authority";

export const activityDividerRoot = cva("relative flex w-full flex-col");

export const activityToolbarSlot = cva("relative min-w-0");

export const activityRail = cva("activity-rail", {
  variants: {
    state: {
      idle: "activity-rail-idle [--activity-rail-color:var(--neon-primary)] [--activity-rail-opacity:0.5]",
      "in-progress": "activity-rail-progress [--activity-rail-color:var(--neon-primary)] [--activity-rail-opacity:0.7]",
      "plex-sync": "activity-rail-plex [--activity-rail-color:var(--neon-sync)] [--activity-rail-opacity:0.9]",
    },
    reduced: {
      true: "!animate-none",
      false: "",
    },
  },
  defaultVariants: { state: "idle", reduced: false },
});

export const activityRailTravel = cva("activity-rail-travel");

export const activityRailStatic = cva("activity-rail-static");
