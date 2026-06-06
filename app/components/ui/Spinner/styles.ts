import { cva } from "class-variance-authority";

export const spinnerRing = cva("branded-loader-ring animate-loading-ring rounded-full border-transparent", {
  variants: {
    size: {
      sm: "size-4 border-2",
      md: "size-6 border-2",
      lg: "size-10 border-2",
      xl: "size-16 border-[3px]",
      fill: "absolute inset-0 border-2",
    },
  },
  defaultVariants: { size: "md" },
});
