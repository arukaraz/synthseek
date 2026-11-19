import { cva } from "class-variance-authority";

export const releaseState = cva("text-fg inline-flex min-w-0 items-center gap-1.5 text-xs font-medium");

export const releaseStateGlyph = cva("size-3.5 shrink-0", {
  variants: { warning: { true: "text-warning-vivid", false: "text-fg-muted" } },
  defaultVariants: { warning: false },
});

export const releaseStateLabel = cva("truncate");

export const releaseStateTrigger = cva(
  "focus-visible:ring-primary-400 inline-flex size-6 items-center justify-center rounded-md outline-none focus-visible:ring-2"
);
