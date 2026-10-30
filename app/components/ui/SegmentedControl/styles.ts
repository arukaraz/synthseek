import { cva } from "class-variance-authority";

export const segmentedControl = cva("border-fg/15 bg-fg/5 inline-flex shrink-0 rounded-lg border p-0.5");

export const segmentedOption = cva("rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors", {
  variants: {
    active: {
      true: "bg-primary-500/20 text-primary-400",
      false: "text-fg/55 hover:text-fg/85",
    },
  },
  defaultVariants: { active: false },
});
