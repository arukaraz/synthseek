import { cva } from "class-variance-authority";

export const inputVariants = cva(
  "border-fg/15 bg-fg/5 text-fg placeholder:text-fg/30 focus:border-primary-500/50 focus:ring-primary-500/30 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      size: {
        default: "h-10",
        sm: "h-9 text-xs",
        lg: "h-11",
      },
    },
    defaultVariants: { size: "default" },
  }
);
