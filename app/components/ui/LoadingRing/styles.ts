import { cva } from "class-variance-authority";

export const loadingRing = cva("pointer-events-none absolute inset-0 -rotate-90 text-current", {
  variants: {
    spinning: {
      true: "animate-loading-ring",
      false: "",
    },
  },
  defaultVariants: { spinning: true },
});
