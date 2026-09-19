import { cva } from "class-variance-authority";

export const checkboxPreview = cva("", {
  variants: {
    preview: {
      none: "",
      select: "ring-primary-400 ring-2",
      clear: "ring-fg/40 ring-2",
    },
  },
  defaultVariants: {
    preview: "none",
  },
});
