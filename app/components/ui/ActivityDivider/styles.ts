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

export const activityLabelWrap = cva(
  "pointer-events-none absolute inset-0 z-20 hidden items-center justify-center px-2 sm:flex",
  {
    variants: {
      visible: {
        true: "sm:flex",
        false: "sm:hidden",
      },
    },
    defaultVariants: { visible: false },
  }
);

export const activityLabelScrim = cva(
  "bg-surface/85 border-fg/15 text-fg flex min-w-0 max-w-[min(70%,24rem)] items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-md"
);

export const activityLabelText = cva("min-w-0 truncate");

export const activityLabelNarrowText = cva("truncate max-[380px]:hidden");

export const activityLabelCount = cva("text-fg shrink-0 tabular-nums");

export const activityLabelRowNarrow = cva(
  "text-fg/80 bg-surface/60 border-fg/10 flex items-center justify-center gap-1.5 border-t px-3 py-1 text-[11px] font-medium sm:hidden",
  {
    variants: {
      visible: {
        true: "flex",
        false: "hidden",
      },
    },
    defaultVariants: { visible: false },
  }
);
