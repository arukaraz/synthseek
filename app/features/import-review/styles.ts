import { cva } from "class-variance-authority";

export const modalContent = cva(
  [
    "flex w-full flex-col p-4 sm:p-6",
    "bg-surface/95",
    "h-[100dvh] max-w-none !max-h-[100dvh] !top-0 !left-0 !translate-x-0 !rounded-none",
    "sm:h-auto sm:max-w-2xl sm:!max-h-[90vh] sm:!top-[50%] sm:!left-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:!rounded-2xl",
  ].join(" ")
);

export const modalBody = cva("flex min-h-0 flex-1 flex-col gap-3 sm:gap-4");

export const modalHeader = cva("flex flex-col gap-1.5");

export const itemList = cva(
  "relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-3.5 py-2.5"
);

export const requestGroup = cva("flex min-w-0 flex-col gap-2");

export const requestGroupHeader = cva("flex min-w-0 items-center gap-2.5 px-0.5");

export const requestGroupArt = cva("bg-fg/10 relative size-9 shrink-0 overflow-hidden rounded-lg");

export const requestGroupName = cva("text-fg truncate text-13 font-semibold");

export const requestGroupSub = cva("text-fg/50 truncate text-xs");

export const trackCard = cva(
  "border-fg/10 bg-surface/40 flex min-w-0 flex-col gap-3 rounded-xl border p-3 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60"
);

export const trackCardHeader = cva("flex min-w-0 flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5");

export const itemTitle = cva("text-fg min-w-0 text-sm font-semibold break-words");

export const trackCardArtist = cva("text-fg/60 text-xs");

export const filesCount = cva("text-fg/50 text-11 whitespace-nowrap");

export const candidateBlock = cva(
  "border-fg/15 flex min-w-0 flex-col gap-2 border-t border-dashed pt-3 first-of-type:border-t-0 first-of-type:pt-0"
);

export const candidateHeader = cva("flex min-w-0 flex-wrap items-center gap-2");

export const candidateMeta = cva("text-fg/60 min-w-0 flex-1 text-xs");

export const candidateIndex = cva("text-fg font-semibold");

export const evidenceText = cva("text-fg/70 text-xs leading-relaxed");

export const filenameText = cva("text-fg/50 truncate font-mono text-11");

export const errorNotice = cva(
  "border-destructive/25 bg-destructive/5 text-destructive-vivid flex flex-col gap-1 rounded-lg border px-2.5 py-1.5 text-11"
);

export const actionsRow = cva("flex flex-nowrap items-center justify-between gap-2 sm:justify-end");

export const discardButton = cva("text-destructive-vivid hover:bg-destructive/10 hover:text-destructive-vivid");

export const approveWide = cva("hidden sm:inline");

export const approveNarrow = cva("sm:hidden");

export const approveSub = cva("text-11 font-normal opacity-80");

export const compareTable = cva("w-full table-fixed border-collapse text-xs");

export const compareHeadCell = cva("text-fg/40 px-1.5 pb-1 text-left text-10 font-medium tracking-wider uppercase");

export const compareLabelCell = cva("text-fg/50 border-fg/10 w-20 border-t px-1.5 py-1.5 align-top");

export const compareValueCell = cva("text-fg/80 border-fg/10 border-t px-1.5 py-1.5 align-top break-words");

export const compareMarkCell = cva(
  "border-fg/10 w-5 border-t py-1.5 text-center align-top font-bold [font-family:system-ui,sans-serif]",
  {
    variants: { differs: { true: "text-warning-vivid", false: "text-fg/40" } },
    defaultVariants: { differs: false },
  }
);

export const diffAdded = cva(
  "bg-warning-vivid/20 text-fg decoration-warning-vivid/70 rounded-sm px-0.5 underline decoration-wavy underline-offset-3"
);

export const diffRemoved = cva("text-fg/60 decoration-destructive-vivid/70 line-through");

export const compareMuted = cva("text-fg/50");

export const meterRow = cva("flex min-w-0 items-center gap-2");

export const meterTrack = cva("bg-fg/10 h-1.5 min-w-12 flex-1 overflow-hidden rounded-full");

export const meterFill = cva("block h-full rounded-full", {
  variants: { tone: { low: "bg-destructive-vivid", mid: "bg-warning-vivid" } },
  defaultVariants: { tone: "low" },
});

export const meterLabel = cva("text-fg/60 text-xs whitespace-nowrap tabular-nums");

export const reasonChips = cva("-mx-1 flex shrink-0 gap-1.5 overflow-x-auto px-1 pb-0.5");

export const reasonChip = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs whitespace-nowrap transition-colors",
  {
    variants: {
      active: {
        true: "border-primary-500/70 bg-primary-500/15 text-fg",
        false: "border-fg/15 text-fg/60 hover:text-fg hover:bg-fg/5",
      },
    },
    defaultVariants: { active: false },
  }
);

export const reasonChipCount = cva("text-fg font-semibold tabular-nums");

export const playerBar = cva("border-fg/10 bg-surface/60 flex min-w-0 flex-col gap-1.5 rounded-xl border px-3 py-2");

export const playerNow = cva("text-fg/80 truncate text-xs");

export const playerSource = cva("text-fg/50");

export const reasonBadge = cva("inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-10 font-medium", {
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

export const retentionError = cva("text-destructive-vivid text-11");

export const errorText = cva("text-destructive-vivid text-sm");
