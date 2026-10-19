import { cva } from "class-variance-authority";

export const fadeScroll = cva("min-w-0", {
  variants: {
    axis: {
      x: "overflow-x-auto overscroll-x-contain",
      y: "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain",
    },
  },
  defaultVariants: { axis: "y" },
});
