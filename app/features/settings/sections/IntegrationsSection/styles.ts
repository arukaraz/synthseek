import { cva } from "class-variance-authority";

export const noticeList = cva("flex flex-col gap-1");

export const noticeLink = cva("underline underline-offset-2 hover:opacity-80");

export const subSection = cva("flex flex-col gap-4 border-t border-fg/10 pt-5");

export const subSectionHeader = cva("flex items-start justify-between gap-3");

export const subSectionHeaderText = cva("flex flex-col gap-0.5");

export const validationError = cva(
  "flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-200"
);

export const subSectionTitle = cva("text-fg text-sm font-semibold");

export const subSectionDescription = cva("text-fg/60 text-xs");

export const copyRow = cva("flex items-stretch gap-2");

export const disabledOverlay = cva("flex flex-col gap-4 transition-opacity", {
  variants: {
    disabled: {
      true: "pointer-events-none opacity-40",
      false: "opacity-100",
    },
  },
  defaultVariants: { disabled: false },
});
