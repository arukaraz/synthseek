import { cva } from "class-variance-authority";

export const loadingDots = cva("loading-dots text-current", {
  variants: {
    size: {
      sm: "[--loading-dot-size:0.25rem] [--loading-dot-gap:0.2rem]",
      md: "[--loading-dot-size:0.3rem] [--loading-dot-gap:0.25rem]",
      lg: "[--loading-dot-size:0.45rem] [--loading-dot-gap:0.35rem]",
    },
  },
  defaultVariants: { size: "md" },
});
