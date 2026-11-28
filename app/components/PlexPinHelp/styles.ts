import { cva } from "class-variance-authority";

export const plexPinHelp = cva("flex flex-col items-start gap-2");

export const plexPinCopy = cva("gap-1.5");

export const plexPinWarning = cva("text-warning-vivid text-sm", {
  variants: {
    visible: {
      true: "",
      false: "sr-only",
    },
  },
  defaultVariants: { visible: false },
});
