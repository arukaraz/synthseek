import { cva } from "class-variance-authority";

export const segmentedControl = cva("border-fg/15 bg-fg/5 rounded-lg border p-0.5", {
  variants: {
    block: {
      true: "flex w-full gap-0.5",
      false: "inline-flex shrink-0",
    },
  },
  defaultVariants: { block: false },
});

export const segmentedOption = cva("rounded-md text-xs font-medium whitespace-nowrap transition-colors", {
  variants: {
    unavailable: {
      true: "cursor-not-allowed opacity-40",
      false: "",
    },
    active: {
      true: "bg-primary-500/20 text-primary-400",
      false: "text-fg/55 hover:text-fg/85",
    },
    block: {
      true: "min-h-9 min-w-0 flex-1 px-2 py-1.5",
      false: "px-3 py-1",
    },
  },
  defaultVariants: { active: false, block: false, unavailable: false },
});
