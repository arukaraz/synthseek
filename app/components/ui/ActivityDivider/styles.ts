import { cva } from "class-variance-authority";

export const activityDividerRoot = cva("relative flex w-full flex-col");

export const activityToolbarSlot = cva("relative min-w-0");

export const activityRail = cva("activity-rail", {
  variants: {
    state: {
      idle: "activity-rail-idle [--activity-rail-color:var(--color-primary-500)] [--activity-rail-opacity:0.5]",
      "in-progress":
        "activity-rail-progress [--activity-rail-color:var(--color-primary-500)] [--activity-rail-opacity:0.7]",
      "playlist-sync": "activity-rail-sync [--activity-rail-color:var(--status-syncing)] [--activity-rail-opacity:0.9]",
      paused: "activity-rail-paused [--activity-rail-color:var(--warning-strong)] [--activity-rail-opacity:0.9]",
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

export const activityPausedLabel = cva(
  "activity-paused-label pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-full px-2.5 text-11 font-semibold tracking-wide uppercase"
);
