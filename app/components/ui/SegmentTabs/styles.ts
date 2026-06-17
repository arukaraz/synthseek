import { cva } from "class-variance-authority";

export const segmentTabsRoot = cva("border-fg/10 flex items-center gap-1 border-b");

export const segmentTab = cva(
  "relative flex h-9 items-center gap-1.5 rounded-t-md px-3 text-sm font-medium transition-colors",
  {
    variants: {
      active: {
        true: "text-fg",
        false: "text-fg/55 hover:text-fg/85 hover:bg-fg/5",
      },
    },
    defaultVariants: { active: false },
  }
);

export const segmentTabCount = cva(
  "bg-fg/10 text-fg/70 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
  {
    variants: {
      active: {
        true: "bg-primary-500/20 text-primary-200",
        false: "",
      },
    },
    defaultVariants: { active: false },
  }
);

export const segmentTabUnderline = cva("bg-primary-500 absolute inset-x-3 -bottom-px h-[2px] rounded-full");
