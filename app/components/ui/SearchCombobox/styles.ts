import { cva } from "class-variance-authority";

export const comboRoot = cva("relative w-full min-w-0");

export const comboIcon = cva("text-fg/50 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2");

export const comboInput = cva("w-full pl-9");

export const comboList = cva(
  "border-fg/15 bg-surface absolute top-full right-0 left-0 z-30 mt-1 flex max-h-60 flex-col overflow-y-auto rounded-lg border p-1 shadow-lg"
);

export const comboOption = cva("flex min-w-0 items-baseline gap-2 rounded-md px-2 py-1.5 text-left text-sm", {
  variants: {
    active: {
      true: "bg-fg/10 text-fg",
      false: "text-fg/80 hover:bg-fg/5",
    },
  },
  defaultVariants: { active: false },
});

export const comboLabel = cva("min-w-0 truncate");

export const comboHint = cva("text-fg/50 min-w-0 truncate text-xs");

export const comboEmpty = cva("text-fg/60 px-2 py-1.5 text-sm");
