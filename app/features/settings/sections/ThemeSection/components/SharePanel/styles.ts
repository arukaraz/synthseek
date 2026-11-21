import { cva } from "class-variance-authority";

export const sharePanel = cva("border-fg/15 bg-fg/[0.03] flex flex-col gap-3 rounded-xl border p-3 sm:p-4");

export const sharePanelHead = cva("flex items-center justify-between gap-3");

export const sharePanelTitle = cva("text-fg text-base font-semibold");

export const sharePanelIntro = cva("text-fg/60 text-sm");

export const sharePanelRow = cva("flex flex-wrap items-center gap-2");

export const sharePanelField = cva("flex max-w-sm flex-col gap-1.5");

export const sharePanelLabel = cva("text-fg/70 text-xs font-medium");

export const sharePanelCheck = cva("text-fg/80 flex cursor-pointer items-center gap-2 text-sm");

export const sharePanelText = cva(
  "border-fg/15 bg-fg/5 text-fg placeholder:text-fg/30 focus:border-primary-500/50 focus:ring-primary-500/30 min-h-40 w-full resize-y rounded-lg border p-3 font-mono text-xs outline-none transition-colors focus:ring-2"
);

export const sharePanelButton = cva("border-fg/15 border");

export const hiddenFileInput = cva("sr-only");

export const verdictBox = cva("flex flex-col gap-2 rounded-lg border p-3 text-sm", {
  variants: {
    tone: {
      good: "border-fg/15 bg-fg/5 text-fg/80",
      bad: "border-destructive-tint/30 bg-destructive-tint/10 text-destructive-faint",
    },
  },
  defaultVariants: { tone: "good" },
});

export const verdictList = cva("flex list-disc flex-col gap-1 pl-5");

export const verdictWarning = cva("text-warning-vivid");
