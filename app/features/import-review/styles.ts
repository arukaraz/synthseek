import { cva } from "class-variance-authority";

export const modalContent = cva(
  [
    "flex w-full flex-col p-4 sm:p-6",
    "bg-surface/95 sm:bg-surface/90 sm:backdrop-blur-2xl",
    "h-[100dvh] max-w-none !max-h-[100dvh] !top-0 !left-0 !translate-x-0 !rounded-none",
    "sm:h-auto sm:max-w-2xl sm:!max-h-[90vh] sm:!top-[50%] sm:!left-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:!rounded-2xl",
  ].join(" ")
);

export const modalBody = cva("flex min-h-0 flex-1 flex-col gap-3 sm:gap-4");

export const modalHeader = cva("flex flex-col gap-1.5");

export const itemList = cva("flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto");

export const itemRow = cva("border-fg/10 bg-surface/40 flex min-w-0 flex-col gap-2 rounded-xl border p-3");

export const itemHeader = cva("flex min-w-0 items-start justify-between gap-2");

export const itemTitle = cva("text-fg min-w-0 truncate text-sm font-medium");

export const evidenceText = cva("text-fg/70 text-xs leading-relaxed");

export const filenameText = cva("text-fg/50 truncate font-mono text-[11px]");

export const metaRow = cva("text-fg/50 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]");

export const errorNotice = cva(
  "border-destructive/25 bg-destructive/5 text-destructive-vivid flex flex-col gap-1 rounded-lg border px-2.5 py-1.5 text-[11px]"
);

export const actionsRow = cva("flex flex-wrap items-center justify-end gap-2");

export const audioPlayer = cva("mt-1 h-9 w-full");

export const reasonBadge = cva("inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium", {
  variants: {
    tone: {
      neutral: "bg-fg/10 text-fg/60",
      info: "bg-secondary-500/15 text-secondary-400",
      warning: "bg-warning-vivid/15 text-warning-vivid",
      danger: "bg-destructive/15 text-destructive-vivid",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export const footerWrap = cva("border-fg/10 flex flex-wrap items-center justify-between gap-3 border-t pt-3");

export const footerSummary = cva("text-fg/60 text-xs");

export const retentionWrap = cva("flex items-center gap-2");

export const retentionLabel = cva("text-fg/60 text-xs");

export const retentionInput = cva("h-8 w-20 text-right tabular-nums");

export const retentionError = cva("text-destructive-vivid text-[11px]");

export const errorText = cva("text-destructive-vivid text-sm");
