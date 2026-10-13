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

export const cardNotice = cva("text-warning-vivid text-xs");

export const orderRow = cva("border-fg/10 bg-fg/[0.03] flex items-center gap-3 rounded-lg border px-3 py-2");

export const orderPosition = cva("text-fg/50 w-4 text-center text-xs tabular-nums");

export const downloadedAlbumsLink = cva("text-primary-400 text-sm underline-offset-2 hover:underline");
