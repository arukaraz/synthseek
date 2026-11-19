import { cva } from "class-variance-authority";

export const bodyColumn = cva("flex min-h-0 flex-1 flex-col");

export const selectRow = cva("border-fg/10 flex items-center justify-between gap-3 border-b px-4 py-2");

export const selectAllLabel = cva("text-fg flex cursor-pointer items-center gap-2 text-sm font-medium");

export const selectedCount = cva("text-fg-muted text-xs");

export const candidateList = cva("flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2");

export const candidateRow = cva(
  "hover:bg-fg/[0.05] flex min-w-0 cursor-pointer items-center gap-3 rounded-lg px-2 py-2"
);

export const candidateAvatar = cva("bg-fg/10 relative size-9 shrink-0 overflow-hidden rounded-full");

export const candidateCopy = cva("flex min-w-0 flex-1 flex-col");

export const candidateName = cva("text-fg truncate text-sm font-medium");

export const candidatePlays = cva("text-fg-muted text-xs");

export const footerStack = cva("flex flex-col gap-3 px-4 pt-3 pb-1");

export const switchRow = cva("flex items-start justify-between gap-3");

export const switchCopy = cva("flex min-w-0 flex-col gap-0.5");

export const switchLabel = cva("text-fg text-sm font-medium");

export const footerHint = cva("text-fg-muted text-xs");

export const footerError = cva("text-destructive-vivid text-xs");

export const footerButtons = cva("flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end");

export const statusBlock = cva("text-fg-muted flex flex-col items-center gap-3 px-6 py-10 text-center text-sm");
