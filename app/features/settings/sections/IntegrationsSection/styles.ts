import { cva } from "class-variance-authority";

export const noticeList = cva("flex flex-col gap-1");

export const noticeLink = cva("underline underline-offset-2 hover:opacity-80");

export const validationError = cva(
  "flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-200"
);

export const disabledOverlay = cva("flex flex-col gap-4 transition-opacity", {
  variants: {
    disabled: {
      true: "pointer-events-none opacity-40",
      false: "opacity-100",
    },
  },
  defaultVariants: { disabled: false },
});

export const stagedListHeader = cva("flex items-center justify-between gap-3");

export const stagedList = cva("flex max-h-96 flex-col gap-2 overflow-y-auto pr-1");

export const stagedRow = cva("border-fg/10 bg-fg/[0.03] flex items-start gap-3 rounded-lg border p-3");

export const stagedRowBody = cva("flex min-w-0 flex-1 flex-col gap-1");

export const stagedTitle = cva("text-fg/90 truncate text-sm");

export const stagedMeta = cva("text-fg/55 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs");
