import { cva } from "class-variance-authority";

export const sheetContent = cva(
  "bg-surface/95 sm:bg-surface/90 flex max-h-[85dvh] flex-col gap-0 p-0 sm:max-w-sm sm:backdrop-blur-2xl"
);

export const sheetHeader = cva("border-fg/10 flex items-center justify-between border-b px-4 py-3");
export const sheetTitle = cva("text-fg text-sm font-semibold");
export const sheetBody = cva("min-h-0 flex-1 overflow-y-auto px-4 py-4");
export const sheetFooter = cva("border-fg/10 border-t px-4 py-3");
