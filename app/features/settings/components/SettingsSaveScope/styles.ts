import { cva } from "class-variance-authority";

export const pageSaveBar = cva(
  "border-fg/10 bg-surface/80 sticky bottom-0 z-20 mt-auto flex items-center justify-end gap-3 border-t px-4 py-3 backdrop-blur sm:px-6"
);

export const pageSaveBarSummary = cva("text-fg/70 mr-auto flex min-w-0 flex-col text-sm sm:flex-row sm:gap-2");

export const pageSaveBarNames = cva("text-fg/45 truncate text-xs sm:self-center");

export const leaveDialogContent = cva("flex flex-col gap-5 sm:max-w-md");

export const leaveDialogFooter = cva("gap-2");
