import { cva } from "class-variance-authority";

export const toolbarRow = cva("flex items-center gap-2");
export const searchBox = cva("relative min-w-0 flex-1");
export const searchIcon = cva("text-fg/40 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2");
export const searchField = cva("pl-9");

export const controlButton = cva(
  "border-fg/10 bg-fg/[0.03] text-fg/70 hover:bg-fg/[0.06] hover:text-fg inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors"
);

export const filtersBadge = cva(
  "bg-primary-500/20 text-primary-400 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold"
);
