import { cva } from "class-variance-authority";

export const privacyNote = cva("text-fg/55 text-xs");

export const privacyControl = cva("flex flex-wrap items-center gap-3");

export const rangeList = cva("flex flex-col gap-1.5");

export const rangeOption = cva(
  "focus-visible:ring-primary-500/40 flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      active: {
        true: "border-primary-500/60 bg-primary-500/10 text-fg",
        false: "border-fg/10 bg-fg/5 text-fg/80 hover:bg-fg/10",
      },
    },
    defaultVariants: { active: false },
  }
);

export const rangeCount = cva("text-fg/55 shrink-0 text-xs tabular-nums");

export const leavingList = cva("divide-fg/10 border-fg/10 flex flex-col divide-y rounded-lg border");

export const leavingRow = cva("flex items-center justify-between gap-3 px-3 py-2.5");

export const leavingLabel = cva("text-fg/80 min-w-0 truncate text-sm");

export const privacyFooter = cva("flex justify-end");
