import { cva } from "class-variance-authority";

export const filterSortTriggerDefault = cva(
  "inline-flex h-9 items-center gap-2 rounded-lg border border-fg/10 bg-fg/5 px-3 text-sm text-fg/70 transition-colors hover:bg-fg/10 hover:text-fg"
);

export const filterSortCount = cva("text-fg/40 font-mono text-[10px]");

export const filterSortOrderRow = cva("flex gap-1 px-2 pb-2");

export const filterSortOrderBtn = cva(
  "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors",
  {
    variants: {
      active: {
        true: "border-primary-500/40 bg-primary-500/15 text-primary-200",
        false: "border-fg/10 bg-fg/5 text-fg/60 hover:bg-fg/10 hover:text-fg",
      },
    },
    defaultVariants: { active: false },
  }
);
