import { cva } from "class-variance-authority";

export const tileGrid = cva("grid grid-cols-2 gap-4 lg:grid-cols-4");

export const tile = cva(
  "border-fg/10 bg-fg/[0.02] hover:bg-fg/5 flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors sm:p-5"
);

export const tileTitle = cva("text-fg text-sm font-semibold");

export const tileCount = cva("text-fg text-3xl font-semibold tabular-nums");

export const tileCaption = cva("text-fg/60 text-xs");

export const overviewColumn = cva("flex flex-col gap-5 sm:gap-6");

export const listRow = cva("border-fg/10 flex items-center gap-3 border-b py-2.5 last:border-b-0");

export const connectionButton = cva(
  "border-fg/10 hover:bg-fg/[0.03] flex w-full items-center gap-3 border-b py-2.5 text-left last:border-b-0"
);

export const rowText = cva("min-w-0 flex-1");

export const rowName = cva("text-fg text-sm font-medium");

export const rowRole = cva("text-fg/50 text-xs");

export const checkMark = cva("flex size-5 shrink-0 items-center justify-center rounded-full border", {
  variants: {
    done: {
      true: "border-success-vivid bg-success-vivid/15 text-success-vivid",
      false: "border-fg/30",
    },
  },
  defaultVariants: { done: false },
});

export const checkLabel = cva("flex-1 text-sm", {
  variants: {
    done: {
      true: "text-fg/50",
      false: "text-fg",
    },
  },
  defaultVariants: { done: false },
});

export const problemBody = cva("flex flex-wrap items-center justify-between gap-3");
