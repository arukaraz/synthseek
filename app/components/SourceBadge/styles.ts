import { cva } from "class-variance-authority";

export const sourceBadge = cva(
  "text-11 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 leading-none font-semibold whitespace-nowrap",
  {
    variants: {
      inactive: {
        true: "border-fg/25 text-fg/55 border-dashed bg-transparent",
        false: "border-fg/10 bg-fg/5 text-fg",
      },
    },
    defaultVariants: { inactive: false },
  }
);

export const sourceDot = cva("source-dot size-1.75 shrink-0 rounded-full", {
  variants: {
    inactive: {
      true: "opacity-45",
      false: "",
    },
  },
  defaultVariants: { inactive: false },
});
