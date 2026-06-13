import { cva } from "class-variance-authority";

export const sidebarShell = cva("flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1");

export const sidebarHeader = cva("border-fg/10 flex items-center justify-between border-b pb-3");
export const sidebarTitle = cva("text-fg/90 text-sm font-semibold tracking-wide uppercase");
export const clearButton = cva(
  "text-fg/50 hover:bg-fg/5 hover:text-fg rounded px-2 py-0.5 text-xs transition-colors disabled:opacity-0"
);

export const group = cva("flex flex-col gap-2");
export const groupLabel = cva("text-fg/60 text-[11px] font-semibold tracking-wider uppercase");
export const groupSearch = cva("mb-1");
export const groupList = cva("flex flex-col gap-1");
export const groupEmpty = cva("text-fg/40 px-1 py-1 text-xs");
export const groupMore = cva("text-fg/40 px-1 pt-1 text-[11px]");

export const facetRow = cva(
  "group flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm transition-colors",
  {
    variants: {
      checked: { true: "text-fg", false: "text-fg/70 hover:bg-fg/[0.03] hover:text-fg" },
    },
    defaultVariants: { checked: false },
  }
);

export const facetLabel = cva("min-w-0 flex-1 truncate");
export const facetCount = cva("text-fg/40 font-mono text-[11px] tabular-nums");
