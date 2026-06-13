import { cva } from "class-variance-authority";

export const sheetContent = cva("flex flex-col gap-0 p-0");

export const sheetHeader = cva("border-fg/10 flex items-center justify-between border-b px-4 py-3");
export const sheetTitle = cva("text-fg text-sm font-semibold");
export const sheetBody = cva(
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 max-h-[calc(85dvh-7rem)] sm:max-h-[60vh]"
);
export const sheetFooter = cva("border-fg/10 border-t px-4 py-3");
