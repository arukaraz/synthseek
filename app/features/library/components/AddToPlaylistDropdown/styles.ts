import { cva } from "class-variance-authority";

export const dropdownContent = cva("text-fg flex w-64 flex-col p-0 text-sm");

export const scrollList = cva("max-h-64 overflow-y-auto p-2");

export const playlistItem = cva(
  "text-fg/70 hover:bg-fg/10 hover:text-fg focus-visible:bg-fg/10 focus-visible:text-fg flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50"
);

export const playlistItemName = cva("min-w-0 flex-1 truncate");
export const playlistItemCount = cva("text-fg/40 shrink-0 font-mono text-xs tabular-nums");

export const loadingRow = cva("flex items-center justify-center px-3 py-6");
export const emptyState = cva("text-fg/40 px-3 py-6 text-center");

export const separator = cva("bg-fg/10 h-px shrink-0");

export const footer = cva("flex items-center gap-2 p-2");
