import { cva } from "class-variance-authority";

export const dockViewport = cva(
  "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-stretch px-3 pb-3 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:items-end sm:px-0 sm:pb-0"
);

export const dockCard = cva(
  "pointer-events-auto border-fg/15 bg-surface/90 w-full overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl sm:w-[320px]",
  {
    variants: {
      status: {
        running: "shadow-sync/15",
        complete: "shadow-success/15",
        partial: "shadow-warning/20",
        failed: "shadow-error/20",
      },
    },
    defaultVariants: { status: "running" },
  }
);

export const dockHeader = cva("flex items-center gap-3 p-3");

export const dockRingWrap = cva("relative grid size-8 shrink-0 place-items-center");

export const dockRing = cva("dock-ring absolute inset-0", {
  variants: {
    status: {
      running: "",
      complete: "dock-ring-complete",
      partial: "dock-ring-partial",
      failed: "dock-ring-failed",
    },
  },
  defaultVariants: { status: "running" },
});

export const dockRingText = cva("text-fg relative z-10 text-[10px] font-semibold tabular-nums");

export const dockTitleBlock = cva("min-w-0 flex-1");

export const dockTitle = cva("text-fg truncate text-[13px] font-bold leading-tight");

export const dockSubtitle = cva("text-fg-muted truncate text-[11px] leading-tight");

export const dockSubtitleCount = cva("text-sync font-semibold tabular-nums");

export const dockSubtitleCountFailed = cva("text-error font-semibold tabular-nums");

export const dockButtons = cva("flex shrink-0 items-center gap-0.5");

export const dockIconButton = cva(
  "text-fg-muted hover:bg-fg/10 hover:text-fg grid size-7 place-items-center rounded-lg transition-colors"
);

export const dockBody = cva("flex flex-col gap-0.5 overflow-y-auto px-2 pb-2");

export const dockItemRow = cva("flex items-center gap-2 rounded-lg px-2 py-1.5", {
  variants: {
    importing: {
      true: "bg-sync/10",
      false: "",
    },
  },
  defaultVariants: { importing: false },
});

export const dockItemIcon = cva("grid size-4 shrink-0 place-items-center");

export const dockItemName = cva("text-fg/80 min-w-0 truncate text-xs");

export const dockMobileMeta = cva("text-fg-muted truncate text-[11px]");
