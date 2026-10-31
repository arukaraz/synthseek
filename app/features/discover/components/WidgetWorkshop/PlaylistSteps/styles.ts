import { cva } from "class-variance-authority";

export const stack = cva("flex min-w-0 flex-1 flex-col gap-2");

export const line = cva("flex min-w-0 flex-wrap items-center gap-2 [&>button]:w-auto [&>button]:max-w-full");

export const slotRow = cva(
  "grid min-w-0 grid-cols-[18px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-1.5 @[34rem]:grid-cols-[22px_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
);

export const slotNumber = cva("text-fg/50 text-right font-mono text-[11px]");

export const slotCell = cva("min-w-0 [&>button]:w-full", {
  variants: {
    alone: {
      true: "col-span-2 @[34rem]:col-span-1",
      false: "",
    },
  },
  defaultVariants: { alone: false },
});

export const slotName = cva("col-span-2 col-start-2 min-w-0 @[34rem]:col-start-auto", {
  variants: {
    wide: {
      true: "@[34rem]:col-span-2",
      false: "@[34rem]:col-span-1",
    },
  },
  defaultVariants: { wide: false },
});

export const listOptions = cva("mt-3 flex min-w-0 flex-col gap-2");

export const whereHead = cva("flex min-h-10 min-w-0 items-center justify-between gap-2");

export const whereTools = cva("ml-auto flex shrink-0 items-center gap-1");

export const ruleItems = cva("border-fg/10 divide-fg/10 flex flex-col divide-y overflow-hidden rounded-lg border");

export const ruleItem = cva("bg-fg/[0.03] flex min-w-0 items-center gap-2 py-1 pr-1 pl-1");

export const slotActions = cva(
  "col-span-2 col-start-2 flex justify-end gap-1 @[34rem]:col-span-1 @[34rem]:col-start-auto"
);

export const slotMessage = cva("text-warning-vivid col-span-full -mt-0.5 pl-6 text-[11.5px]");

export const hint = cva("text-fg/60 text-xs");

export const lengthSlider = cva("accent-primary-500 w-40 max-w-full");

export const lengthValue = cva("text-fg text-sm font-semibold tabular-nums");

export const dayRow = cva("bg-fg/5 inline-flex flex-wrap gap-0.5 rounded-lg p-0.5");

export const dayChip = cva(
  "focus-visible:ring-primary-400 rounded-md px-2.5 py-1 text-xs font-medium outline-none focus-visible:ring-2",
  {
    variants: {
      selected: {
        true: "bg-primary-500/25 text-primary-400",
        false: "text-fg/60 hover:text-fg",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const clockInput = cva("w-36 tabular-nums");

export const tagList = cva("flex flex-wrap gap-1.5");

export const tag = cva(
  "inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border py-0.5 pr-1 pl-2.5 text-xs",
  {
    variants: {
      allowed: {
        true: "border-fg/15 text-fg/60 border-dashed [&>span:first-child]:line-through",
        false: "border-fg/20 text-fg",
      },
    },
    defaultVariants: { allowed: false },
  }
);

export const tagText = cva("min-w-0 truncate");
