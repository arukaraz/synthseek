import { cva } from "class-variance-authority";

export const viewThumb = cva("block h-10 w-full");

export const thumbFill = cva("", {
  variants: {
    tone: {
      primary: "fill-primary-400",
      muted: "fill-fg/20",
      faint: "fill-fg/10",
      accent: "fill-accent-400",
      success: "fill-success-vivid",
    },
  },
});

export const thumbStroke = cva("fill-none stroke-2", {
  variants: {
    tone: {
      primary: "stroke-primary-400",
      muted: "stroke-fg/20",
      faint: "stroke-fg/10",
      accent: "stroke-accent-400",
      success: "stroke-success-vivid",
    },
  },
});
