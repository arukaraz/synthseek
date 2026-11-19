import { cva } from "class-variance-authority";

export const releaseActionButton = cva("", {
  variants: { compact: { true: "size-9 px-0", false: "" } },
  defaultVariants: { compact: false },
});

export const moreTrigger = cva(
  "text-fg-muted hover:bg-fg/10 hover:text-fg focus-visible:ring-primary-400 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2"
);

export const moreItemDanger = cva(
  "text-destructive-vivid hover:bg-destructive-vivid/10 hover:text-destructive-vivid focus:bg-destructive-vivid/10 focus:text-destructive-vivid active:bg-destructive-vivid/15 gap-2.5 py-2.5"
);

export const moreItemHint = cva("text-fg-muted block text-xs");
